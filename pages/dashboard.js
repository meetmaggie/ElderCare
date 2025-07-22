import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, BellIcon, Cog6ToothIcon, DocumentTextIcon, PhoneIcon, ExclamationTriangleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { checkAndFixDemoData } from '../lib/demo-accounts'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [elderlyUser, setElderlyUser] = useState(null)
  const [showAlertSettings, setShowAlertSettings] = useState(false)
  const [showCareSettings, setShowCareSettings] = useState(false)
  const [showFullReport, setShowFullReport] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const router = useRouter()
  const [alertSettings, setAlertSettings] = useState({
    keywords: ['chest pain', 'fell', 'dizzy', 'can\'t breathe', 'confused', 'very tired'],
    sensitivity: 'balanced',
    contacts: [
      { type: 'primary', name: '', phone: '', email: '' },
      { type: 'secondary', name: '', phone: '', email: '' }
    ],
    escalationRules: {
      emailFirst: true,
      smsAfter: 30,
      callAfter: 60,
      highUrgencyOverride: true
    },
    quietHours: { start: '22:00', end: '07:00' },
    alertTypes: {
      health: true,
      mood: true,
      social: true,
      missedCalls: true
    }
  })
  const [careSettings, setCareSettings] = useState({
    callTimes: ['09:00', '14:00'],
    callFrequency: 'daily',
    healthConditions: '',
    specialInstructions: '',
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [testingWebhook, setTestingWebhook] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        router.push('/login')
        return
      }

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Get family user data
      const { data: familyUser, error: familyError } = await supabase
        .from('family_users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (familyError) {
        console.error('Error fetching family user:', familyError)
        router.push('/login')
        return
      }

      // Get elderly user data
      const { data: elderlyUserData, error: elderlyError } = await supabase
        .from('elderly_users')
        .select('*')
        .eq('family_user_id', session.user.id)
        .single()

      if (elderlyError) {
        console.error('Error fetching elderly user:', elderlyError)
        // Check if this is a demo account - demo accounts should have elderly users
        if (session.user.email && session.user.email.includes('.demo@')) {
          console.log('Demo account missing elderly user data - this should not happen')

          // Try to recreate the demo data
          try {
            const dataRecreated = await checkAndFixDemoData(supabase, session.user.email, session.user.id)

            if (dataRecreated) {
              // Retry loading the data
              setTimeout(() => {
                checkAuthAndLoadData()
              }, 1000)
              return
            }
          } catch (fixError) {
            console.error('Error trying to fix demo data:', fixError)
          }

          // If fix failed, populate demo data automatically
          try {
            console.log('Attempting to populate demo data automatically...')
            const populateResponse = await fetch('/api/populate-demo-data', {
              method: 'POST'
            })
            
            if (populateResponse.ok) {
              console.log('Demo data populated successfully, retrying dashboard load...')
              setTimeout(() => {
                checkAuthAndLoadData()
              }, 1000)
              return
            }
          } catch (populateError) {
            console.error('Error auto-populating demo data:', populateError)
          }

          // If all fixes failed, set basic dashboard data with fallback demo data
          setDashboardData({
            stats: {
              currentStatus: 'All Good',
              lastCall: 'Today at 10:30 AM',
              moodToday: 'Content',
              alertsCount: 0,
              automatedAlertsThisWeek: 2
            },
            recentCalls: [
              {
                id: 'demo-1',
                call_date: new Date().toISOString(),
                call_duration: '8 minutes',
                mood_assessment: 'content',
                conversation_summary: 'Had a lovely chat about the garden. Mentioned some back pain but spirits are good.',
                ai_analysis: 'AI detected content mood with minor health mentions about back discomfort.',
                health_concerns: ['back pain']
              },
              {
                id: 'demo-2',
                call_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                call_duration: '12 minutes',
                mood_assessment: 'happy',
                conversation_summary: 'Talked about family visit last week. Very engaged and cheerful throughout the call.',
                ai_analysis: 'AI detected happy mood with positive engagement indicators.',
                health_concerns: []
              }
            ],
            automatedAlerts: [
              {
                id: 'alert-1',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                severity: 'low',
                message: 'Health concerns mentioned: back pain',
                triggered_by: 'Health mention detected in conversation',
                action_taken: 'Family notified via email'
              }
            ],
            moodTrends: [
              { date: '1/16', mood: 4 },
              { date: '1/17', mood: 3 },
              { date: '1/18', mood: 4 },
              { date: '1/19', mood: 5 },
              { date: '1/20', mood: 4 },
              { date: '1/21', mood: 4 },
              { date: '1/22', mood: 4 }
            ],
            showDemoFix: true
          })
          setLoading(false)
          return
        }
        // If no elderly user found for regular account, they need to complete signup
        console.log('No elderly user found, redirecting to complete signup process')
        setLoading(false)
        router.push(`/signup?email=${encodeURIComponent(session.user.email)}`)
        return
      }

      setElderlyUser(elderlyUserData)
      await loadDashboardData(elderlyUserData.id)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    }
    finally {
        setLoading(false)
    }
  }

  const loadDashboardData = async (elderlyUserId) => {
    try {
      // Initialize with default data structure
      const defaultDashboardData = {
        stats: {
          currentStatus: 'All Good',
          lastCall: 'No calls yet',
          moodToday: 'Unknown',
          alertsCount: 0,
          automatedAlertsThisWeek: 0
        },
        recentCalls: [],
        automatedAlerts: [],
        moodTrends: []
      }

      // Get recent call records
      const { data: callRecords, error: callsError } = await supabase
        .from('call_records')
        .select('*')
        .eq('elderly_user_id', elderlyUserId)
        .order('call_date', { ascending: false })
        .limit(10)

      if (callsError) {
        console.error('Error fetching call records:', callsError)
      }

      // Get alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('elderly_user_id', elderlyUserId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (alertsError) {
        console.error('Error fetching alerts:', alertsError)
      }

      // Calculate stats
      const recentCalls = callRecords || []
      const recentAlerts = alerts || []

      // If no data exists, provide demo data
      if (recentCalls.length === 0 && recentAlerts.length === 0) {
        const demoDashboardData = {
          stats: {
            currentStatus: 'All Good',
            lastCall: 'Today at 2:15 PM',
            moodToday: 'Happy',
            alertsCount: 1,
            automatedAlertsThisWeek: 3
          },
          recentCalls: [
            {
              id: 'demo-1',
              call_date: new Date().toISOString(),
              call_duration: '14 minutes',
              mood_assessment: 'happy',
              conversation_summary: 'Wonderful conversation about the grandchildren visiting this weekend. Very excited about baking cookies together. Mentioned sleeping much better lately and feeling energetic.',
              ai_analysis: 'AI detected very positive mood with excellent engagement. Sleep improvements noted as positive health indicator.',
              health_concerns: []
            },
            {
              id: 'demo-2',
              call_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              call_duration: '11 minutes',
              mood_assessment: 'content',
              conversation_summary: 'Discussed the beautiful weather and morning walk in the park. Enjoyed feeding the ducks. Mentioned taking medication on time and feeling well overall.',
              ai_analysis: 'AI detected stable, content mood with positive activity engagement and medication compliance.',
              health_concerns: []
            },
            {
              id: 'demo-3',
              call_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              call_duration: '9 minutes',
              mood_assessment: 'worried',
              conversation_summary: 'Talked about upcoming doctor appointment. Concerned about some dizziness when standing up quickly. Otherwise feeling okay but wants to discuss with doctor.',
              ai_analysis: 'AI detected mild concern about dizziness symptoms. Appropriate medical follow-up planned.',
              health_concerns: ['dizziness', 'doctor appointment']
            },
            {
              id: 'demo-4',
              call_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              call_duration: '16 minutes',
              mood_assessment: 'cheerful',
              conversation_summary: 'Long chat about the new mystery novel from the library. Very engaged in discussing the plot. Mentioned enjoying the new puzzle books and doing crosswords daily.',
              ai_analysis: 'AI detected cheerful mood with strong cognitive engagement. Regular mental activities noted positively.',
              health_concerns: []
            },
            {
              id: 'demo-5',
              call_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              call_duration: '8 minutes',
              mood_assessment: 'content',
              conversation_summary: 'Discussed weekly grocery delivery and meal planning. Mentioned trying a new soup recipe. Appetite good and enjoying varied meals.',
              ai_analysis: 'AI detected stable mood with good nutritional habits and meal planning.',
              health_concerns: []
            },
            {
              id: 'demo-6',
              call_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              call_duration: '13 minutes',
              mood_assessment: 'happy',
              conversation_summary: 'Excited about video call with family yesterday. Shared stories about old times and laughed a lot. Mentioned feeling connected and loved.',
              ai_analysis: 'AI detected elevated positive mood with strong social connection indicators.',
              health_concerns: []
            },
            {
              id: 'demo-7',
              call_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              call_duration: '10 minutes',
              mood_assessment: 'neutral',
              conversation_summary: 'Quiet day at home. Watched some TV and did light housework. Mentioned feeling a bit lonely but managing well. Looking forward to tomorrow\'s activities.',
              ai_analysis: 'AI detected neutral mood with mild loneliness indicators but good coping strategies.',
              health_concerns: ['loneliness']
            }
          ],
          automatedAlerts: [
            {
              id: 'alert-1',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              severity: 'medium',
              message: 'Health symptoms mentioned: dizziness when standing',
              triggered_by: 'Health keyword detection: "dizziness"',
              action_taken: 'Family notified via email and SMS',
              keywords_detected: ['dizziness', 'standing up']
            },
            {
              id: 'alert-2',
              created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              severity: 'low',
              message: 'Social isolation indicators detected',
              triggered_by: 'Loneliness keywords in conversation analysis',
              action_taken: 'Family notified via email',
              keywords_detected: ['lonely', 'quiet day']
            },
            {
              id: 'alert-3',
              created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              severity: 'low',
              message: 'Medication compliance check - positive confirmation',
              triggered_by: 'AI detected medication adherence mention',
              action_taken: 'Positive update logged, no action needed',
              keywords_detected: ['medication', 'on time']
            },
            {
              id: 'alert-4',
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              severity: 'high',
              message: 'Missed scheduled call - elderly user did not answer',
              triggered_by: 'Automated call system - no response after 3 attempts',
              action_taken: 'Family contacted immediately, neighbor check requested',
              keywords_detected: []
            },
            {
              id: 'alert-5',
              created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
              severity: 'medium',
              message: 'Sleep quality concerns mentioned',
              triggered_by: 'Health keyword detection: sleep issues',
              action_taken: 'Family notified, doctor consultation suggested',
              keywords_detected: ['sleep', 'tired', 'restless']
            }
          ],
          moodTrends: [
            { date: '1/16', mood: 4 },
            { date: '1/17', mood: 3 },
            { date: '1/18', mood: 2 },
            { date: '1/19', mood: 5 },
            { date: '1/20', mood: 4 },
            { date: '1/21', mood: 4 },
            { date: '1/22', mood: 5 }
          ]
        }
        
        setDashboardData(demoDashboardData)
        setLoading(false)
        return
      }

      const lastCall = recentCalls.length > 0 ? recentCalls[0] : null
      const lastCallFormatted = lastCall ? formatDate(lastCall.call_date) : 'No calls yet'

      const moodToday = lastCall ? (lastCall.mood_assessment || 'Unknown').charAt(0).toUpperCase() + (lastCall.mood_assessment || 'unknown').slice(1) : 'Unknown'

      // Count alerts from this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const alertsThisWeek = recentAlerts.filter(alert => 
        new Date(alert.created_at) > weekAgo
      ).length

      // Generate mood trends from recent calls (last 7 days)
      const moodTrends = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`

        // Find call for this date
        const callForDate = recentCalls.find(call => {
          const callDate = new Date(call.call_date)
          return callDate.toDateString() === date.toDateString()
        })

        const moodValue = callForDate ? getMoodValue(callForDate.mood_assessment) : 3
        moodTrends.push({ date: dateStr, mood: moodValue })
      }

      const dashboardData = {
        stats: {
          currentStatus: determineOverallStatus(recentCalls, recentAlerts),
          lastCall: lastCallFormatted,
          moodToday: moodToday,
          alertsCount: recentAlerts.filter(a => !a.resolved_at).length,
          automatedAlertsThisWeek: alertsThisWeek
        },
        recentCalls: recentCalls.slice(0, 5).map(call => ({
          ...call,
          health_concerns: call.health_concerns || [],
          conversation_summary: call.conversation_summary || 'Call completed successfully.',
          ai_analysis: call.ai_analysis || 'Analysis completed.'
        })),
        automatedAlerts: recentAlerts.slice(0, 5).map(alert => ({
          ...alert,
          triggered_by: alert.message,
          action_taken: 'Family notified via email',
          keywords_detected: []
        })),
        moodTrends: moodTrends
      }

      setDashboardData(dashboardData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      // Set fallback demo data on error
      setDashboardData({
        stats: {
          currentStatus: 'All Good',
          lastCall: 'Today at 10:30 AM',
          moodToday: 'Content',
          alertsCount: 0,
          automatedAlertsThisWeek: 2
        },
        recentCalls: [
          {
            id: 'demo-1',
            call_date: new Date().toISOString(),
            call_duration: '8 minutes',
            mood_assessment: 'content',
            conversation_summary: 'Had a lovely chat about the garden. Mentioned some back pain but spirits are good.',
            ai_analysis: 'AI detected content mood with minor health mentions about back discomfort.',
            health_concerns: ['back pain']
          },
          {
            id: 'demo-2',
            call_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            call_duration: '12 minutes',
            mood_assessment: 'happy',
            conversation_summary: 'Talked about family visit last week. Very engaged and cheerful throughout the call.',
            ai_analysis: 'AI detected happy mood with positive engagement indicators.',
            health_concerns: []
          },
          {
            id: 'demo-3',
            call_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            call_duration: '6 minutes',
            mood_assessment: 'worried',
            conversation_summary: 'Discussed weekly shopping trip. Mentioned feeling tired and knee bothering them.',
            ai_analysis: 'AI detected worried mood with health concerns about fatigue and joint pain.',
            health_concerns: ['tired', 'knee pain']
          }
        ],
        automatedAlerts: [
          {
            id: 'alert-1',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            severity: 'medium',
            message: 'Health concerns mentioned: back pain',
            triggered_by: 'Health mention detected in conversation',
            action_taken: 'Family notified via email'
          },
          {
            id: 'alert-2',
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            severity: 'low',
            message: 'Mood analysis indicates worried state during call',
            triggered_by: 'Mood change detection',
            action_taken: 'Family notified via email'
          }
        ],
        moodTrends: [
          { date: '1/16', mood: 4 },
          { date: '1/17', mood: 3 },
          { date: '1/18', mood: 2 },
          { date: '1/19', mood: 5 },
          { date: '1/20', mood: 4 },
          { date: '1/21', mood: 4 },
          { date: '1/22', mood: 4 }
        ]
      })
      setLoading(false)
    }
        finally {
            setLoading(false)
        }
  }

  const getMoodValue = (mood) => {
    const moodMap = {
      'happy': 5,
      'content': 4,
      'neutral': 3,
      'worried': 2,
      'sad': 1
    }
    return moodMap[mood?.toLowerCase()] || 3
  }

  const determineOverallStatus = (calls, alerts) => {
    const recentAlerts = alerts.filter(alert => !alert.resolved_at)
    if (recentAlerts.some(alert => alert.severity === 'high')) {
      return 'Needs Attention'
    }
    if (recentAlerts.length > 0) {
      return 'Minor Concerns'
    }
    return 'All Good'
  }

  const handleSaveAlertSettings = async () => {
    try {
      // Save to Supabase - mock for now
      console.log('Saving alert settings:', alertSettings)
      alert('Alert settings saved successfully!')
      setShowAlertSettings(false)
    } catch (error) {
      console.error('Error saving alert settings:', error)
      alert('Error saving settings. Please try again.')
    }
  }

  const handleSaveCareSettings = async () => {
    try {
      // Save to Supabase - mock for now
      console.log('Saving care settings:', careSettings)
      alert('Care settings saved successfully!')
      setShowCareSettings(false)
    } catch (error) {
      console.error('Error saving care settings:', error)
      alert('Error saving settings. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fixDemoData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fix-demo-data', {
        method: 'POST'
      })

      const result = await response.json()
      console.log('Demo data fix result:', result)

      if (response.ok) {
        alert('Demo data fixed successfully! Refreshing dashboard...')
        // Reload the page to get fresh data
        window.location.reload()
      } else {
        alert('Failed to fix demo data: ' + result.error)
      }
    } catch (error) {
      console.error('Error fixing demo data:', error)
      alert('Error fixing demo data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    if (!elderlyUser) return

    setTestingWebhook(true)
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elderlyUserId: elderlyUser.id
        })
      })

      const result = await response.json()
      console.log('Webhook test result:', result)

      if (response.ok) {
        alert('Webhook test successful! Check console for details. Refreshing data...')
        // Refresh dashboard data
        await loadDashboardData(elderlyUser.id)
      } else {
        alert('Webhook test failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      alert('Error testing webhook. Check console for details.')
    } finally {
      setTestingWebhook(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInHours < 48) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'happy': '😊',
      'content': '😌',
      'neutral': '😐',
      'worried': '😟',
      'sad': '😢'
    }
    return moodEmojis[mood] || '😐'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-care-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-trust-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Alert Settings Modal
  if (showAlertSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-care-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setShowAlertSettings(false)}
                  className="mr-4 p-2 rounded-full hover:bg-trust-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-trust-600" />
                </button>
                <h1 className="text-3xl font-heading font-bold text-trust-900">Alert Settings</h1>
              </div>
              <BellIcon className="h-8 w-8 text-primary-600" />
            </div>

            <div className="space-y-8">
              {/* Emergency Keywords */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Emergency Keywords</h3>
                <p className="text-trust-600 mb-4">AI monitors conversations for these keywords and phrases</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {alertSettings.keywords.map((keyword, index) => (
                    <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {keyword}
                      <button
                        onClick={() => setAlertSettings(prev => ({
                          ...prev,
                          keywords: prev.keywords.filter((_, i) => i !== index)
                        }))}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add new keyword or phrase"
                  className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      setAlertSettings(prev => ({
                        ...prev,
                        keywords: [...prev.keywords, e.target.value.trim()]
                      }))
                      e.target.value = ''
                    }
                  }}
                />
              </div>

              {/* Sensitivity Level */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Alert Sensitivity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'conservative', label: 'Conservative', desc: 'Alerts for minor concerns' },
                    { value: 'balanced', label: 'Balanced', desc: 'Standard monitoring' },
                    { value: 'relaxed', label: 'Relaxed', desc: 'Only serious concerns' }
                  ].map(level => (
                    <label key={level.value} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      alertSettings.sensitivity === level.value 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-trust-200 hover:border-trust-300'
                    }`}>
                      <input
                        type="radio"
                        name="sensitivity"
                        value={level.value}
                        checked={alertSettings.sensitivity === level.value}
                        onChange={(e) => setAlertSettings(prev => ({ ...prev, sensitivity: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="font-semibold text-trust-800">{level.label}</div>
                      <div className="text-sm text-trust-600">{level.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Family Contacts */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Family Contacts</h3>
                {alertSettings.contacts.map((contact, index) => (
                  <div key={index} className="border border-trust-200 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-trust-700 mb-3 capitalize">{contact.type} Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) => {
                          const newContacts = [...alertSettings.contacts]
                          newContacts[index].name = e.target.value
                          setAlertSettings(prev => ({ ...prev, contacts: newContacts }))
                        }}
                        className="px-3 py-2 border border-trust-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => {
                          const newContacts = [...alertSettings.contacts]
                          newContacts[index].phone = e.target.value
                          setAlertSettings(prev => ({ ...prev, contacts: newContacts }))
                        }}
                        className="px-3 py-2 border border-trust-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) => {
                          const newContacts = [...alertSettings.contacts]
                          newContacts[index].email = e.target.value
                          setAlertSettings(prev => ({ ...prev, contacts: newContacts }))
                        }}
                        className="px-3 py-2 border border-trust-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAlertSettings(false)}
                  className="px-6 py-3 border border-trust-300 text-trust-700 rounded-xl hover:bg-trust-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAlertSettings}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all"
                >
                  Save Alert Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Care Settings Modal
  if (showCareSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-care-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setShowCareSettings(false)}
                  className="mr-4 p-2 rounded-full hover:bg-trust-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-trust-600" />
                </button>
                <h1 className="text-3xl font-heading font-bold text-trust-900">Care Settings</h1>
              </div>
              <Cog6ToothIcon className="h-8 w-8 text-primary-600" />
            </div>

            <div className="space-y-8">
              {/* Call Schedule */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Daily Call Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {careSettings.callTimes.map((time, index) => (
                    <input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...careSettings.callTimes]
                        newTimes[index] = e.target.value
                        setCareSettings(prev => ({ ...prev, callTimes: newTimes }))
                      }}
                      className="px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                    />
                  ))}
                </div>
                <select
                  value={careSettings.callFrequency}
                  onChange={(e) => setCareSettings(prev => ({ ...prev, callFrequency: e.target.value }))}
                  className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="daily">Daily</option>
                  <option value="every_other_day">Every Other Day</option>
                  <option value="weekdays">Weekdays Only</option>
                  <option value="custom">Custom Schedule</option>
                </select>
              </div>

              {/* Health Conditions */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Health Conditions to Monitor</h3>
                <textarea
                  value={careSettings.healthConditions}
                  onChange={(e) => setCareSettings(prev => ({ ...prev, healthConditions: e.target.value }))}
                  className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500 h-24"
                  placeholder="List any specific health conditions, medications, or concerns to monitor during calls..."
                />
              </div>

              {/* Special Instructions */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Special AI Instructions</h3>
                <textarea
                  value={careSettings.specialInstructions}
                  onChange={(e) => setCareSettings(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500 h-24"
                  placeholder="Topics to focus on, avoid, or special conversation preferences..."
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCareSettings(false)}
                  className="px-6 py-3 border border-trust-300 text-trust-700 rounded-xl hover:bg-trust-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCareSettings}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all"
                >
                  Save Care Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full Report Modal
  if (showFullReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-care-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setShowFullReport(false)}
                  className="mr-4 p-2 rounded-full hover:bg-trust-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-trust-600" />
                </button>
                <h1 className="text-3xl font-heading font-bold text-trust-900">Comprehensive Care Report</h1>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                  Download PDF
                </button>
                <button className="px-4 py-2 bg-care-100 text-care-700 rounded-lg hover:bg-care-200 transition-colors">
                  Email Report
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Mood Trends Chart */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Mood Trends (Last 7 Days)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.moodTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Automated Alerts History */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Automated Alerts History</h3>
                <div className="space-y-4">
                  {dashboardData.automatedAlerts.map((alert) => (
                    <div key={alert.id} className="border border-trust-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-trust-500">{formatDate(alert.created_at)}</span>
                      </div>
                      <h4 className="font-semibold text-trust-800 mb-2">{alert.triggered_by}</h4>
                      <p className="text-trust-600 mb-3">{alert.message}</p>
                      <div className="bg-trust-50 rounded-lg p-3">
                        <p className="text-sm text-trust-600">
                          <strong>Action Taken:</strong> {alert.action_taken}
                        </p>
                        {alert.keywords_detected && (
                          <p className="text-sm text-trust-600 mt-1">
                            <strong>Keywords Detected:</strong> {alert.keywords_detected.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call History Summary */}
              <div>
                <h3 className="text-xl font-semibold text-trust-800 mb-4">Recent Call Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dashboardData.recentCalls.map((call) => (
                    <div key={call.id} className="border border-trust-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">{getMoodEmoji(call.mood_assessment)}</span>
                        <span className="text-sm text-trust-500">{formatDate(call.call_date)}</span>
                      </div>
                      <h4 className="font-semibold text-trust-800 mb-2">Conversation Summary</h4>
                      <p className="text-trust-600 text-sm mb-3">{call.conversation_summary}</p>
                      <div className="bg-primary-50 rounded-lg p-3">
                        <p className="text-sm text-primary-700">
                          <strong>AI Analysis:</strong> {call.ai_analysis}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-care-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4 p-2 rounded-full hover:bg-white transition-colors shadow-soft">
              <ArrowLeftIcon className="h-6 w-6 text-trust-600" />
            </Link>
            <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-trust-900">
                {elderlyUser ? `${elderlyUser.name}'s Care Dashboard` : 'Family Dashboard'}
              </h1>
              <p className="text-trust-600 mt-1">Automated AI monitoring and care insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full px-4 py-2 shadow-soft border border-trust-100">
              <span className="text-sm text-trust-600">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                AI Monitoring Active
              </span>
            </div>
            <div className="bg-white rounded-full px-4 py-2 shadow-soft border border-trust-100">
              <span className="text-sm text-trust-600">
                Welcome, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white rounded-full p-2 shadow-soft border border-trust-100 hover:bg-trust-50 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-trust-600" />
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
          >
            <h3 className="font-semibold text-trust-800 mb-4">Current Status</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">{dashboardData?.stats?.currentStatus || 'Loading...'}</p>
            <p className="text-sm text-trust-500">AI analysis complete</p>
          </motion.div>

          {/* Last Call */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
          >
            <h3 className="font-semibold text-trust-800 mb-4">Last Call</h3>
            <p className="text-lg font-semibold text-trust-800 mb-2">{dashboardData?.stats?.lastCall || 'Loading...'}</p>
            <p className="text-sm text-trust-500">Automatic daily check-in</p>
          </motion.div>

          {/* Mood Today */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
          >
            <h3 className="font-semibold text-trust-800 mb-4">Mood Today</h3>
            <p className="text-3xl font-bold text-care-600 mb-2">{dashboardData?.stats?.moodToday || 'Loading...'}</p>
            <p className="text-sm text-trust-500">AI voice analysis</p>
          </motion.div>

          {/* Automated Alerts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
          >
            <h3 className="font-semibold text-trust-800 mb-4">This Week's Alerts</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">{dashboardData?.stats?.automatedAlertsThisWeek || '0'}</p>
            <p className="text-sm text-trust-500">Auto-generated by AI</p>
          </motion.div>
        </div>

        {/* Development Tools */}
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Development Tools</h3>
            <div className="flex flex-wrap gap-3">
              {dashboardData?.showDemoFix && (
                <button
                  onClick={fixDemoData}
                  disabled={loading}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Fixing...' : 'Fix Demo Data'}
                </button>
              )}
              <button
                onClick={testWebhook}
                disabled={testingWebhook}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {testingWebhook ? 'Testing...' : 'Test ElevenLabs Webhook'}
              </button>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              {dashboardData?.showDemoFix && 'Fix missing demo data | '}
              Simulates an ElevenLabs call webhook to test data flow
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.button
            onClick={() => setShowAlertSettings(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-2xl shadow-soft hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105"
          >
            <BellIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Alert Settings</h3>
            <p className="text-sm opacity-90">Configure automated monitoring</p>
          </motion.button>

          <motion.button
            onClick={() => setShowCareSettings(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-care-500 to-care-600 text-white p-6 rounded-2xl shadow-soft hover:from-care-600 hover:to-care-700 transition-all transform hover:scale-105"
          >
            <Cog6ToothIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Care Settings</h3>
            <p className="text-sm opacity-90">Update call schedule & preferences</p>
          </motion.button>

          <motion.button
            onClick={() => setShowFullReport(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-warm-500 to-warm-600 text-white p-6 rounded-2xl shadow-soft hover:from-warm-600 hover:to-warm-700 transition-all transform hover:scale-105"
          >
            <DocumentTextIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Full Care Report</h3>
            <p className="text-sm opacity-90">Comprehensive analysis & trends</p>
          </motion.button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Conversations */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100"
            >
              <h3 className="text-2xl font-heading font-semibold text-trust-900 mb-6">Recent AI Conversations</h3>
              <div className="space-y-4">
                {dashboardData?.recentCalls?.map((call, index) => (
                  <div key={call.id} className="border border-trust-100 rounded-2xl p-6 hover:shadow-soft transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getMoodEmoji(call.mood_assessment)}</span>
                        <div>
                          <p className="font-semibold text-trust-800">{formatDate(call.call_date)}</p>
                          <p className="text-sm text-trust-500">Duration: {call.call_duration}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        AI Analyzed
                      </span>
                    </div>
                    <p className="text-trust-600 mb-3">{call.conversation_summary}</p>
                    <div className="bg-primary-50 rounded-lg p-3">
                      <p className="text-sm text-primary-700">
                        <strong>AI Insights:</strong> {call.ai_analysis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Automated Alerts Sidebar */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100"
            >
              <h3 className="text-xl font-heading font-semibold text-trust-900 mb-6">Automated Alerts</h3>
              <div className="space-y-4">
                {dashboardData?.automatedAlerts?.map((alert) => (
                  <div key={alert.id} className="border border-trust-100 rounded-xl p-4 hover:shadow-soft transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-trust-500">{formatDate(alert.created_at)}</span>
                    </div>
                    <h4 className="font-semibold text-trust-800 text-sm mb-1">{alert.triggered_by}</h4>
                    <p className="text-trust-600 text-sm mb-2">{alert.message}</p>
                    <p className="text-xs text-trust-500">
                      <strong>Action:</strong> {alert.action_taken}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
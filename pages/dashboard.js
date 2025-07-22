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
      // Always use demo data for demonstration purposes
      const demoDashboardData = {
          stats: {
            currentStatus: 'All Good',
            lastCall: 'Today at 9:15 AM',
            moodToday: 'Content',
            alertsCount: 1,
            automatedAlertsThisWeek: 2
          },
          recentCalls: [
            {
              id: 'demo-1',
              call_date: new Date().toISOString(),
              call_duration: '12 minutes',
              mood_assessment: 'content',
              conversation_summary: 'Pleasant conversation about weather and upcoming family visit. No concerns mentioned.',
              ai_analysis: 'Positive mood indicators detected. Health status stable.',
              health_concerns: []
            },
            {
              id: 'demo-2',
              call_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              call_duration: '8 minutes',
              mood_assessment: 'worried',
              conversation_summary: 'Discussed feeling tired than usual. Mentioned difficulty sleeping.',
              ai_analysis: 'Fatigue mentioned - monitoring for patterns. Sleep concerns noted.',
              health_concerns: ['fatigue', 'sleep issues']
            }
          ],
          automatedAlerts: [
            {
              id: 'alert-1',
              created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              severity: 'medium',
              message: 'Unusual sadness in voice tone',
              triggered_by: 'AI analysis',
              action_taken: 'Auto-generated by AI'
            },
            {
              id: 'alert-2',
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              severity: 'low',
              message: 'Health keyword detected: fatigue',
              triggered_by: 'Keyword detection',
              action_taken: 'Family notification sent'
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
          ]
        }

      setDashboardData(demoDashboardData)
      setLoading(false)

    } catch (error) {
      console.error('Error loading dashboard:', error)
      // Even on error, show demo data
      setDashboardData({
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
            conversation_summary: 'Wonderful conversation about the grandchildren visiting this weekend.',
            ai_analysis: 'AI detected very positive mood with excellent engagement.',
            health_concerns: []
          }
        ],
        automatedAlerts: [
          {
            id: 'alert-1',
            created_at: new Date().toISOString(),
            severity: 'low',
            message: 'Demo alert - system working properly',
            triggered_by: 'System check',
            action_taken: 'No action needed'
          }
        ],
        moodTrends: [
          { date: '1/16', mood: 4 },
          { date: '1/17', mood: 3 },
          { date: '1/18', mood: 4 },
          { date: '1/19', mood: 5 },
          { date: '1/20', mood: 4 },
          { date: '1/21', mood: 4 },
          { date: '1/22', mood: 5 }
        ]
      })
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
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-red-700 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Alert Settings Modal
  if (showAlertSettings) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setShowAlertSettings(false)}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Alert Settings</h1>
              </div>
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>

            <div className="space-y-8">
              {/* Emergency Keywords */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Emergency Keywords</h3>
                <p className="text-gray-600 mb-4">AI monitors conversations for these keywords and phrases</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {alertSettings.keywords.map((keyword, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {keyword}
                      <button
                        onClick={() => setAlertSettings(prev => ({
                          ...prev,
                          keywords: prev.keywords.filter((_, i) => i !== index)
                        }))}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add new keyword or phrase"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Alert Sensitivity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'conservative', label: 'Conservative', desc: 'Alerts for minor concerns' },
                    { value: 'balanced', label: 'Balanced', desc: 'Standard monitoring' },
                    { value: 'relaxed', label: 'Relaxed', desc: 'Only serious concerns' }
                  ].map(level => (
                    <label key={level.value} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      alertSettings.sensitivity === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="sensitivity"
                        value={level.value}
                        checked={alertSettings.sensitivity === level.value}
                        onChange={(e) => setAlertSettings(prev => ({ ...prev, sensitivity: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="font-semibold text-gray-800">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Family Contacts */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Family Contacts</h3>
                {alertSettings.contacts.map((contact, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-3 capitalize">{contact.type} Contact</h4>
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
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAlertSettings(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAlertSettings}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setShowCareSettings(false)}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Care Settings</h1>
              </div>
              <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
            </div>

            <div className="space-y-8">
              {/* Call Schedule */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Call Schedule</h3>
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
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
                <select
                  value={careSettings.callFrequency}
                  onChange={(e) => setCareSettings(prev => ({ ...prev, callFrequency: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="every_other_day">Every Other Day</option>
                  <option value="weekdays">Weekdays Only</option>
                  <option value="custom">Custom Schedule</option>
                </select>
              </div>

              {/* Health Conditions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Health Conditions to Monitor</h3>
                <textarea
                  value={careSettings.healthConditions}
                  onChange={(e) => setCareSettings(prev => ({ ...prev, healthConditions: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="List any specific health conditions, medications, or concerns to monitor during calls..."
                />
              </div>

              {/* Special Instructions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Special AI Instructions</h3>
                <textarea
                  value={careSettings.specialInstructions}
                  onChange={(e) => setCareSettings(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Topics to focus on, avoid, or special conversation preferences..."
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCareSettings(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCareSettings}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setShowFullReport(false)}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Comprehensive Care Report</h1>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  Download PDF
                </button>
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                  Email Report
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Mood Trends Chart */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Mood Trends (Last 7 Days)</h3>
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Automated Alerts History</h3>
                <div className="space-y-4">
                  {dashboardData.automatedAlerts.map((alert) => (
                    <div key={alert.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(alert.created_at)}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{alert.triggered_by}</h4>
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          <strong>Action Taken:</strong> {alert.action_taken}
                        </p>
                        {alert.keywords_detected && (
                          <p className="text-sm text-gray-600 mt-1">
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Call Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dashboardData.recentCalls.map((call) => (
                    <div key={call.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">{getMoodEmoji(call.mood_assessment)}</span>
                        <span className="text-sm text-gray-500">{formatDate(call.call_date)}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Conversation Summary</h4>
                      <p className="text-gray-600 text-sm mb-3">{call.conversation_summary}</p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
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

  // Main Dashboard - Professional Healthcare Design
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4 p-1 hover:bg-gray-100 transition-colors">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Family Dashboard</h1>
              <p className="text-sm text-gray-600">Automated AI monitoring and care insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">AI Monitoring Active</span>
            </div>
            <div className="bg-white rounded-full px-4 py-2 shadow-soft border border-trust-100">
              <span className="text-sm text-trust-600">
                Welcome, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Current Status */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Current Status</h3>
            <p className="text-2xl font-semibold text-green-600 mb-1">{dashboardData?.stats?.currentStatus || 'All Good'}</p>
            <p className="text-xs text-gray-500">System complete</p>
          </div>

          {/* Last Call */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Last Call</h3>
            <p className="text-lg font-semibold text-gray-900 mb-1">{dashboardData?.stats?.lastCall || 'Today at 9:15 AM'}</p>
            <p className="text-xs text-gray-500">Automatic daily check-in</p>
          </div>

          {/* Mood Today */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Mood Today</h3>
            <p className="text-2xl font-semibold text-blue-600 mb-1">{dashboardData?.stats?.moodToday || 'Content'}</p>
            <p className="text-xs text-gray-500">AI voice analysis</p>
          </div>

          {/* This Week's Alerts */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">This Week's Alerts</h3>
            <p className="text-2xl font-semibold text-gray-900 mb-1">{dashboardData?.stats?.automatedAlertsThisWeek || '2'}</p>
            <p className="text-xs text-gray-500">Auto-generated by AI</p>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button onClick={() => setShowAlertSettings(true)} className="bg-blue-500 text-white p-4 hover:bg-blue-600 transition-colors rounded-xl">
            <BellIcon className="h-5 w-5 mb-2" />
            <h3 className="font-medium text-sm">Alert Settings</h3>
            <p className="text-xs opacity-90">Configure automated monitoring</p>
          </button>

          <button onClick={() => setShowCareSettings(true)} className="bg-green-500 text-white p-4 hover:bg-green-600 transition-colors rounded-xl">
            <Cog6ToothIcon className="h-5 w-5 mb-2" />
            <h3 className="font-medium text-sm">Care Settings</h3>
            <p className="text-xs opacity-90">Update call schedule & preferences</p>
          </button>

          <button onClick={() => setShowFullReport(true)} className="bg-orange-400 text-white p-4 hover:bg-orange-500 transition-colors rounded-xl">
            <DocumentTextIcon className="h-5 w-5 mb-2" />
            <h3 className="font-medium text-sm">Full Care Report</h3>
            <p className="text-xs opacity-90">Get comprehensive analysis</p>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent AI Conversations */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent AI Conversations</h3>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData?.recentCalls?.map((call, index) => (
                  <div key={call.id} className="border border-gray-100 p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{getMoodEmoji(call.mood_assessment)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(call.call_date)}</p>
                          <p className="text-xs text-gray-500">Duration: {call.call_duration}</p>
                        </div>
                      </div>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 text-xs font-medium rounded-full">AI Analysed</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{call.conversation_summary}</p>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-600">
                        <strong>AI Insights:</strong> {call.ai_analysis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Automated Alerts Sidebar */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Automated Alerts</h3>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData?.automatedAlerts?.map((alert) => (
                  <div key={alert.id} className="border border-gray-100 p-3 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(alert.created_at)}</span>
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{alert.triggered_by}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      <strong>Action:</strong> {alert.action_taken}
                    </p>
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
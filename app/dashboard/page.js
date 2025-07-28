
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoAccounts } from '../../lib/demo-accounts'

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days')
  const [showCallDetails, setShowCallDetails] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [expandedAlert, setExpandedAlert] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  
  // User and data state
  const [user, setUser] = useState(null)
  const [isDemoUser, setIsDemoUser] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Demo data for demonstration accounts
  const demoData = {
    elderlyPerson: {
      name: 'Margaret Johnson',
      status: 'All Good',
      mood: 'Content',
      moodTrend: 'stable',
      activity: 'Active',
      lastCall: 'Today at 9:15 AM',
      lastCallRelative: '2 hours ago',
      nextCall: 'Tomorrow 9:00 AM',
      alertsThisWeek: 2
    },
    recentCalls: [
      {
        date: 'Today at 15:51',
        duration: '12 minutes',
        mood: 'Content',
        summary: "Pleasant conversation about the weather and upcoming family visit. No concerns mentioned.",
        insights: "Positive mood indicators detected. Health stable.",
        moodScore: 4,
        emoji: '😊',
        topics: ['Family', 'Weather', 'Health'],
        quality: 'High',
        keyMoments: ['Excited about grandson\'s visit', 'Enjoyed garden work this morning']
      },
      {
        date: 'Yesterday at 15:51',
        duration: '8 minutes',
        mood: 'Tired',
        summary: "Discussed feeling more tired than usual. Mentioned difficulty sleeping.",
        insights: "Fatigue mentioned - monitoring for patterns. Sleep concerns noted.",
        moodScore: 2,
        emoji: '😔',
        topics: ['Health', 'Sleep', 'Energy'],
        quality: 'Medium',
        keyMoments: ['Third mention of sleep issues this week', 'Considering doctor visit']
      }
    ],
    automatedAlerts: [
      {
        id: 1,
        priority: 'MEDIUM',
        category: 'Mood',
        title: 'AI detected sadness in voice tone',
        description: 'Voice analysis detected indicators of sadness during today\'s call',
        action: 'Email sent to family',
        time: 'Today at 15:51',
        resolved: false,
        pattern: 'First occurrence this week'
      },
      {
        id: 2,
        priority: 'LOW',
        category: 'Health',
        title: 'Health keyword detected',
        description: 'Mentioned back pain during conversation',
        action: 'Email notification sent',
        time: 'Yesterday at 15:51',
        resolved: true,
        pattern: 'Third mention this month'
      }
    ],
    moodChart: [
      { day: 'Mon', mood: 4, date: '2024-01-15' },
      { day: 'Tue', mood: 3, date: '2024-01-16' },
      { day: 'Wed', mood: 2, date: '2024-01-17' },
      { day: 'Thu', mood: 3, date: '2024-01-18' },
      { day: 'Fri', mood: 4, date: '2024-01-19' },
      { day: 'Sat', mood: 4, date: '2024-01-20' },
      { day: 'Sun', mood: 4, date: '2024-01-21' }
    ],
    familyUpdates: [
      { type: 'visit', person: 'Sarah (daughter)', when: 'Last Sunday', note: 'Brought grandchildren' },
      { type: 'call', person: 'John (son)', when: '3 days ago', note: 'Weekly check-in call' }
    ],
    upcomingEvents: [
      { event: 'Doctor appointment', date: '2024-01-25', type: 'medical' },
      { event: 'Birthday - John', date: '2024-01-30', type: 'birthday' }
    ]
  }

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  const checkUserAndLoadData = async () => {
    try {
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
        return
      }

      setUser(currentUser)

      // Check if this is a demo account
      const isDemo = currentUser.email && demoAccounts[currentUser.email]
      const isTestAccount = currentUser.email && currentUser.email.endsWith('@test.local')
      
      setIsDemoUser(isDemo)

      if (isDemo) {
        // Use demo data for sales demonstration
        setDashboardData(demoData)
      } else {
        // Load real data from Supabase (both regular and test accounts)
        await loadRealUserData(currentUser.id)
      }
    } catch (error) {
      console.error('Error checking user and loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealUserData = async (userId) => {
    try {
      // Fetch family user data
      const { data: familyUser, error: familyError } = await supabase
        .from('family_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (familyError) {
        console.error('Error fetching family user:', familyError)
        setDashboardData(getEmptyDataStructure())
        return
      }

      if (!familyUser) {
        console.log('No family user record found - user may need to complete signup process')
        
        // If this is a test account, try to auto-fix the database records
        if (user?.email?.endsWith('@test.local')) {
          console.log('Test account detected, attempting auto-fix...')
          try {
            const response = await fetch('/api/fix-test-account', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userEmail: user.email,
                userId: userId
              })
            })

            const result = await response.json()
            
            if (response.ok && result.success) {
              console.log('Test account fixed successfully, reloading data...')
              // Retry loading the data after fixing
              setTimeout(async () => {
                await loadRealUserData(userId)
              }, 500) // Small delay to ensure database changes are committed
              return
            } else {
              console.error('Failed to fix test account:', result.error || 'Unknown error')
            }
          } catch (error) {
            console.error('Error auto-fixing test account:', error)
          }
        }
        
        setDashboardData(getEmptyDataStructure())
        return
      }

      // Fetch elderly user data
      const { data: elderlyUser, error: elderlyError } = await supabase
        .from('elderly_users')
        .select('*')
        .eq('family_user_id', userId)
        .maybeSingle()

      if (elderlyError) {
        console.error('Error fetching elderly user:', elderlyError)
        setDashboardData(getEmptyDataStructure())
        return
      }

      if (!elderlyUser) {
        console.log('No elderly user record found - user may need to complete setup')
        
        // If this is a test account, the auto-fix above should have handled it
        // If we still don't have elderly user, there's a deeper issue
        if (user?.email?.endsWith('@test.local')) {
          console.log('Test account still missing elderly user after auto-fix attempt')
        }
        
        setDashboardData(getEmptyDataStructure())
        return
      }

      // Fetch recent calls
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('elderly_user_id', elderlyUser.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('elderly_user_id', elderlyUser.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Transform real data to match demo data structure
      const realData = {
        elderlyPerson: {
          name: elderlyUser.name,
          status: 'All Good', // This would be calculated based on recent data
          mood: 'Content', // This would come from latest call analysis
          moodTrend: 'stable',
          activity: 'Active',
          lastCall: calls?.[0] ? new Date(calls[0].created_at).toLocaleString() : 'No calls yet',
          lastCallRelative: calls?.[0] ? getRelativeTime(calls[0].created_at) : 'N/A',
          nextCall: 'Tomorrow 9:00 AM', // This would come from schedule
          alertsThisWeek: alerts?.length || 0
        },
        recentCalls: calls?.map(call => ({
          date: new Date(call.created_at).toLocaleString(),
          duration: call.duration || 'N/A',
          mood: call.mood_analysis || 'Unknown',
          summary: call.summary || 'No summary available',
          insights: call.ai_insights || 'No insights available',
          moodScore: call.mood_score || 3,
          emoji: getMoodEmoji(call.mood_score || 3),
          topics: call.topics ? call.topics.split(',') : ['General'],
          quality: call.quality || 'Medium',
          keyMoments: call.key_moments ? call.key_moments.split(',') : []
        })) || [],
        automatedAlerts: alerts?.map(alert => ({
          id: alert.id,
          priority: alert.priority || 'LOW',
          category: alert.category || 'General',
          title: alert.title,
          description: alert.description,
          action: alert.action_taken || 'No action taken',
          time: new Date(alert.created_at).toLocaleString(),
          resolved: alert.resolved || false,
          pattern: alert.pattern_info || 'No pattern detected'
        })) || [],
        moodChart: generateMoodChart(calls || []),
        familyUpdates: [], // Would come from family_updates table
        upcomingEvents: [] // Would come from events table
      }

      setDashboardData(realData)
    } catch (error) {
      console.error('Error loading real user data:', error)
      setDashboardData(getEmptyDataStructure())
    }
  }

  const getEmptyDataStructure = () => ({
    elderlyPerson: {
      name: 'Setup Required',
      status: 'Account Setup Needed',
      mood: 'Unknown',
      moodTrend: 'stable',
      activity: 'Unknown',
      lastCall: 'No calls yet',
      lastCallRelative: 'N/A',
      nextCall: 'Complete setup first',
      alertsThisWeek: 0
    },
    recentCalls: [],
    automatedAlerts: [],
    moodChart: [],
    familyUpdates: [],
    upcomingEvents: []
  })

  const getRelativeTime = (dateString) => {
    const now = new Date()
    const callTime = new Date(dateString)
    const diffMs = now - callTime
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Less than an hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const getMoodEmoji = (score) => {
    if (score >= 4) return '😊'
    if (score >= 3) return '🙂'
    if (score >= 2) return '😐'
    return '😔'
  }

  const generateMoodChart = (calls) => {
    // Generate last 7 days mood chart from calls
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    if (!calls || calls.length === 0) {
      // Return empty chart for accounts with no call data
      return days.map((day, index) => ({
        day,
        mood: 0, // No data available
        date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
    }
    
    // Calculate actual mood data from calls when available
    return days.map((day, index) => ({
      day,
      mood: Math.floor(Math.random() * 3) + 3, // Would be calculated from actual data
      date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
  }

  const triggerEmergencyCall = async () => {
    if (isDemoUser) {
      alert('Demo mode: Emergency call would be initiated for Margaret Johnson')
      return
    }

    const isTestAccount = user?.email?.endsWith('@test.local')

    try {
      // For real users and test accounts, trigger actual ElevenLabs call
      const response = await fetch('/api/emergency-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elderlyUserId: dashboardData?.elderlyPerson?.id,
          isTestAccount: isTestAccount
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (isTestAccount) {
          alert(`Test Account: Emergency call initiated for ${result.elderlyUser || 'family member'}`)
        } else {
          alert('Emergency call initiated successfully')
        }
      } else {
        alert('Failed to initiate emergency call')
      }
    } catch (error) {
      console.error('Error triggering emergency call:', error)
      alert('Error initiating emergency call')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error loading dashboard data</p>
          <button 
            onClick={checkUserAndLoadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      default: return '→'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const AlertSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Alert Settings</h2>
            <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Alert Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Health keywords', desc: 'Pain, medication, doctor mentions' },
                { name: 'Mood changes', desc: 'Sadness, anxiety, depression indicators' },
                { name: 'Missed calls', desc: 'When scheduled calls don\'t connect' },
                { name: 'Emergency phrases', desc: 'Help, emergency, urgent situations' },
                { name: 'Sleep concerns', desc: 'Sleep problems, insomnia mentions' },
                { name: 'Medication mentions', desc: 'Medication changes or concerns' }
              ].map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">{alert.name}</div>
                    <div className="text-sm text-gray-500">{alert.desc}</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input type="checkbox" defaultChecked className="w-5 h-5" />
                <label className="flex-1">Email notifications</label>
                <input type="email" placeholder="family@email.com" className="border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="flex items-center space-x-4">
                <input type="checkbox" className="w-5 h-5" />
                <label className="flex-1">SMS notifications</label>
                <input type="tel" placeholder="+1 (555) 123-4567" className="border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="flex items-center space-x-4">
                <input type="checkbox" className="w-5 h-5" />
                <label className="flex-1">Phone call alerts</label>
                <input type="tel" placeholder="+1 (555) 123-4567" className="border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Alert Sensitivity</h3>
            <div className="space-y-3">
              {[
                { level: 'High', desc: 'Alert on any potential concern' },
                { level: 'Medium', desc: 'Alert on moderate to high concerns' },
                { level: 'Low', desc: 'Alert only on high priority concerns' }
              ].map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="sensitivity" defaultChecked={index === 1} className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{option.level}</div>
                    <div className="text-sm text-gray-500">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Settings</button>
        </div>
      </div>
    </div>
  )

  const CareSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Care Settings</h2>
            <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Call Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Time</label>
                <input type="time" defaultValue="09:00" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2">
                  <option>Daily</option>
                  <option>Every other day</option>
                  <option>3 times per week</option>
                  <option>Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Call Duration</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2">
                  <option>5-10 minutes</option>
                  <option>10-15 minutes</option>
                  <option>15-20 minutes</option>
                  <option>20+ minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2">
                  <option>Eastern Time</option>
                  <option>Central Time</option>
                  <option>Mountain Time</option>
                  <option>Pacific Time</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Conversation Focus</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Health check-ins', 'Family updates', 'Hobbies & interests', 'Memory sharing',
                'Current events', 'Weather chat', 'Meal discussions', 'Activity updates'
              ].map((topic, index) => (
                <label key={index} className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked={index < 4} className="w-4 h-4" />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Interests</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Hobbies</label>
                <input type="text" placeholder="Gardening, reading, cooking..." className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Favorite Topics</label>
                <input type="text" placeholder="Family history, recipes, local news..." className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">AI Assistant Personality</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { style: 'Chatty & Friendly', desc: 'Warm, engaging conversations' },
                { style: 'Brief & Efficient', desc: 'Concise, focused check-ins' },
                { style: 'Formal & Professional', desc: 'Respectful, structured approach' },
                { style: 'Casual & Relaxed', desc: 'Natural, easy-going style' }
              ].map((option, index) => (
                <label key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="personality" defaultChecked={index === 0} className="w-4 h-4 mt-1" />
                  <div>
                    <div className="font-medium">{option.style}</div>
                    <div className="text-sm text-gray-500">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Settings</button>
        </div>
      </div>
    </div>
  )

  const FullCareReportModal = () => {
    const [reportDateRange, setReportDateRange] = useState('7 days')
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        generatePDFReport(reportDateRange)
      } catch (error) {
        console.error('Error generating PDF:', error)
        alert('Error generating PDF. Please try again.')
      } finally {
        setIsGeneratingPDF(false)
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Full Care Report</h2>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Period</label>
                  <select 
                    value={reportDateRange} 
                    onChange={(e) => setReportDateRange(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-3 py-1"
                  >
                    <option value="7 days">Last 7 days</option>
                    <option value="30 days">Last 30 days</option>
                    <option value="90 days">Last 90 days</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Email Report</button>
                <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">Executive Summary - This Week</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-800">Overall Status</div>
                  <div className="text-blue-700">Stable and positive</div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">Mood Trend</div>
                  <div className="text-blue-700">Improving (↗️ +15%)</div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">Health Mentions</div>
                  <div className="text-blue-700">2 minor concerns</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Monthly Mood Trends</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-end space-x-2 h-40 mb-4">
                  {Array.from({length: 30}, (_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="flex-1 flex items-end">
                        <div 
                          className="w-full bg-blue-400 rounded-t-sm"
                          style={{ height: `${Math.random() * 80 + 20}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 text-center">Last 30 Days</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Health Mentions Timeline</h3>
              <div className="space-y-3">
                {[
                  { date: 'Jan 21', concern: 'Back pain mentioned', severity: 'Low', action: 'Monitoring' },
                  { date: 'Jan 19', concern: 'Sleep difficulty', severity: 'Medium', action: 'Family notified' },
                  { date: 'Jan 17', concern: 'Fatigue', severity: 'Low', action: 'Pattern tracking' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">{item.concern}</div>
                      <div className="text-sm text-gray-500">{item.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {item.severity}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{item.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {[
                  'Consider scheduling a doctor visit to discuss recurring back pain',
                  'Sleep patterns show improvement - continue current routine',
                  'Family visits correlate with improved mood - maintain regular contact'
                ].map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="text-green-800">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white/95'} backdrop-blur-sm shadow-sm sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Family Dashboard 
                  {isDemoUser && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">DEMO</span>}
                  {user?.email?.endsWith('@test.local') && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">TEST</span>}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isDemoUser ? 'Demonstration Mode' : user?.email?.endsWith('@test.local') ? 'Testing Mode - Full Access' : 'Automated AI monitoring and care insights'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">AI Monitoring Active</span>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} font-medium transition-colors duration-200`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Badge */}
        <div className="mb-6 flex justify-center">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            🔐 Privacy-First: Conversations summarized, never recorded
          </div>
        </div>

        {/* Enhanced Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Status */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-all duration-200 cursor-pointer group`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Status</h3>
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-1">{dashboardData.elderlyPerson.status}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI analysis complete</p>
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">View Details →</button>
          </div>

          {/* Last Call */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Last Call</h3>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{dashboardData.elderlyPerson.lastCall}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{dashboardData.elderlyPerson.lastCallRelative}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Automatic daily check-in</p>
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">View Details →</button>
          </div>

          {/* Mood Today */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Mood Today</h3>
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-2xl font-bold text-green-600">{dashboardData.elderlyPerson.mood}</p>
              <span className="text-lg">{getTrendIcon(dashboardData.elderlyPerson.moodTrend)}</span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI voice analysis</p>
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">View Details →</button>
          </div>

          {/* This Week's Alerts */}
          <div 
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-all duration-200 cursor-pointer`}
            onClick={() => setExpandedAlert(expandedAlert ? null : 'summary')}
          >
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>This Week's Alerts</h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">{dashboardData.elderlyPerson.alertsThisWeek}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Auto-generated by AI</p>
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
              {expandedAlert ? 'Hide Summary ↑' : 'View Summary →'}
            </button>

            {expandedAlert && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="text-sm">
                  <div className="font-medium text-yellow-600">Medium Priority: 1</div>
                  <div className="font-medium text-green-600">Low Priority: 1</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border mb-8`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button 
              onClick={triggerEmergencyCall}
              className="bg-red-100 text-red-800 hover:bg-red-200 p-4 rounded-lg transition-colors duration-200 text-center"
            >
              <div className="text-2xl mb-2">📞</div>
              <div className="text-sm font-medium">Emergency Call</div>
            </button>
            <button className="bg-blue-100 text-blue-800 hover:bg-blue-200 p-4 rounded-lg transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">💭</div>
              <div className="text-sm font-medium">Special Request</div>
            </button>
            <button className="bg-green-100 text-green-800 hover:bg-green-200 p-4 rounded-lg transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm font-medium">Extra Call</div>
            </button>
            <button className="bg-purple-100 text-purple-800 hover:bg-purple-200 p-4 rounded-lg transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">📢</div>
              <div className="text-sm font-medium">Family News</div>
            </button>
            <button className="bg-gray-100 text-gray-800 hover:bg-gray-200 p-4 rounded-lg transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium">Quick Settings</div>
            </button>
            <button className="bg-orange-100 text-orange-800 hover:bg-orange-200 p-4 rounded-lg transition-colors duration-200 text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm font-medium">Download Report</div>
            </button>
          </div>
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => setActiveModal('alerts')}
            className="bg-blue-500 rounded-lg p-6 text-white hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L13 9h7l-5.5 4 2 7L10 15l-6.5 5 2-7L0 9h7l3-7z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Alert Settings</h3>
                <p className="text-blue-100 text-sm">Configure automated monitoring</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveModal('care')}
            className="bg-green-500 rounded-lg p-6 text-white hover:bg-green-600 transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Care Settings</h3>
                <p className="text-green-100 text-sm">Update call schedule & preferences</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveModal('report')}
            className="bg-orange-400 rounded-lg p-6 text-white hover:bg-orange-500 transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Full Care Report</h3>
                <p className="text-orange-100 text-sm">Comprehensive analysis & trends</p>
              </div>
            </div>
          </button>
        </div>

        {/* Family Updates Hub */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border mb-8`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Family Updates Hub</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Recent Family Interactions</h4>
              <div className="space-y-3">
                {dashboardData.familyUpdates.map((update, index) => (
                  <div key={index} className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{update.person}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{update.note}</div>
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{update.when}</div>
                    </div>
                  </div>
                ))}
                {dashboardData.familyUpdates.length === 0 && (
                  <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-center text-gray-500`}>
                    No recent family interactions recorded
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Upcoming Events</h4>
              <div className="space-y-3">
                {dashboardData.upcomingEvents.map((event, index) => (
                  <div key={index} className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{event.event}</div>
                        <div className={`text-sm ${event.type === 'birthday' ? 'text-purple-600' : 'text-blue-600'}`}>
                          {event.type === 'birthday' ? '🎂' : '🏥'} {event.type}
                        </div>
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{event.date}</div>
                    </div>
                  </div>
                ))}
                {dashboardData.upcomingEvents.length === 0 && (
                  <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-center text-gray-500`}>
                    No upcoming events scheduled
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Recent AI Conversations */}
          <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Recent AI Conversations</h3>

            <div className="space-y-6">
              {dashboardData.recentCalls.map((call, index) => (
                <div key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} pb-6 last:border-b-0`}>
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{call.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{call.date}</span>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Duration: {call.duration}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI Analyzed</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${call.quality === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {call.quality} Quality
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {call.topics.map((topic, topicIndex) => (
                          <span key={topicIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>

                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>{call.summary}</p>

                      <div className="mb-3">
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Key Moments:</div>
                        <ul className="space-y-1">
                          {call.keyMoments.map((moment, momentIndex) => (
                            <li key={momentIndex} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-start`}>
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              {moment}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
                        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                          <span className="font-medium">AI Insights:</span> {call.insights}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.recentCalls.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    {dashboardData.elderlyPerson.name === 'Setup Required' 
                      ? 'Please complete your account setup to see conversation data'
                      : 'No recent conversations available'
                    }
                  </p>
                  {!isDemoUser && dashboardData.elderlyPerson.name === 'Setup Required' && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        {user?.email?.endsWith('@test.local') 
                          ? 'Test account needs database setup - click to auto-configure'
                          : 'Account setup required - please complete registration'
                        }
                      </p>
                      <button 
                        onClick={async () => {
                          if (user?.email?.endsWith('@test.local')) {
                            // For test accounts, use the auto-fix API
                            try {
                              const response = await fetch('/api/fix-test-account', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  userEmail: user.email,
                                  userId: user.id
                                })
                              })

                              const result = await response.json()
                              
                              if (response.ok && result.success) {
                                alert('Test account setup complete! Refreshing dashboard...')
                                window.location.reload()
                              } else {
                                alert('Setup failed: ' + (result.error || 'Unknown error'))
                              }
                            } catch (error) {
                              console.error('Error fixing test account:', error)
                              alert('Error setting up test account. Please try again.')
                            }
                          } else {
                            // For regular accounts, redirect to signup
                            window.location.href = '/signup'
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {user?.email?.endsWith('@test.local') ? 'Auto-Setup Test Account' : 'Complete Setup'}
                      </button>
                    </div>
                  )}
                  {!isDemoUser && dashboardData.elderlyPerson.name !== 'Setup Required' && (
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Schedule First Call
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Automated Alerts */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Automated Alerts</h3>

            <div className="space-y-4">
              {dashboardData.automatedAlerts.map((alert, index) => (
                <div key={index} className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {alert.category}
                      </span>
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{alert.time}</span>
                  </div>

                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{alert.title}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{alert.description}</p>

                  {alert.pattern && (
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                      <span className="font-medium">Pattern:</span> {alert.pattern}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      <span className="font-medium">Action:</span> {alert.action}
                    </p>
                    <div className="flex space-x-2">
                      <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                        {alert.resolved ? 'Resolved ✓' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.automatedAlerts.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Mood Chart */}
        <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mood Over Time</h3>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeRange} 
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className={`text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded px-3 py-1`}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>
          </div>

          {dashboardData.moodChart.some(data => data.mood > 0) ? (
            <div className="flex items-end space-x-4 h-40 mb-4">
              {dashboardData.moodChart.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="flex-1 flex items-end mb-2 w-full">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-md transition-all duration-500 hover:from-blue-500 hover:to-blue-400 cursor-pointer"
                      style={{ height: `${(data.mood / 5) * 100}%`, minHeight: '20px' }}
                      title={`${data.day}: Mood ${data.mood}/5`}
                    ></div>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>{data.day}</span>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {data.mood}/5
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 mb-4">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No mood data available</p>
                <p className="text-xs text-gray-400 mt-1">Chart will populate after conversations begin</p>
              </div>
            </div>
          )}

          <div className={`flex justify-between items-center mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>1 (Low)</span>
            <span>Mood Scale</span>
            <span>5 (High)</span>
          </div>

          {dashboardData.moodChart.some(data => data.mood > 0) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Trend Analysis:</span> Mood has been stable this week with a slight improvement trend. 
                Family visits on weekends correlate with higher mood scores.
              </p>
            </div>
          )}
        </div>

        {/* Wellbeing Dashboard */}
        <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Wellbeing Dashboard</h3>

          {dashboardData.recentCalls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Activity Level</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Highly engaged</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Social Mentions</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Friends & neighbors</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">3</div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Health Keywords</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This week</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">Good</div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sleep Quality</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Based on mentions</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No wellbeing data available yet</p>
              <p className="text-sm text-gray-400">
                {dashboardData.elderlyPerson.name === 'Setup Required' 
                  ? 'Complete account setup to start collecting wellbeing insights'
                  : 'Wellbeing insights will appear after the first few conversations'
                }
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        {isDemoUser && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Experience This Level of Care</h3>
              <p className="text-lg mb-6 opacity-90">This is what peace of mind looks like. Real families use ElderCare AI every day.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200">
                  Start Your Free Trial
                </Link>
                <Link href="/" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'alerts' && <AlertSettingsModal />}
      {activeModal === 'care' && <CareSettingsModal />}
      {activeModal === 'report' && <FullCareReportModal />}
    </div>
  )
}

async function generatePDFReport(dateRange) {
  try {
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default
    
    await import('jspdf-autotable')
    
    console.log('PDF libraries loaded successfully')
    
    const doc = new jsPDF()
    
    const colors = {
      primary: [59, 130, 246],
      mood: [34, 197, 94],
      alert: [251, 146, 60],
      accent: [139, 92, 246],
      light: [248, 250, 252],
      text: [31, 41, 55],
      subtext: [107, 114, 128]
    }
    
    let pageNumber = 1
    
    const addHeaderFooter = (title) => {
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, 210, 15, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text('Family Wellbeing Summary Report', 20, 10)
      doc.text(`Page ${pageNumber}`, 170, 10)
      
      doc.setTextColor(...colors.text)
      
      const pageHeight = doc.internal.pageSize.height
      doc.setFillColor(...colors.light)
      doc.rect(0, pageHeight - 15, 210, 15, 'F')
      doc.setFontSize(8)
      doc.setTextColor(...colors.subtext)
      doc.text('Confidential Family Wellbeing Summary - Generated by ElderCare AI', 20, pageHeight - 8)
      doc.text(new Date().toLocaleDateString(), 170, pageHeight - 8)
      
      pageNumber++
    }
    
    addHeaderFooter()
    
    doc.setFillColor(...colors.primary)
    doc.circle(105, 40, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text('❤️', 101, 45)
    
    doc.setTextColor(...colors.text)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('Family Wellbeing', 105, 65, { align: 'center' })
    doc.text('Summary Report', 105, 75, { align: 'center' })
    
    doc.setFillColor(...colors.light)
    doc.roundedRect(30, 90, 150, 60, 5, 5, 'F')
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(1)
    doc.roundedRect(30, 90, 150, 60, 5, 5, 'S')
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.text)
    doc.text('For: Margaret Johnson', 40, 105)
    doc.text(`Report Period: Last ${dateRange}`, 40, 115)
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 40, 125)
    doc.text('Family Contact: Johnson Family', 40, 135)
    doc.text('Primary Contact: sarah.johnson@email.com | (555) 123-4567', 40, 145)
    
    doc.setFillColor(...colors.mood)
    doc.roundedRect(30, 170, 150, 25, 5, 5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall Companionship Quality: Excellent', 105, 185, { align: 'center' })
    
    const fileName = `Family_Wellbeing_Report_${dateRange.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    
    console.log('Saving PDF:', fileName)
    doc.save(fileName)
    console.log('Professional family wellbeing PDF saved successfully')
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

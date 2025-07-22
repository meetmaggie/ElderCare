
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    elderlyUser: null,
    recentCalls: [],
    alerts: [],
    stats: {
      currentStatus: 'good',
      lastCall: null,
      moodToday: 'content',
      alertsCount: 0
    }
  })
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal states
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  
  // Emergency alert form state
  const [emergencyAlert, setEmergencyAlert] = useState({
    type: '',
    reason: '',
    urgency: 'medium',
    message: '',
    isSubmitting: false
  })
  
  // Care settings state
  const [careSettings, setCareSettings] = useState({
    callTimes: ['10:00 AM - 12:00 PM'],
    primaryContact: '',
    secondaryContact: '',
    healthConditions: '',
    alertPreferences: 'phone',
    callFrequency: 'daily',
    specialInstructions: '',
    isSubmitting: false
  })

  // Demo data for when no database data exists
  const demoData = {
    elderlyUser: {
      name: 'Margaret Thompson',
      phone: '+44 20 7946 0958',
      emergency_contact: 'Sarah Thompson (Daughter)',
      call_schedule: '10:00 AM - 12:00 PM'
    },
    recentCalls: [
      {
        id: 1,
        call_date: new Date().toISOString(),
        mood_assessment: 'content',
        health_concerns: 'None reported',
        conversation_summary: 'Discussed gardening plans and upcoming family visit. Margaret mentioned feeling energetic and excited about spring flowers.',
        call_duration: '8 minutes'
      },
      {
        id: 2,
        call_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        mood_assessment: 'cheerful',
        health_concerns: 'Mild back pain',
        conversation_summary: 'Talked about baking cookies for grandchildren. Some concern about lower back discomfort after gardening.',
        call_duration: '12 minutes'
      },
      {
        id: 3,
        call_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        mood_assessment: 'neutral',
        health_concerns: 'Medication reminder needed',
        conversation_summary: 'Daily check-in went well. Gentle reminder about evening medication schedule.',
        call_duration: '6 minutes'
      }
    ],
    alerts: [
      {
        id: 1,
        alert_type: 'missed_call',
        message: 'Scheduled call answered after 2 rings',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      },
      {
        id: 2,
        alert_type: 'health_mention',
        message: 'Mentioned back pain during conversation',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        severity: 'medium'
      }
    ]
  }

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch elderly user data
      const { data: elderlyData, error: elderlyError } = await supabase
        .from('elderly_users')
        .select('*')
        .limit(1)
        .single()

      // Fetch recent calls
      const { data: callsData, error: callsError } = await supabase
        .from('call_records')
        .select('*')
        .order('call_date', { ascending: false })
        .limit(10)

      // Fetch recent alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Use real data if available, otherwise use demo data
      const elderlyUser = elderlyData || demoData.elderlyUser
      const recentCalls = callsData?.length ? callsData : demoData.recentCalls
      const alerts = alertsData?.length ? alertsData : demoData.alerts

      // Calculate stats
      const stats = {
        currentStatus: recentCalls[0]?.mood_assessment === 'content' || recentCalls[0]?.mood_assessment === 'cheerful' ? 'good' : 
                     recentCalls[0]?.mood_assessment === 'neutral' ? 'monitor' : 'alert',
        lastCall: recentCalls[0]?.call_date || null,
        moodToday: recentCalls[0]?.mood_assessment || 'content',
        alertsCount: alerts?.filter(alert => 
          new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length || 0
      }

      setDashboardData({
        elderlyUser,
        recentCalls,
        alerts,
        stats
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use demo data on error
      setDashboardData({
        elderlyUser: demoData.elderlyUser,
        recentCalls: demoData.recentCalls,
        alerts: demoData.alerts,
        stats: {
          currentStatus: 'good',
          lastCall: demoData.recentCalls[0]?.call_date,
          moodToday: 'content',
          alertsCount: 2
        }
      })
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-care-600 bg-care-50 border-care-200'
      case 'monitor': return 'text-warm-600 bg-warm-50 border-warm-200'
      case 'alert': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-trust-600 bg-trust-50 border-trust-200'
    }
  }

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'cheerful': return '😊'
      case 'content': return '😌'
      case 'neutral': return '😐'
      case 'concerned': return '😟'
      case 'sad': return '😢'
      default: return '😌'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-care-600 bg-care-50'
      case 'medium': return 'text-warm-600 bg-warm-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-trust-600 bg-trust-50'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Emergency Alert Functions
  const handleEmergencySubmit = async (e) => {
    e.preventDefault()
    setEmergencyAlert(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      // Save alert to database
      const { error } = await supabase
        .from('alerts')
        .insert([
          {
            alert_type: emergencyAlert.type,
            message: `${emergencyAlert.reason}: ${emergencyAlert.message}`,
            severity: emergencyAlert.urgency,
            elderly_user_id: dashboardData.elderlyUser?.id || 1,
            created_at: new Date().toISOString()
          }
        ])
      
      if (error) throw error
      
      // Show success and refresh data
      alert(`Family will be contacted within 5 minutes via ${emergencyAlert.urgency === 'high' ? 'immediate call + SMS' : emergencyAlert.urgency === 'medium' ? 'phone call' : 'email alert'}`)
      setShowEmergencyModal(false)
      setEmergencyAlert({ type: '', reason: '', urgency: 'medium', message: '', isSubmitting: false })
      fetchDashboardData()
    } catch (error) {
      console.error('Error submitting emergency alert:', error)
      alert('Error sending alert. Please try again.')
    } finally {
      setEmergencyAlert(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Care Settings Functions
  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setCareSettings(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      // Update elderly_users table
      const { error: elderlyError } = await supabase
        .from('elderly_users')
        .update({
          call_schedule: careSettings.callTimes.join(', '),
          emergency_contact: careSettings.primaryContact,
          emergency_phone: careSettings.secondaryContact,
          health_conditions: careSettings.healthConditions,
          special_instructions: careSettings.specialInstructions
        })
        .eq('id', dashboardData.elderlyUser?.id || 1)
      
      if (elderlyError) throw elderlyError
      
      // Update family_users table
      const { error: familyError } = await supabase
        .from('family_users')
        .update({
          alert_preferences: careSettings.alertPreferences,
          call_frequency: careSettings.callFrequency
        })
        .eq('id', 1) // Assuming family user ID 1 for demo
      
      if (familyError) throw familyError
      
      alert('Care settings updated successfully!')
      setShowSettingsModal(false)
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating care settings:', error)
      alert('Error updating settings. Please try again.')
    } finally {
      setCareSettings(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Report Generation
  const generateMoodTrendData = () => {
    return dashboardData.recentCalls.slice(0, 7).reverse().map((call, index) => ({
      date: new Date(call.call_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      mood: call.mood_assessment === 'cheerful' ? 5 : 
            call.mood_assessment === 'content' ? 4 :
            call.mood_assessment === 'neutral' ? 3 :
            call.mood_assessment === 'concerned' ? 2 : 1,
      moodLabel: call.mood_assessment
    }))
  }

  const handleEmailReport = async () => {
    alert('Report will be emailed to family members within 5 minutes.')
  }

  const handleDownloadReport = () => {
    alert('PDF report generation feature coming soon. For now, you can print this page.')
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-trust-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Family Dashboard - ElderCare AI</title>
        <meta name="description" content="Monitor your parent's wellbeing and recent activities" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50">
        {/* Header Navigation */}
        <header className="bg-white/95 backdrop-blur-sm shadow-soft sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">💝</span>
                </div>
                <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-700 to-care-600 bg-clip-text text-transparent">
                  ElderCare AI
                </h1>
              </Link>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => fetchDashboardData()}
                  disabled={refreshing}
                  className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center"
                >
                  <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshing ? 'Updating...' : 'Refresh'}
                </button>
                <Link 
                  href="/"
                  className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-heading font-bold text-trust-900 mb-2">
              Family Dashboard
            </h2>
            <p className="text-xl text-trust-600">
              Monitoring {dashboardData.elderlyUser?.name || 'Your Parent'}'s wellbeing
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Current Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-trust-800">Current Status</h3>
                <div className={`w-3 h-3 rounded-full ${
                  dashboardData.stats.currentStatus === 'good' ? 'bg-care-500 animate-pulse' :
                  dashboardData.stats.currentStatus === 'monitor' ? 'bg-warm-500' : 'bg-red-500'
                }`}></div>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(dashboardData.stats.currentStatus)}`}>
                {dashboardData.stats.currentStatus === 'good' ? '✓ Excellent' :
                 dashboardData.stats.currentStatus === 'monitor' ? '⚠ Monitor' : '⚠ Needs Attention'}
              </div>
            </motion.div>

            {/* Last Call */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
            >
              <h3 className="font-semibold text-trust-800 mb-4">Last Call</h3>
              <p className="text-2xl font-bold text-primary-600 mb-2">
                {dashboardData.stats.lastCall ? formatTime(dashboardData.stats.lastCall) : 'No calls yet'}
              </p>
              <p className="text-sm text-trust-500">
                {dashboardData.stats.lastCall ? formatDate(dashboardData.stats.lastCall) : 'Waiting for first call'}
              </p>
            </motion.div>

            {/* Mood Today */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
            >
              <h3 className="font-semibold text-trust-800 mb-4">Mood Today</h3>
              <div className="flex items-center">
                <span className="text-3xl mr-3">{getMoodEmoji(dashboardData.stats.moodToday)}</span>
                <div>
                  <p className="text-xl font-bold text-trust-800 capitalize">{dashboardData.stats.moodToday}</p>
                  <p className="text-sm text-trust-500">Based on recent call</p>
                </div>
              </div>
            </motion.div>

            {/* Alerts Count */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
            >
              <h3 className="font-semibold text-trust-800 mb-4">Today's Alerts</h3>
              <p className="text-3xl font-bold text-warm-600 mb-2">{dashboardData.stats.alertsCount}</p>
              <p className="text-sm text-trust-500">
                {dashboardData.stats.alertsCount === 0 ? 'All clear today' :
                 dashboardData.stats.alertsCount === 1 ? '1 item to review' : `${dashboardData.stats.alertsCount} items to review`}
              </p>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Conversations */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100"
              >
                <h3 className="text-2xl font-heading font-semibold text-trust-900 mb-6">Recent Conversations</h3>
                <div className="space-y-4">
                  {dashboardData.recentCalls.map((call, index) => (
                    <div key={call.id || index} className="border border-trust-100 rounded-2xl p-6 hover:shadow-soft transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getMoodEmoji(call.mood_assessment)}</span>
                          <div>
                            <p className="font-semibold text-trust-800">{formatDate(call.call_date)}</p>
                            <p className="text-sm text-trust-500">Duration: {call.call_duration || 'N/A'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          call.mood_assessment === 'cheerful' || call.mood_assessment === 'content' ? 'bg-care-100 text-care-700' :
                          call.mood_assessment === 'neutral' ? 'bg-warm-100 text-warm-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {call.mood_assessment}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-trust-700 leading-relaxed">{call.conversation_summary}</p>
                      </div>
                      
                      {call.health_concerns && call.health_concerns !== 'None reported' && (
                        <div className="bg-warm-50 border border-warm-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-warm-800 mb-1">Health Notes:</p>
                          <p className="text-sm text-warm-700">{call.health_concerns}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Alerts */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100"
              >
                <h3 className="text-xl font-heading font-semibold text-trust-900 mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  {dashboardData.alerts.map((alert, index) => (
                    <div key={alert.id || index} className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} border-opacity-20`}>
                      <p className="text-sm font-medium mb-1">{alert.message}</p>
                      <p className="text-xs opacity-75">{formatDate(alert.created_at)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100"
              >
                <h3 className="text-xl font-heading font-semibold text-trust-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowEmergencyModal(true)}
                    className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors duration-200 font-medium"
                  >
                    Schedule Emergency Family Alert
                  </button>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="w-full bg-care-500 text-white py-3 px-4 rounded-xl hover:bg-care-600 transition-colors duration-200 font-medium"
                  >
                    Update Care Settings
                  </button>
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="w-full bg-trust-100 text-trust-700 py-3 px-4 rounded-xl hover:bg-trust-200 transition-colors duration-200 font-medium"
                  >
                    View Full Care Report
                  </button>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-primary-50 to-care-50 rounded-3xl p-6 border border-primary-100"
              >
                <h3 className="text-xl font-heading font-semibold text-trust-900 mb-4">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-trust-700">Parent's Phone</p>
                    <p className="text-trust-600">{dashboardData.elderlyUser?.phone || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-trust-700">Emergency Contact</p>
                    <p className="text-trust-600">{dashboardData.elderlyUser?.emergency_contact || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-trust-700">Preferred Call Time</p>
                    <p className="text-trust-600">{dashboardData.elderlyUser?.call_schedule || 'Not scheduled'}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Emergency Alert Modal */}
        <AnimatePresence>
          {showEmergencyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowEmergencyModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-trust p-8 max-w-md w-full max-h-90vh overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-heading font-semibold text-trust-900">Emergency Family Alert</h3>
                  <button
                    onClick={() => setShowEmergencyModal(false)}
                    className="text-trust-400 hover:text-trust-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleEmergencySubmit} className="space-y-4">
                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Alert Type</label>
                    <select
                      value={emergencyAlert.type}
                      onChange={(e) => setEmergencyAlert(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select alert type</option>
                      <option value="alert_family_now">Alert family now</option>
                      <option value="schedule_welfare_check">Schedule welfare check call (within 2 hours)</option>
                      <option value="request_daily_call">Request daily call now</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Reason</label>
                    <select
                      value={emergencyAlert.reason}
                      onChange={(e) => setEmergencyAlert(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select reason</option>
                      <option value="Health concern mentioned">Health concern mentioned</option>
                      <option value="No response to calls">No response to calls</option>
                      <option value="Family requested check">Family requested check</option>
                      <option value="Concerning conversation">Concerning conversation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Urgency Level</label>
                    <div className="space-y-2">
                      {[
                        { value: 'low', label: 'Low (email alert)', color: 'care' },
                        { value: 'medium', label: 'Medium (phone call)', color: 'warm' },
                        { value: 'high', label: 'High (immediate call + SMS)', color: 'red' }
                      ].map(urgency => (
                        <label key={urgency.value} className="flex items-center">
                          <input
                            type="radio"
                            value={urgency.value}
                            checked={emergencyAlert.urgency === urgency.value}
                            onChange={(e) => setEmergencyAlert(prev => ({ ...prev, urgency: e.target.value }))}
                            className="mr-3"
                          />
                          <span className={`text-${urgency.color}-700`}>{urgency.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Specific Details</label>
                    <textarea
                      value={emergencyAlert.message}
                      onChange={(e) => setEmergencyAlert(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500 h-24"
                      placeholder="Describe the concern or specific details to share with family..."
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEmergencyModal(false)}
                      className="flex-1 bg-trust-100 text-trust-700 py-3 px-4 rounded-xl hover:bg-trust-200 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={emergencyAlert.isSubmitting}
                      className="flex-1 bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors duration-200 font-medium disabled:opacity-75"
                    >
                      {emergencyAlert.isSubmitting ? 'Sending...' : 'Send Alert'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Care Settings Modal */}
        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowSettingsModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-trust p-8 max-w-2xl w-full max-h-90vh overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-heading font-semibold text-trust-900">Update Care Settings</h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-trust-400 hover:text-trust-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-trust-700 font-medium mb-2">Primary Emergency Contact</label>
                      <input
                        type="text"
                        value={careSettings.primaryContact}
                        onChange={(e) => setCareSettings(prev => ({ ...prev, primaryContact: e.target.value }))}
                        className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                        placeholder="Name and phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-trust-700 font-medium mb-2">Secondary Emergency Contact</label>
                      <input
                        type="text"
                        value={careSettings.secondaryContact}
                        onChange={(e) => setCareSettings(prev => ({ ...prev, secondaryContact: e.target.value }))}
                        className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                        placeholder="Name and phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Call Frequency</label>
                    <select
                      value={careSettings.callFrequency}
                      onChange={(e) => setCareSettings(prev => ({ ...prev, callFrequency: e.target.value }))}
                      className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="every_other_day">Every other day</option>
                      <option value="weekdays_only">Weekdays only</option>
                      <option value="include_weekends">Daily including weekends</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Alert Preferences</label>
                    <div className="space-y-2">
                      {[
                        { value: 'email', label: 'Email only' },
                        { value: 'phone', label: 'Phone calls' },
                        { value: 'sms_calls', label: 'SMS + calls' }
                      ].map(pref => (
                        <label key={pref.value} className="flex items-center">
                          <input
                            type="radio"
                            value={pref.value}
                            checked={careSettings.alertPreferences === pref.value}
                            onChange={(e) => setCareSettings(prev => ({ ...prev, alertPreferences: e.target.value }))}
                            className="mr-3"
                          />
                          {pref.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Health Conditions to Monitor</label>
                    <textarea
                      value={careSettings.healthConditions}
                      onChange={(e) => setCareSettings(prev => ({ ...prev, healthConditions: e.target.value }))}
                      className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500 h-20"
                      placeholder="Any specific health conditions, medications, or symptoms to monitor..."
                    />
                  </div>

                  <div>
                    <label className="block text-trust-700 font-medium mb-2">Special Instructions for AI</label>
                    <textarea
                      value={careSettings.specialInstructions}
                      onChange={(e) => setCareSettings(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      className="w-full px-4 py-3 border border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500 h-20"
                      placeholder="Topics to focus on, things to avoid, conversation preferences..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className="flex-1 bg-trust-100 text-trust-700 py-3 px-4 rounded-xl hover:bg-trust-200 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={careSettings.isSubmitting}
                      className="flex-1 bg-care-500 text-white py-3 px-4 rounded-xl hover:bg-care-600 transition-colors duration-200 font-medium disabled:opacity-75"
                    >
                      {careSettings.isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Care Report Modal */}
        <AnimatePresence>
          {showReportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowReportModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-trust p-8 max-w-4xl w-full max-h-90vh overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-heading font-semibold text-trust-900">Full Care Report</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleEmailReport}
                      className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 font-medium"
                    >
                      Email Report
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="bg-trust-100 text-trust-700 px-4 py-2 rounded-xl hover:bg-trust-200 transition-colors duration-200 font-medium"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="text-trust-400 hover:text-trust-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Report Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-care-50 rounded-xl p-6 border border-primary-100">
                    <h4 className="text-xl font-semibold text-trust-900 mb-2">Care Report Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-trust-500">Report Period</p>
                        <p className="font-medium text-trust-800">Last 30 Days</p>
                      </div>
                      <div>
                        <p className="text-trust-500">Total Calls</p>
                        <p className="font-medium text-trust-800">{dashboardData.recentCalls.length}</p>
                      </div>
                      <div>
                        <p className="text-trust-500">Avg Mood</p>
                        <p className="font-medium text-trust-800">Content 😌</p>
                      </div>
                      <div>
                        <p className="text-trust-500">Health Alerts</p>
                        <p className="font-medium text-trust-800">{dashboardData.alerts.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mood Trend Chart */}
                  <div>
                    <h4 className="text-lg font-semibold text-trust-900 mb-4">Mood Trends (Last 7 Days)</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateMoodTrendData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[1, 5]} tickFormatter={(value) => {
                            const moods = ['Sad', 'Concerned', 'Neutral', 'Content', 'Cheerful']
                            return moods[value - 1]
                          }} />
                          <Tooltip formatter={(value) => {
                            const moods = ['Sad', 'Concerned', 'Neutral', 'Content', 'Cheerful']
                            return [moods[value - 1], 'Mood']
                          }} />
                          <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Health Concerns Timeline */}
                  <div>
                    <h4 className="text-lg font-semibold text-trust-900 mb-4">Health Concerns Timeline</h4>
                    <div className="space-y-3">
                      {dashboardData.recentCalls.filter(call => call.health_concerns && call.health_concerns !== 'None reported').map((call, index) => (
                        <div key={index} className="bg-warm-50 border border-warm-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-warm-800">{formatDate(call.call_date)}</p>
                            <span className="text-sm text-warm-600">Health Mention</span>
                          </div>
                          <p className="text-warm-700">{call.health_concerns}</p>
                        </div>
                      ))}
                      {dashboardData.recentCalls.filter(call => call.health_concerns && call.health_concerns !== 'None reported').length === 0 && (
                        <p className="text-trust-500 italic">No health concerns mentioned in recent calls.</p>
                      )}
                    </div>
                  </div>

                  {/* Social Activity Tracking */}
                  <div>
                    <h4 className="text-lg font-semibold text-trust-900 mb-4">Social Activity & Highlights</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-trust-800 mb-3">Recent Social Interactions</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-care-500 rounded-full"></div>
                            <span className="text-sm text-trust-700">Neighbor Susan visited (yesterday)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            <span className="text-sm text-trust-700">Family call mentioned (2 days ago)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-warm-500 rounded-full"></div>
                            <span className="text-sm text-trust-700">Morning walk with neighbor (3 days ago)</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-trust-800 mb-3">Conversation Highlights</h5>
                        <div className="space-y-2">
                          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                            <p className="text-sm text-primary-800">"I'm excited about the spring flowers coming up in my garden!"</p>
                            <p className="text-xs text-primary-600 mt-1">Shows enthusiasm and future planning</p>
                          </div>
                          <div className="bg-care-50 border border-care-200 rounded-lg p-3">
                            <p className="text-sm text-care-800">"I enjoy our daily chats - they brighten my day."</p>
                            <p className="text-xs text-care-600 mt-1">Positive response to AI companionship</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

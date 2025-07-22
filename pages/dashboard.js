
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'

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
                  <button className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors duration-200 font-medium">
                    Schedule Emergency Call
                  </button>
                  <button className="w-full bg-care-500 text-white py-3 px-4 rounded-xl hover:bg-care-600 transition-colors duration-200 font-medium">
                    Update Care Settings
                  </button>
                  <button className="w-full bg-trust-100 text-trust-700 py-3 px-4 rounded-xl hover:bg-trust-200 transition-colors duration-200 font-medium">
                    View Full Report
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
      </div>
    </>
  )
}

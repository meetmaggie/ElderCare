import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { BellIcon, Cog6ToothIcon, DocumentTextIcon, PhoneIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DemoPreview() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showFullReport, setShowFullReport] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Rich demo data
  const demoData = {
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
        severity: 'high',
        message: 'Missed scheduled call - elderly user did not answer',
        triggered_by: 'Automated call system - no response after 3 attempts',
        action_taken: 'Family contacted immediately, neighbor check requested',
        keywords_detected: []
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

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString) => {
    if (!isClient) {
      return 'Loading...' // Or any placeholder you prefer
    }
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

  if (showFullReport) {
    return (
      <>
        <Head>
          <title>Demo Report - ElderCare AI</title>
        </Head>
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
                      <LineChart data={demoData.moodTrends}>
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
                    {demoData.automatedAlerts.map((alert) => (
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
                          {alert.keywords_detected && alert.keywords_detected.length > 0 && (
                            <p className="text-sm text-trust-600 mt-1">
                              <strong>Keywords Detected:</strong> {alert.keywords_detected.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Demo Preview - ElderCare AI</title>
      </Head>

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
                  Margaret Johnson's Care Dashboard
                </h1>
                <p className="text-trust-600 mt-1">Automated AI monitoring and care insights - LIVE DEMO</p>
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
                <span className="text-sm text-trust-600">Demo Mode</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-soft p-2 border border-trust-100 inline-flex">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'alerts', label: 'Alert Settings', icon: '🔔' },
                { id: 'care', label: 'Care Settings', icon: '⚙️' },
                { id: 'reports', label: 'Reports', icon: '📄' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'text-trust-600 hover:bg-trust-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
                >
                  <h3 className="font-semibold text-trust-800 mb-4">Current Status</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">{demoData.stats.currentStatus}</p>
                  <p className="text-sm text-trust-500">AI analysis complete</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
                >
                  <h3 className="font-semibold text-trust-800 mb-4">Last Call</h3>
                  <p className="text-lg font-semibold text-trust-800 mb-2">{demoData.stats.lastCall}</p>
                  <p className="text-sm text-trust-500">Automatic daily check-in</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
                >
                  <h3 className="font-semibold text-trust-800 mb-4">Mood Today</h3>
                  <p className="text-3xl font-bold text-care-600 mb-2">{demoData.stats.moodToday}</p>
                  <p className="text-sm text-trust-500">AI voice analysis</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-soft p-6 border border-trust-100"
                >
                  <h3 className="font-semibold text-trust-800 mb-4">This Week's Alerts</h3>
                  <p className="text-3xl font-bold text-primary-600 mb-2">{demoData.stats.automatedAlertsThisWeek}</p>
                  <p className="text-sm text-trust-500">Auto-generated by AI</p>
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
                    <h3 className="text-2xl font-heading font-semibold text-trust-900 mb-6">Recent AI Conversations</h3>
                    <div className="space-y-4">
                      {demoData.recentCalls.map((call, index) => (
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
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100"
                  >
                    <h3 className="text-xl font-heading font-semibold text-trust-900 mb-6">Automated Alerts</h3>
                    <div className="space-y-4">
                      {demoData.automatedAlerts.map((alert) => (
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
            </>
          )}

          {/* Alert Settings Tab */}
          {activeTab === 'alerts' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100"
            >
              <h2 className="text-2xl font-heading font-bold text-trust-900 mb-6">Alert Settings Configuration</h2>

              <div className="space-y-8">
                {/* Emergency Keywords */}
                <div>
                  <h3 className="text-xl font-semibold text-trust-800 mb-4">Emergency Keywords</h3>
                  <p className="text-trust-600 mb-4">AI monitors conversations for these keywords and phrases</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['chest pain', 'fell', 'dizzy', 'can\'t breathe', 'confused', 'very tired'].map((keyword, index) => (
                      <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
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
                      <div key={level.value} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        level.value === 'balanced' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-trust-200 hover:border-trust-300'
                      }`}>
                        <div className="font-semibold text-trust-800">{level.label}</div>
                        <div className="text-sm text-trust-600">{level.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Family Contacts */}
                <div>
                  <h3 className="text-xl font-semibold text-trust-800 mb-4">Family Contacts</h3>
                  <div className="border border-trust-200 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-trust-700 mb-3">Primary Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="Sarah Johnson" className="px-3 py-2 border border-trust-200 rounded-lg" />
                      <input type="tel" placeholder="+1-555-0123" className="px-3 py-2 border border-trust-200 rounded-lg" />
                      <input type="email" placeholder="sarah.johnson@email.com" className="px-3 py-2 border border-trust-200 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Care Settings Tab */}
          {activeTab === 'care' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100"
            >
              <h2 className="text-2xl font-heading font-bold text-trust-900 mb-6">Care Settings Configuration</h2>

              <div className="space-y-8">
                {/* Call Schedule */}
                <div>
                  <h3 className="text-xl font-semibold text-trust-800 mb-4">Daily Call Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="time" value="09:00" className="px-4 py-3 border border-trust-200 rounded-xl" />
                    <input type="time" value="14:00" className="px-4 py-3 border border-trust-200 rounded-xl" />
                  </div>
                  <select className="w-full px-4 py-3 border border-trust-200 rounded-xl">
                    <option value="daily">Daily</option>
                    <option value="every_other_day">Every Other Day</option>
                    <option value="weekdays">Weekdays Only</option>
                  </select>
                </div>

                {/* Health Conditions */}
                <div>
                  <h3 className="text-xl font-semibold text-trust-800 mb-4">Health Conditions to Monitor</h3>
                  <textarea
                    className="w-full px-4 py-3 border border-trust-200 rounded-xl h-24"
                    placeholder="List any specific health conditions, medications, or concerns to monitor during calls..."
                    defaultValue="Mild hypertension, takes medication daily. Occasional dizziness when standing. Regular doctor visits every 3 months."
                  />
                </div>

                {/* Special Instructions */}
                <div>
                  <h3 className="text-xl font-semibold text-trust-800 mb-4">Special AI Instructions</h3>
                  <textarea
                    className="w-full px-4 py-3 border border-trust-200 rounded-xl h-24"
                    placeholder="Topics to focus on, avoid, or special conversation preferences..."
                    defaultValue="Focus on daily activities, mood, and any physical discomfort. Avoid discussing sad topics. Encourage social activities and family connections."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-trust-900 mb-4">Comprehensive Care Reports</h2>
                <p className="text-trust-600">Generate detailed analysis and trends for healthcare providers</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-trust-200 rounded-xl p-6 hover:shadow-soft transition-all">
                  <h3 className="font-semibold text-trust-800 mb-2">Weekly Summary Report</h3>
                  <p className="text-trust-600 text-sm mb-4">7-day overview of calls, mood trends, and alerts</p>
                  <button className="w-full bg-primary-100 text-primary-700 py-2 rounded-lg hover:bg-primary-200 transition-colors">
                    Generate Weekly Report
                  </button>
                </div>

                <div className="border border-trust-200 rounded-xl p-6 hover:shadow-soft transition-all">
                  <h3 className="font-semibold text-trust-800 mb-2">Monthly Health Report</h3>
                  <p className="text-trust-600 text-sm mb-4">Comprehensive health analysis for doctors</p>
                  <button className="w-full bg-care-100 text-care-700 py-2 rounded-lg hover:bg-care-200 transition-colors">
                    Generate Monthly Report
                  </button>
                </div>

                <div className="border border-trust-200 rounded-xl p-6 hover:shadow-soft transition-all">
                  <h3 className="font-semibold text-trust-800 mb-2">Emergency Alert History</h3>
                  <p className="text-trust-600 text-sm mb-4">Complete timeline of all automated alerts</p>
                  <button className="w-full bg-yellow-100 text-yellow-700 py-2 rounded-lg hover:bg-yellow-200 transition-colors">
                    View Alert History
                  </button>
                </div>

                <div className="border border-trust-200 rounded-xl p-6 hover:shadow-soft transition-all">
                  <h3 className="font-semibold text-trust-800 mb-2">Full Conversation Log</h3>
                  <p className="text-trust-600 text-sm mb-4">Detailed transcripts and AI analysis</p>
                  <button 
                    onClick={() => setShowFullReport(true)}
                    className="w-full bg-warm-100 text-warm-700 py-2 rounded-lg hover:bg-warm-200 transition-colors"
                  >
                    View Full Report
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Demo Actions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-semibold text-blue-800 mb-4">🎯 Demo Features Shown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center text-blue-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Real-time AI conversation analysis
              </div>
              <div className="flex items-center text-blue-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Automated health monitoring alerts
              </div>
              <div className="flex items-center text-blue-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Mood tracking and trends
              </div>
              <div className="flex items-center text-blue-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Family notification system
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link 
                href="/login"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Live Dashboard
              </Link>
              <Link 
                href="/"
                className="bg-white text-blue-700 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
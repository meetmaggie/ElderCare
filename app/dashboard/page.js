'use client'

import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days')
  const [showCallDetails, setShowCallDetails] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [expandedAlert, setExpandedAlert] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  // Demo data for showcasing
  const demoData = {
    elderlyPerson: {
      name: 'Margaret Johnson',
      status: 'All Good',
      mood: 'Content',
      moodTrend: 'stable', // up, down, stable
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
          {/* Alert Types */}
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

          {/* Notification Preferences */}
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

          {/* Alert Sensitivity */}
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
          {/* Call Schedule */}
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

          {/* Conversation Focus */}
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

          {/* Personal Interests */}
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

          {/* Sarah's Personality */}
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
        // Add a small delay to show loading state
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
            {/* Executive Summary */}
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

            {/* Detailed Mood Chart */}
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

            {/* Health Timeline */}
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

            {/* Recommendations */}
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
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Family Dashboard</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Automated AI monitoring and care insights</p>
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
              <Link href="/" className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} font-medium transition-colors duration-200`}>
                Back to Home
              </Link>
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
            <p className="text-2xl font-bold text-green-600 mb-1">{demoData.elderlyPerson.status}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI analysis complete</p>
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">View Details →</button>
          </div>

          {/* Last Call */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Last Call</h3>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{demoData.elderlyPerson.lastCall}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{demoData.elderlyPerson.lastCallRelative}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Automatic daily check-in</p>
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">View Details →</button>
          </div>

          {/* Mood Today */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Mood Today</h3>
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-2xl font-bold text-green-600">{demoData.elderlyPerson.mood}</p>
              <span className="text-lg">{getTrendIcon(demoData.elderlyPerson.moodTrend)}</span>
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
            <p className="text-2xl font-bold text-blue-600 mb-1">{demoData.elderlyPerson.alertsThisWeek}</p>
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
            {[
              { name: 'Emergency Call', icon: '📞', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
              { name: 'Special Request', icon: '💭', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
              { name: 'Extra Call', icon: '📅', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
              { name: 'Family News', icon: '📢', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
              { name: 'Quick Settings', icon: '⚙️', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
              { name: 'Download Report', icon: '📄', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' }
            ].map((action, index) => (
              <button key={index} className={`${action.color} p-4 rounded-lg transition-colors duration-200 text-center`}>
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-medium">{action.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Alert Settings */}
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

          {/* Care Settings */}
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

          {/* Full Care Report */}
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
            {/* Recent Family Interactions */}
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Recent Family Interactions</h4>
              <div className="space-y-3">
                {demoData.familyUpdates.map((update, index) => (
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
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Upcoming Events</h4>
              <div className="space-y-3">
                {demoData.upcomingEvents.map((event, index) => (
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
              {demoData.recentCalls.map((call, index) => (
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

                      {/* Topic Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {call.topics.map((topic, topicIndex) => (
                          <span key={topicIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>

                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>{call.summary}</p>

                      {/* Key Moments */}
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
            </div>
          </div>

          {/* Enhanced Automated Alerts */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Automated Alerts</h3>

            <div className="space-y-4">
              {demoData.automatedAlerts.map((alert, index) => (
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

          <div className="flex items-end space-x-4 h-40 mb-4">
            {demoData.moodChart.map((data, index) => (
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

          <div className={`flex justify-between items-center mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>1 (Low)</span>
            <span>Mood Scale</span>
            <span>5 (High)</span>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Trend Analysis:</span> Mood has been stable this week with a slight improvement trend. 
              Family visits on weekends correlate with higher mood scores.
            </p>
          </div>
        </div>

        {/* Wellbeing Dashboard */}
        <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Wellbeing Dashboard</h3>

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
        </div>

        {/* Call to Action */}
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
    // Import jsPDF first
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default
    
    // Import autoTable plugin
    await import('jspdf-autotable')
    
    console.log('PDF libraries loaded successfully')
    
    const doc = new jsPDF()
    
    // Define colors for consistent theming
    const colors = {
      primary: [59, 130, 246],      // Blue for conversations
      mood: [34, 197, 94],          // Green for mood
      alert: [251, 146, 60],        // Orange for alerts
      accent: [139, 92, 246],       // Purple for highlights
      light: [248, 250, 252],       // Light gray backgrounds
      text: [31, 41, 55],           // Dark text
      subtext: [107, 114, 128]      // Gray text
    }
    
    let pageNumber = 1
    
    // Helper function to add header and footer
    const addHeaderFooter = (title) => {
      // Header
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, 210, 15, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text('Family Wellbeing Summary Report', 20, 10)
      doc.text(`Page ${pageNumber}`, 170, 10)
      
      // Reset text color
      doc.setTextColor(...colors.text)
      
      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFillColor(...colors.light)
      doc.rect(0, pageHeight - 15, 210, 15, 'F')
      doc.setFontSize(8)
      doc.setTextColor(...colors.subtext)
      doc.text('Confidential Family Wellbeing Summary - Generated by ElderCare AI', 20, pageHeight - 8)
      doc.text(new Date().toLocaleDateString(), 170, pageHeight - 8)
      
      pageNumber++
    }
    
    // === COVER PAGE ===
    addHeaderFooter()
    
    // Logo placeholder (blue circle with heart)
    doc.setFillColor(...colors.primary)
    doc.circle(105, 40, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text('❤️', 101, 45)
    
    // Title
    doc.setTextColor(...colors.text)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('Family Wellbeing', 105, 65, { align: 'center' })
    doc.text('Summary Report', 105, 75, { align: 'center' })
    
    // Report details box
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
    
    // Companionship quality indicator
    doc.setFillColor(...colors.mood)
    doc.roundedRect(30, 170, 150, 25, 5, 5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall Companionship Quality: Excellent', 105, 185, { align: 'center' })
    
    // === PAGE 2: EXECUTIVE SUMMARY ===
    doc.addPage()
    addHeaderFooter()
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('Executive Summary', 20, 35)
    
    // Summary boxes
    const summaryBoxes = [
      { title: 'Daily Companionship', value: '7 calls this week', subtext: 'Avg duration: 12 minutes', color: colors.primary },
      { title: 'Emotional Wellbeing', value: 'Positive & Content', subtext: '15% improvement trend', color: colors.mood },
      { title: 'Engagement Level', value: 'Highly Engaged', subtext: 'Active in all conversations', color: colors.accent }
    ]
    
    summaryBoxes.forEach((box, index) => {
      const x = 20 + (index * 60)
      const y = 50
      
      doc.setFillColor(...box.color)
      doc.roundedRect(x, y, 55, 40, 3, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(box.title, x + 27.5, y + 10, { align: 'center' })
      doc.setFontSize(12)
      doc.text(box.value, x + 27.5, y + 22, { align: 'center' })
      doc.setFontSize(8)
      doc.text(box.subtext, x + 27.5, y + 32, { align: 'center' })
    })
    
    // Key highlights
    doc.setTextColor(...colors.text)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Key Highlights This Week', 20, 110)
    
    const highlights = [
      '🌟 Margaret expressed joy about her garden blooming beautifully',
      '👥 Mentioned upcoming family visit with great enthusiasm',
      '💬 Shared wonderful stories about her late husband during conversations',
      '🏡 Discussed plans for redecorating the living room',
      '📚 Excited about the new mystery novel she\'s reading'
    ]
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    highlights.forEach((highlight, index) => {
      doc.text(highlight, 20, 125 + (index * 12))
    })
    
    // Wellbeing indicators
    doc.setFillColor(...colors.light)
    doc.roundedRect(20, 190, 170, 50, 5, 5, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.text)
    doc.text('Wellbeing Indicators', 25, 205)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('• Social Connection: Excellent - actively discusses family and friends', 25, 220)
    doc.text('• Emotional State: Positive - consistent contentment and joy expressions', 25, 230)
    doc.text('• Mental Engagement: High - asks questions and shares detailed stories', 25, 240)
    
    // === PAGE 3: DAILY COMPANIONSHIP OVERVIEW ===
    doc.addPage()
    addHeaderFooter()
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('Daily Companionship Overview', 20, 35)
    
    // Call frequency chart (simple bar representation)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Call Pattern This Week', 20, 55)
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const callDurations = [12, 8, 15, 10, 13, 16, 11] // minutes
    
    days.forEach((day, index) => {
      const x = 30 + (index * 20)
      const height = callDurations[index] * 2 // Scale for visibility
      const y = 100 - height
      
      doc.setFillColor(...colors.primary)
      doc.rect(x, y, 15, height, 'F')
      doc.setTextColor(...colors.text)
      doc.setFontSize(8)
      doc.text(day, x + 7.5, 105, { align: 'center' })
      doc.text(`${callDurations[index]}m`, x + 7.5, y - 3, { align: 'center' })
    })
    
    // Engagement metrics
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['Metric', 'This Week', 'Trend', 'Notes']],
        body: [
          ['Average Call Duration', '12.1 minutes', '↗️ +2min', 'Increasingly engaged conversations'],
          ['Conversation Quality', 'Excellent', '→ Stable', 'Rich, detailed discussions'],
          ['Emotional Responses', 'Very Positive', '↗️ Improving', 'More laughter and joy expressed'],
          ['Topic Engagement', 'High Interest', '→ Consistent', 'Active participation in all topics'],
          ['Question Asking', '3-4 per call', '↗️ +1', 'Shows curiosity and engagement']
        ],
        startY: 120,
        theme: 'striped',
        headStyles: { fillColor: colors.primary },
        styles: { fontSize: 10 }
      })
    }
    
    // === PAGE 4: MOOD & EMOTIONAL WELLBEING ===
    doc.addPage()
    addHeaderFooter()
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.mood)
    doc.text('Mood & Emotional Wellbeing', 20, 35)
    
    // Mood trend visualization
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.text)
    doc.text('Daily Spirits Trend', 20, 55)
    
    const moodData = [
      { day: 'Mon', mood: 4, emoji: '😊', note: 'Content and chatty' },
      { day: 'Tue', mood: 3, emoji: '🙂', note: 'Pleasant but quieter' },
      { day: 'Wed', mood: 2, emoji: '😔', note: 'Mentioned feeling tired' },
      { day: 'Thu', mood: 3, emoji: '🙂', note: 'Energy returning' },
      { day: 'Fri', mood: 4, emoji: '😊', note: 'Excited about weekend' },
      { day: 'Sat', mood: 5, emoji: '😄', note: 'Family visit joy' },
      { day: 'Sun', mood: 4, emoji: '😊', note: 'Peaceful and grateful' }
    ]
    
    // Draw mood chart
    moodData.forEach((data, index) => {
      const x = 30 + (index * 22)
      const height = data.mood * 8
      const y = 100 - height
      
      // Bar
      doc.setFillColor(...colors.mood)
      doc.rect(x, y, 18, height, 'F')
      
      // Day label
      doc.setTextColor(...colors.text)
      doc.setFontSize(9)
      doc.text(data.day, x + 9, 105, { align: 'center' })
      
      // Emoji
      doc.setFontSize(12)
      doc.text(data.emoji, x + 9, y - 5, { align: 'center' })
      
      // Mood score
      doc.setFontSize(8)
      doc.text(`${data.mood}/5`, x + 9, y - 15, { align: 'center' })
    })
    
    // Mood insights table
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['Day', 'Mood', 'Emotional Indicators', 'Notable Moments']],
        body: moodData.map(data => [
          data.day,
          `${data.mood}/5 ${data.emoji}`,
          data.note,
          data.mood >= 4 ? 'Shared positive memories' : 'Offered gentle support'
        ]),
        startY: 120,
        theme: 'striped',
        headStyles: { fillColor: colors.mood },
        styles: { fontSize: 10 }
      })
    }
    
    // === PAGE 5: CONVERSATION HIGHLIGHTS ===
    doc.addPage()
    addHeaderFooter()
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.accent)
    doc.text('Conversation Highlights', 20, 35)
    
    // Favorite topics
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.text)
    doc.text('Favorite Discussion Topics', 20, 55)
    
    const topics = [
      { topic: '🌺 Gardening', frequency: '85%', engagement: 'Very High' },
      { topic: '👨‍👩‍👧‍👦 Family Stories', frequency: '70%', engagement: 'High' },
      { topic: '📚 Books & Reading', frequency: '60%', engagement: 'High' },
      { topic: '🍳 Cooking & Recipes', frequency: '45%', engagement: 'Medium' },
      { topic: '🌤️ Weather & Seasons', frequency: '40%', engagement: 'Medium' }
    ]
    
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['Topic', 'Discussion Frequency', 'Engagement Level']],
        body: topics.map(t => [t.topic, t.frequency, t.engagement]),
        startY: 65,
        theme: 'striped',
        headStyles: { fillColor: colors.accent },
        styles: { fontSize: 11 }
      })
    }
    
    // Meaningful moments
    const meaningfulMoments = [
      '"I spent all morning in the garden and the roses are absolutely beautiful this year!"',
      '"My grandson called yesterday and we talked for an hour about his new job."',
      '"I found my mother\'s old recipe book and made her famous apple pie."',
      '"The weather reminds me of the spring when your grandfather and I got married."',
      '"I\'m so grateful for these daily chats - they brighten my whole day."'
    ]
    
    let startY = typeof doc.autoTable === 'function' ? doc.lastAutoTable.finalY + 20 : 120
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Meaningful Moments This Week', 20, startY)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    meaningfulMoments.forEach((moment, index) => {
      const lines = doc.splitTextToSize(moment, 160)
      doc.text(lines, 25, startY + 15 + (index * 20))
    })
    
    // === PAGE 6: SOCIAL & FAMILY CONNECTIONS ===
    doc.addPage()
    addHeaderFooter()
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('Social & Family Connections', 20, 35)
    
    // Family mentions
    const familyMentions = [
      { name: 'Sarah (Daughter)', mentions: 12, context: 'Upcoming visit, grandchildren' },
      { name: 'Michael (Son)', mentions: 8, context: 'Work updates, weekend calls' },
      { name: 'Emma (Granddaughter)', mentions: 6, context: 'School achievements, art projects' },
      { name: 'Tom (Grandson)', mentions: 4, context: 'Sports, new job excitement' },
      { name: 'Close Friends', mentions: 15, context: 'Neighbors, book club friends' }
    ]
    
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['Family/Friend', 'Mentions This Week', 'Context & Topics']],
        body: familyMentions.map(f => [f.name, f.mentions.toString(), f.context]),
        startY: 50,
        theme: 'striped',
        headStyles: { fillColor: colors.primary },
        styles: { fontSize: 10 }
      })
    }
    
    // Social activities
    let socialY = typeof doc.autoTable === 'function' ? doc.lastAutoTable.finalY + 20 : 120
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Social Activities & Connections', 20, socialY)
    
    const activities = [
      '🏡 Regular chats with neighbor Mrs. Thompson about garden tips',
      '📚 Book club discussion about the latest mystery novel selection',
      '⛪ Sunday service attendance and fellowship time mentioned',
      '🛒 Weekly grocery shopping interactions with familiar store staff',
      '☎️ Phone calls with old friends from her hometown'
    ]
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    activities.forEach((activity, index) => {
      doc.text(activity, 25, socialY + 15 + (index * 12))
    })
    
    // === PAGE 7: AREAS NOTED & JOYFUL MOMENTS ===
    doc.addPage()
    addHeaderFooter()
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.alert)
    doc.text('Areas Noted for Family Awareness', 20, 35)
    
    // Gentle areas of note
    const areasNoted = [
      { area: 'Sleep Patterns', note: 'Mentioned feeling tired on Wednesday', action: 'Monitoring pattern' },
      { area: 'Back Comfort', note: 'Brief mention of back stiffness', action: 'Gentle inquiry about comfort' },
      { area: 'Memory Moments', note: 'Occasionally searches for words', action: 'Patient, supportive conversation' }
    ]
    
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['Area', 'Observation', 'Our Response']],
        body: areasNoted.map(a => [a.area, a.note, a.action]),
        startY: 50,
        theme: 'striped',
        headStyles: { fillColor: colors.alert },
        styles: { fontSize: 11 }
      })
    }
    
    // Joyful moments section
    let joyY = typeof doc.autoTable === 'function' ? doc.lastAutoTable.finalY + 30 : 120
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.mood)
    doc.text('Joyful Moments & Interests', 20, joyY)
    
    const joyfulMoments = [
      '🌹 Excitement about her rose garden reaching full bloom',
      '😊 Laughter when sharing funny stories about her cats',
      '📖 Enthusiasm for her new mystery novel series',
      '👶 Pure joy when talking about grandchildren\'s achievements',
      '🍰 Pride in successfully baking her mother\'s cake recipe',
      '☀️ Appreciation for beautiful sunny morning walks'
    ]
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    joyfulMoments.forEach((moment, index) => {
      doc.text(moment, 25, joyY + 20 + (index * 10))
    })
    
    // === PAGE 8: FAMILY INSIGHTS & CONTACT INFORMATION ===
    doc.addPage()
    addHeaderFooter()
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.accent)
    doc.text('Family Insights & Observations', 20, 35)
    
    const insights = [
      '💝 Family visits continue to be the highlight of Margaret\'s week',
      '🌻 Her garden brings consistent joy and is a favorite conversation topic',
      '📞 She looks forward to and values these daily companionship calls',
      '🎭 Storytelling about past experiences brings her great satisfaction',
      '🔗 She maintains strong connections with longtime friends and neighbors',
      '📚 Reading remains an active hobby that keeps her mind engaged'
    ]
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    insights.forEach((insight, index) => {
      const lines = doc.splitTextToSize(insight, 160)
      doc.text(lines, 25, 55 + (index * 15))
    })
    
    // Contact information box
    doc.setFillColor(...colors.light)
    doc.roundedRect(20, 160, 170, 70, 5, 5, 'F')
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(1)
    doc.roundedRect(20, 160, 170, 70, 5, 5, 'S')
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('Contact Information', 30, 175)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.text)
    doc.text('Primary Family Contact:', 30, 190)
    doc.text('Sarah Johnson (Daughter)', 30, 200)
    doc.text('Email: sarah.johnson@email.com', 30, 210)
    doc.text('Phone: (555) 123-4567', 30, 220)
    
    doc.text('Care Preferences:', 110, 190)
    doc.text('• Daily calls at 9:00 AM', 110, 200)
    doc.text('• Duration: 10-15 minutes', 110, 210)
    doc.text('• Focus: Companionship & wellbeing', 110, 220)
    
    // Final footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFillColor(...colors.primary)
    doc.rect(20, pageHeight - 40, 170, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Daily Companionship & Wellbeing Report', 105, pageHeight - 25, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on ${new Date().toLocaleDateString()} - Family Care Summary`, 105, pageHeight - 20, { align: 'center' })
    
    // Save the PDF
    const fileName = `Family_Wellbeing_Report_${dateRange.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    
    console.log('Saving PDF:', fileName)
    doc.save(fileName)
    console.log('Professional family wellbeing PDF saved successfully')
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
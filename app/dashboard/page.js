'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days')
  const [showCallDetails, setShowCallDetails] = useState(false)

  // Demo data for showcasing
  const demoData = {
    elderlyPerson: {
      name: 'Margaret Johnson',
      status: 'All Good',
      mood: 'Content',
      activity: 'Active',
      lastCall: 'Today at 9:15 AM',
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
        emoji: '😊'
      },
      {
        date: 'Yesterday at 15:51',
        duration: '8 minutes',
        mood: 'Tired',
        summary: "Discussed feeling more tired than usual. Mentioned difficulty sleeping.",
        insights: "Fatigue mentioned - monitoring for patterns. Sleep concerns noted.",
        moodScore: 2,
        emoji: '😔'
      }
    ],
    automatedAlerts: [
      {
        priority: 'MEDIUM',
        title: 'AI detected sadness in voice tone',
        description: 'Voice analysis detected indicators of sadness during today\'s call',
        action: 'Email sent to family',
        time: 'Today at 15:51'
      },
      {
        priority: 'LOW',
        title: 'Health keyword detected',
        description: 'Mentioned back pain during conversation',
        action: 'Email notification sent',
        time: 'Yesterday at 15:51'
      }
    ],
    moodChart: [
      { day: 'Mon', mood: 4 },
      { day: 'Tue', mood: 3 },
      { day: 'Wed', mood: 2 },
      { day: 'Thu', mood: 3 },
      { day: 'Fri', mood: 4 },
      { day: 'Sat', mood: 4 },
      { day: 'Sun', mood: 4 }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Family Dashboard</h1>
                <p className="text-sm text-gray-600">Automated AI monitoring and care insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 text-sm font-medium">AI Monitoring Active</span>
              </div>
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Current Status</h3>
            <p className="text-2xl font-bold text-green-600 mb-1">{demoData.elderlyPerson.status}</p>
            <p className="text-xs text-gray-500">AI analysis complete</p>
          </div>

          {/* Last Call */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Last Call</h3>
            <p className="text-lg font-semibold text-gray-900 mb-1">{demoData.elderlyPerson.lastCall}</p>
            <p className="text-xs text-gray-500">Automatic daily check-in</p>
          </div>

          {/* Mood Today */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Mood Today</h3>
            <p className="text-2xl font-bold text-green-600 mb-1">{demoData.elderlyPerson.mood}</p>
            <p className="text-xs text-gray-500">AI voice analysis</p>
          </div>

          {/* This Week's Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">This Week's Alerts</h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">{demoData.elderlyPerson.alertsThisWeek}</p>
            <p className="text-xs text-gray-500">Auto-generated by AI</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Alert Settings */}
          <div className="bg-blue-500 rounded-lg p-6 text-white cursor-pointer hover:bg-blue-600 transition-colors">
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
          </div>

          {/* Care Settings */}
          <div className="bg-green-500 rounded-lg p-6 text-white cursor-pointer hover:bg-green-600 transition-colors">
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
          </div>

          {/* Full Care Report */}
          <div className="bg-orange-400 rounded-lg p-6 text-white cursor-pointer hover:bg-orange-500 transition-colors">
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
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent AI Conversations */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent AI Conversations</h3>

            <div className="space-y-6">
              {demoData.recentCalls.map((call, index) => (
                <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{call.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">{call.date}</span>
                          <span className="text-sm text-gray-500">Duration: {call.duration}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI Analyzed</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{call.summary}</p>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">AI Insights:</span> {call.insights}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Automated Alerts</h3>

            <div className="space-y-4">
              {demoData.automatedAlerts.map((alert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      alert.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {alert.priority}
                    </span>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                  <p className="text-xs text-blue-600">
                    <span className="font-medium">Action:</span> {alert.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood Chart */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Mood Over Time</h3>

          <div className="flex items-end space-x-4 h-40">
            {demoData.moodChart.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end mb-2">
                  <div 
                    className="w-full bg-blue-400 rounded-t-md transition-all duration-500"
                    style={{ height: `${(data.mood / 5) * 100}%`, minHeight: '20px' }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{data.day}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
            <span>1 (Low)</span>
            <span>Mood Scale</span>
            <span>5 (High)</span>
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
    </div>
  )
}

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
      status: 'Excellent',
      mood: 'Content',
      activity: 'Active',
      lastCall: 'Today 9:15 AM',
      nextCall: 'Tomorrow 9:00 AM'
    },
    recentCalls: [
      {
        date: 'Today 9:15 AM',
        duration: '12 minutes',
        mood: 'Content',
        summary: "I had a wonderful sleep and woke up feeling refreshed. I've already had my breakfast and took my morning medications. Susan from next door popped by to chat about her garden.",
        healthIndicators: ['✓ Medications taken on time', '✓ Good mobility', '✓ Positive social interaction'],
        moodScore: 4
      },
      {
        date: 'Yesterday 9:30 AM',
        duration: '15 minutes',
        mood: 'Happy',
        summary: "I'm feeling quite energetic today! I did some light gardening and called my sister in Scotland. The weather is lovely and I'm planning to go for a walk later.",
        healthIndicators: ['✓ Physical activity completed', '✓ Social connections maintained', '✓ Positive outlook'],
        moodScore: 5
      },
      {
        date: '2 days ago 9:00 AM',
        duration: '10 minutes',
        mood: 'Calm',
        summary: "I had a quiet morning reading my book. My arthritis is acting up a bit with the weather change, but nothing too concerning. I took my pain medication and it's helping.",
        healthIndicators: ['✓ Self-care awareness', '✓ Medication compliance', '⚠ Minor arthritis discomfort'],
        moodScore: 3
      }
    ],
    weeklyStats: {
      averageMood: 4.2,
      callsCompleted: 7,
      healthAlerts: 0,
      socialInteractions: 5
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50">
      {/* Header */}
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
              <div className="flex items-center space-x-2 bg-care-50 px-3 py-2 rounded-full border border-care-200">
                <div className="w-2 h-2 bg-care-500 rounded-full animate-pulse"></div>
                <span className="text-care-700 text-sm font-medium">Demo Mode</span>
              </div>
              <Link href="/" className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200">
                Back to Home
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-full hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary-50 border border-primary-200 rounded-full px-4 py-2 mb-6">
            <span className="text-primary-600 text-sm font-medium">👋 Welcome to your dashboard</span>
          </div>
          <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">
            Caring for {demoData.elderlyPerson.name}
          </h2>
          <p className="text-xl text-trust-600">Monitor wellbeing and AI companion interactions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Status Card */}
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-care-500 rounded-full mr-3 animate-pulse"></div>
                <h4 className="font-semibold text-trust-800">Current Status</h4>
              </div>
              <span className="text-xs bg-care-200 text-care-700 px-2 py-1 rounded-full">Live</span>
            </div>
            <p className="text-3xl font-bold text-care-600 mb-2">{demoData.elderlyPerson.status}</p>
            <p className="text-sm text-trust-600">Last call: {demoData.elderlyPerson.lastCall}</p>
            <div className="mt-4 bg-care-200 rounded-full h-2">
              <div className="bg-care-500 h-2 rounded-full w-4/5 transition-all duration-500"></div>
            </div>
          </div>

          {/* Mood Card */}
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary-600">😊</span>
              </div>
              <h4 className="font-semibold text-trust-800">Mood Analysis</h4>
            </div>
            <p className="text-3xl font-bold text-primary-600 mb-2">{demoData.elderlyPerson.mood}</p>
            <p className="text-sm text-trust-600 italic">"I'm having a lovely day, dear"</p>
            <div className="flex space-x-1 mt-4">
              {[1,2,3,4,5].map((i) => (
                <div 
                  key={i} 
                  className={`h-6 w-2 rounded-full transition-all duration-300 ${
                    i <= demoData.weeklyStats.averageMood ? 'bg-primary-400' : 'bg-primary-200'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-warm-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-warm-700">🏃‍♀️</span>
              </div>
              <h4 className="font-semibold text-trust-800">Daily Activity</h4>
            </div>
            <p className="text-3xl font-bold text-warm-600 mb-2">{demoData.elderlyPerson.activity}</p>
            <p className="text-sm text-trust-600">Morning walk completed</p>
            <div className="flex items-center mt-4 space-x-2">
              <div className="flex-1 bg-warm-200 rounded-full h-2">
                <div className="bg-warm-500 h-2 rounded-full w-3/4 transition-all duration-500"></div>
              </div>
              <span className="text-xs text-warm-600 font-medium">75%</span>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-trust-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-trust-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-trust-600">📊</span>
              </div>
              <h4 className="font-semibold text-trust-800">This Week</h4>
            </div>
            <p className="text-3xl font-bold text-trust-600 mb-2">{demoData.weeklyStats.callsCompleted}/7</p>
            <p className="text-sm text-trust-600">Calls completed</p>
            <div className="flex items-center mt-4 space-x-2">
              <div className="flex-1 bg-trust-200 rounded-full h-2">
                <div className="bg-trust-500 h-2 rounded-full w-full transition-all duration-500"></div>
              </div>
              <span className="text-xs text-trust-600 font-medium">100%</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-1 shadow-soft border border-trust-100">
            {[
              { value: '24h', label: 'Last 24h' },
              { value: '7days', label: 'Last 7 days' },
              { value: '30days', label: 'Last 30 days' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedTimeRange(option.value)}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedTimeRange === option.value
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-trust-600 hover:bg-trust-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-heading font-semibold text-trust-900">Recent Conversations</h3>
            <button
              onClick={() => setShowCallDetails(!showCallDetails)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              {showCallDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="space-y-6">
            {demoData.recentCalls.map((call, index) => (
              <div 
                key={index}
                className="group p-6 bg-gradient-to-r from-trust-50 to-warm-50 rounded-2xl border border-trust-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <p className="text-sm font-medium text-trust-600">{call.date}</p>
                        <span className="w-1 h-1 bg-trust-300 rounded-full"></span>
                        <p className="text-sm text-trust-500">Duration: {call.duration}</p>
                        <span className="w-1 h-1 bg-trust-300 rounded-full"></span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-trust-500">Mood:</span>
                          <span className={`text-sm font-medium ${
                            call.mood === 'Happy' ? 'text-care-600' : 
                            call.mood === 'Content' ? 'text-primary-600' : 'text-trust-600'
                          }`}>
                            {call.mood}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {[1,2,3,4,5].map((i) => (
                          <div 
                            key={i} 
                            className={`h-4 w-1 rounded-full ${
                              i <= call.moodScore ? 'bg-primary-400' : 'bg-primary-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-trust-800 leading-relaxed mb-4">{call.summary}</p>
                    
                    {showCallDetails && (
                      <div className="mt-4 pt-4 border-t border-trust-200">
                        <p className="text-sm font-medium text-trust-600 mb-2">Health Indicators</p>
                        <div className="space-y-1">
                          {call.healthIndicators.map((indicator, idx) => (
                            <p key={idx} className={`text-sm ${
                              indicator.includes('✓') ? 'text-care-600' : 'text-warm-600'
                            }`}>
                              {indicator}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* AI Insights */}
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary-600">🤖</span>
              </div>
              <h3 className="text-xl font-heading font-semibold text-trust-900">AI Insights</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-care-50 rounded-2xl border border-care-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-care-500 rounded-full"></div>
                  <p className="text-sm font-medium text-care-700">Positive Trend</p>
                </div>
                <p className="text-trust-800">Margaret's mood has been consistently positive over the past week, with increased social interactions.</p>
              </div>
              
              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <p className="text-sm font-medium text-primary-700">Health Pattern</p>
                </div>
                <p className="text-trust-800">Regular medication adherence and consistent morning routines observed.</p>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-warm-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-warm-600">📅</span>
              </div>
              <h3 className="text-xl font-heading font-semibold text-trust-900">Upcoming Schedule</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-trust-800">Next Call</p>
                    <p className="text-sm text-trust-600">{demoData.elderlyPerson.nextCall}</p>
                  </div>
                </div>
                <span className="text-xs bg-primary-200 text-primary-700 px-2 py-1 rounded-full">Scheduled</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-warm-50 rounded-2xl border border-warm-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-warm-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-trust-800">Doctor Appointment</p>
                    <p className="text-sm text-trust-600">Friday 2:30 PM</p>
                  </div>
                </div>
                <span className="text-xs bg-warm-200 text-warm-700 px-2 py-1 rounded-full">Reminder Set</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-500 to-care-500 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-heading font-bold mb-4">Experience This Level of Care</h3>
            <p className="text-lg mb-6 opacity-90">This is what peace of mind looks like. Real families use ElderCare AI every day.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-primary-50 transition-all duration-200 shadow-soft">
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

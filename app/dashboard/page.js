
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        router.push('/login')
        return
      }
      
      setUser(session.user)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">💝</span>
          </div>
          <h2 className="text-xl font-heading font-semibold text-trust-900 mb-2">Loading Dashboard...</h2>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
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
              <span className="text-trust-600">Welcome, {user?.user_metadata?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">Your ElderCare Dashboard</h2>
          <p className="text-xl text-trust-600">Monitor your family member's wellbeing and AI companion interactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Card */}
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-care-500 rounded-full mr-3 animate-pulse"></div>
                <h4 className="font-semibold text-trust-800">Current Status</h4>
              </div>
              <span className="text-xs bg-care-200 text-care-700 px-2 py-1 rounded-full">Live</span>
            </div>
            <p className="text-3xl font-bold text-care-600 mb-2">Excellent</p>
            <p className="text-sm text-trust-600">Last call: Today 9:15 AM</p>
            <div className="mt-4 bg-care-200 rounded-full h-2">
              <div className="bg-care-500 h-2 rounded-full w-4/5"></div>
            </div>
          </div>

          {/* Mood Card */}
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary-600">😊</span>
              </div>
              <h4 className="font-semibold text-trust-800">Mood Analysis</h4>
            </div>
            <p className="text-3xl font-bold text-primary-600 mb-2">Content</p>
            <p className="text-sm text-trust-600 italic">"I'm having a lovely day, dear"</p>
            <div className="flex space-x-1 mt-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`h-6 w-2 rounded-full ${i <= 4 ? 'bg-primary-400' : 'bg-primary-200'}`}></div>
              ))}
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-warm-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-warm-700">🏃‍♀️</span>
              </div>
              <h4 className="font-semibold text-trust-800">Daily Activity</h4>
            </div>
            <p className="text-3xl font-bold text-warm-600 mb-2">Active</p>
            <p className="text-sm text-trust-600">Morning walk completed</p>
            <div className="flex items-center mt-4 space-x-2">
              <div className="flex-1 bg-warm-200 rounded-full h-2">
                <div className="bg-warm-500 h-2 rounded-full w-3/4"></div>
              </div>
              <span className="text-xs text-warm-600 font-medium">75%</span>
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="mt-12 bg-white rounded-3xl shadow-soft p-8 border border-trust-100">
          <h3 className="text-2xl font-heading font-semibold text-trust-900 mb-6">Recent Conversations</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-trust-50 rounded-2xl">
              <div className="w-3 h-3 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-sm font-medium text-trust-600">Today 9:15 AM</p>
                  <span className="w-1 h-1 bg-trust-300 rounded-full"></span>
                  <p className="text-sm text-trust-500">Duration: 12 minutes</p>
                </div>
                <p className="text-trust-800 leading-relaxed">"I had a wonderful sleep and woke up feeling refreshed. I've already had my breakfast and took my morning medications. Susan from next door popped by to chat about her garden."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

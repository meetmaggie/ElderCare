import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [email, setEmail] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    // For now, just show alert - we'll connect this to Supabase later
    alert(`Thanks for your interest! We'll contact you at ${email}`)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">❤️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ElderCare AI</h1>
            </div>
            <div className="space-x-4">
              <button className="text-blue-600 hover:text-blue-800">Sign In</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Never Worry About Mum Again
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Daily AI companion calls keep your elderly parent happy, healthy, and connected. 
            Get real-time health monitoring, mood tracking, and instant alerts when something's wrong.
          </p>

          {/* Email Signup */}
          <form onSubmit={handleSignup} className="max-w-md mx-auto mb-8">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Start Free Trial
              </button>
            </div>
          </form>
          <p className="text-sm text-gray-500">Free 7-day trial • No credit card required</p>
        </div>

        {/* Demo Dashboard Preview */}
        <div className="mt-16 bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center">What Families See</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h4 className="font-semibold">Current Status</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">Good</p>
              <p className="text-sm text-gray-600">Last call: Today 9:15 AM</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-5 h-5 text-blue-500 mr-3">❤️</div>
                <h4 className="font-semibold">Mood Today</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">Content</p>
              <p className="text-sm text-gray-600">"I'm having a good day"</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-5 h-5 text-yellow-500 mr-3">📞</div>
                <h4 className="font-semibold">Social Activity</h4>
              </div>
              <p className="text-2xl font-bold text-yellow-600">Active</p>
              <p className="text-sm text-gray-600">Talked to neighbour yesterday</p>
            </div>
          </div>

          {/* Sample conversation */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Today's Conversation Summary</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-600">9:15 AM</p>
                  <p className="text-gray-800">"I slept well and had a nice chat with my neighbour Susan about her garden."</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-600">Mood Assessment</p>
                  <p className="text-gray-800">Content and socially engaged</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Daily AI Calls</h3>
              <p className="text-gray-600">
                Warm, caring AI companion calls your parent daily to chat about their day, 
                health, and activities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Health Monitoring</h3>
              <p className="text-gray-600">
                AI tracks mood, health concerns, and social activities. 
                Get alerts for emergencies or concerning changes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Peace of Mind</h3>
              <p className="text-gray-600">
                Daily reports, mood trends, and instant notifications give you 
                confidence your parent is safe and cared for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">£39<span className="text-lg text-gray-500">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Daily AI calls
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Health monitoring
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Weekly reports
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Email alerts
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Start Free Trial
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 mt-2">Premium</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">£59<span className="text-lg text-gray-500">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Everything in Basic
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Real-time alerts
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>SMS notifications
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Emergency calling
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Start Free Trial
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Family</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">£99<span className="text-lg text-gray-500">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Everything in Premium
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Multiple parents
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Family sharing
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Priority support
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center mr-2">
                  <span className="text-sm">❤️</span>
                </div>
                <h3 className="text-xl font-bold">ElderCare AI</h3>
              </div>
              <p className="text-gray-400">
                Keeping families connected and elderly parents safe through AI companionship.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Centre</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Book Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ElderCare AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
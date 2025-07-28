
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    elderlyName: '',
    elderlyPhone: '',
    relationship: 'child'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Check if this is a testing account
    const isTestAccount = formData.email.endsWith('@test.local')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            elderly_name: formData.elderlyName,
            elderly_phone: formData.elderlyPhone,
            relationship: formData.relationship,
            account_type: isTestAccount ? 'test' : 'regular'
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // For test accounts, bypass payment and go directly to dashboard
        if (isTestAccount) {
          router.push('/dashboard')
        } else {
          // For regular accounts, redirect to payment flow (or dashboard for now)
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
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
            <Link 
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-trust p-8 border border-trust-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-2">Start your free trial</h2>
            <p className="text-trust-600">Create your ElderCare AI account in minutes</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-trust-700 mb-2">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-trust-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-trust-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-trust-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-trust-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-trust-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-trust-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-trust-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="border-t border-trust-200 pt-6">
              <h3 className="text-lg font-semibold text-trust-900 mb-4">Family Member Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="elderlyName" className="block text-sm font-medium text-trust-700 mb-2">
                    Elderly Family Member's Name
                  </label>
                  <input
                    id="elderlyName"
                    name="elderlyName"
                    type="text"
                    required
                    value={formData.elderlyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-trust-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Margaret Smith"
                  />
                </div>

                <div>
                  <label htmlFor="elderlyPhone" className="block text-sm font-medium text-trust-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="elderlyPhone"
                    name="elderlyPhone"
                    type="tel"
                    required
                    value={formData.elderlyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-trust-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    placeholder="+44 7700 900123"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="relationship" className="block text-sm font-medium text-trust-700 mb-2">
                  Your Relationship
                </label>
                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-trust-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="child">Child</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating Account...' : 'Start Free Trial'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-trust-500">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-xs">
                <strong>Developers:</strong> Use @test.local email to bypass payment and access full features
              </p>
            </div>
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium mt-4 block">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

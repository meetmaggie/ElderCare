
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        throw error
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Invalid email or password'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account'
      }

      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }))
    }
  }

  return (
    <>
      <Head>
        <title>Sign In - ElderCare AI</title>
        <meta name="description" content="Sign in to your ElderCare AI family dashboard" />
      </Head>

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
                href="/signup"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                Need an account?
              </Link>
            </div>
          </div>
        </header>

        <div className="py-20 px-4">
          <div className="max-w-md mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">
                Welcome Back
              </h2>
              <p className="text-lg text-trust-600">Sign in to access your family dashboard</p>
            </motion.div>

            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit} 
              className="bg-white rounded-3xl shadow-trust border border-trust-100 p-8"
            >
              {errors.submit && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start"
                >
                  <span className="text-red-500 mr-3 mt-0.5">⚠</span>
                  <span>{errors.submit}</span>
                </motion.div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-trust-700 font-medium mb-3">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-5 py-4 border-2 border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-trust-700 font-medium mb-3">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-5 py-4 border-2 border-trust-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold text-lg transform transition-all duration-200 ${
                    isLoading
                      ? 'opacity-75 cursor-not-allowed'
                      : 'hover:from-primary-600 hover:to-primary-700 hover:scale-105 shadow-soft'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              <div className="mt-8 text-center space-y-4">
                <p className="text-trust-500">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </>
  )
}

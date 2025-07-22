import { useState } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'

export default function DemoSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [results, setResults] = useState(null)

  const setupDemoAccounts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/setup-demo-accounts', {
        method: 'POST'
      })
      const data = await response.json()
      setResults(data)
      setSetupComplete(true)
    } catch (error) {
      console.error('Setup error:', error)
      alert('Error setting up demo accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const populateDemoData = async () => {
    try {
      const response = await fetch('/api/populate-demo-data', {
        method: 'POST'
      })
      const data = await response.json()
      alert(`Demo data populated: ${data.callRecords} calls, ${data.alerts} alerts`)
    } catch (error) {
      console.error('Population error:', error)
      alert('Error populating demo data')
    }
  }

  return (
    <>
      <Head>
        <title>Demo Setup - ElderCare AI</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-heading font-bold text-trust-900 mb-4">
              Demo Account Setup
            </h1>
            <p className="text-xl text-trust-600">Create demo accounts for testing the ElderCare AI platform</p>
          </motion.div>

          {!setupComplete ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100"
            >
              <h2 className="text-2xl font-heading font-semibold text-trust-900 mb-6">Setup Demo Accounts</h2>

              <div className="space-y-6 mb-8">
                <div className="border border-trust-200 rounded-xl p-6">
                  <h3 className="font-semibold text-trust-800 mb-2">👩‍💼 Sarah Johnson - Premium Plan</h3>
                  <p className="text-trust-600 text-sm mb-1">Email: sarah.johnson.demo@gmail.com | Password: password123</p>
                  <p className="text-trust-500 text-sm">Caring for Margaret Johnson (grandmother) • Premium features</p>
                </div>

                <div className="border border-trust-200 rounded-xl p-6">
                  <h3 className="font-semibold text-trust-800 mb-2">👨‍💻 David Chen - Basic Plan</h3>
                  <p className="text-trust-600 text-sm mb-1">Email: david.chen.demo@gmail.com | Password: password123</p>
                  <p className="text-trust-500 text-sm">Caring for Li Chen (father) • Essential features</p>
                </div>

                <div className="border border-trust-200 rounded-xl p-6">
                  <h3 className="font-semibold text-trust-800 mb-2">👩‍🏫 Emma Thompson - Family Plan</h3>
                  <p className="text-trust-600 text-sm mb-1">Email: emma.thompson.demo@gmail.com | Password: password123</p>
                  <p className="text-trust-500 text-sm">Caring for Robert Thompson (grandfather) • Full features</p>
                </div>
              </div>

              <button
                onClick={setupDemoAccounts}
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
                    Setting up accounts...
                  </span>
                ) : (
                  'Create Demo Accounts'
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">✓</span>
                </div>
                <h2 className="text-3xl font-heading font-bold text-trust-900 mb-4">Demo Accounts Created!</h2>
                <p className="text-trust-600">All demo accounts have been set up successfully.</p>
              </div>

              {results?.loginInstructions && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-trust-800 mb-4">Login Credentials:</h3>
                  <div className="space-y-3">
                    {results.loginInstructions.accounts.map((account, index) => (
                      <div key={index} className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                        <p className="font-medium text-primary-800">{account.description}</p>
                        <p className="text-sm text-primary-600 mt-1">
                          Email: <span className="font-mono">{account.email}</span> | 
                          Password: <span className="font-mono">{account.password}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/fix-demo-data', { method: 'POST' })
                      const data = await response.json()
                      alert(`Demo data fix completed. Check console for details.`)
                      console.log('Fix results:', data)
                    } catch (error) {
                      alert('Error fixing demo data')
                      console.error(error)
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all"
                >
                  Fix Demo Data
                </button>
                <button
                  onClick={populateDemoData}
                  className="flex-1 bg-gradient-to-r from-care-500 to-care-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-care-600 hover:to-care-700 transition-all"
                >
                  Populate Demo Data
                </button>
                <Link 
                  href="/login"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all text-center"
                >
                  Go to Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
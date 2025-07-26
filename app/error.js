
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-xl">⚠️</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-trust-900 mb-4">Something went wrong</h1>
        <p className="text-trust-600 mb-8">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-white text-primary-600 border-2 border-primary-200 px-6 py-3 rounded-full font-semibold hover:bg-primary-50 transition-all duration-200 shadow-soft text-center"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

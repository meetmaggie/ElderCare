
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">💝</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-trust-900 mb-4">Page not found</h1>
        <p className="text-trust-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft inline-block"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

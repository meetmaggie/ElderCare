
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - ElderCare AI',
  description: 'ElderCare AI privacy policy - How we protect your family\'s data and conversations',
}

export default function PrivacyPolicy() {
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
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-3xl shadow-soft p-8 lg:p-12 border border-trust-100">
          <h1 className="text-4xl font-heading font-bold text-trust-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-trust-600 mb-8">
              At ElderCare AI, protecting your privacy and your family's data is our highest priority. 
              This policy explains how we collect, use, and safeguard your information.
            </p>

            <h2 className="text-2xl font-heading font-semibold text-trust-900 mt-8 mb-4">Information We Collect</h2>
            <ul className="text-trust-700 space-y-2">
              <li>• Account information (name, email, phone number)</li>
              <li>• Conversation recordings and transcripts with your elderly family member</li>
              <li>• Health and wellness insights derived from conversations</li>
              <li>• Usage data and technical information</li>
            </ul>

            <h2 className="text-2xl font-heading font-semibold text-trust-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="text-trust-700 space-y-2">
              <li>• Provide AI companion services to your family member</li>
              <li>• Generate health and wellness reports for family members</li>
              <li>• Send alerts and notifications about concerning patterns</li>
              <li>• Improve our service quality and AI capabilities</li>
            </ul>

            <h2 className="text-2xl font-heading font-semibold text-trust-900 mt-8 mb-4">Data Security</h2>
            <p className="text-trust-700">
              We employ industry-standard encryption and security measures to protect your data. 
              All conversations are encrypted in transit and at rest. We never share personal 
              information with third parties without explicit consent.
            </p>

            <h2 className="text-2xl font-heading font-semibold text-trust-900 mt-8 mb-4">Your Rights</h2>
            <ul className="text-trust-700 space-y-2">
              <li>• Request access to your personal data</li>
              <li>• Request correction of inaccurate data</li>
              <li>• Request deletion of your data</li>
              <li>• Withdraw consent at any time</li>
            </ul>

            <h2 className="text-2xl font-heading font-semibold text-trust-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-trust-700">
              If you have questions about this privacy policy or our data practices, 
              please contact us at privacy@eldercare-ai.com
            </p>

            <p className="text-trust-500 text-sm mt-8">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


import Link from 'next/link'
import Head from 'next/head'

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - ElderCare AI</title>
        <meta name="description" content="ElderCare AI privacy policy - How we protect your family's data and conversations" />
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
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-full hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Privacy Policy Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-trust p-8 lg:p-12 border border-trust-100">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-trust-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-trust-600 max-w-3xl mx-auto">
                Your family's privacy and security are our highest priorities. Here's how we protect your data.
              </p>
              <div className="mt-6 inline-flex items-center bg-care-50 border border-care-200 rounded-full px-4 py-2">
                <span className="text-care-600 text-sm font-medium">🛡️ Last Updated: January 2025</span>
              </div>
            </div>

            {/* Privacy Sections */}
            <div className="space-y-12">
              {/* Data Collection */}
              <section>
                <h2 className="text-3xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 text-xl">📊</span>
                  </div>
                  How We Collect and Use Conversation Data
                </h2>
                <div className="prose prose-lg text-trust-700 max-w-none">
                  <p className="mb-4">
                    ElderCare AI collects conversation data solely to provide caring companionship and family insights. Here's exactly what we collect and why:
                  </p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-3 mt-1">•</span>
                      <span><strong>Voice conversations:</strong> To provide personalized daily check-ins and analyze wellbeing patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-3 mt-1">•</span>
                      <span><strong>Mood indicators:</strong> To alert families of concerning changes in emotional wellbeing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-3 mt-1">•</span>
                      <span><strong>Activity mentions:</strong> To track daily routines and social connections for family peace of mind</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-3 mt-1">•</span>
                      <span><strong>Emergency indicators:</strong> To provide immediate alerts when urgent care may be needed</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Family-Only Sharing */}
              <section>
                <h2 className="text-3xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-care-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-care-600 text-xl">👨‍👩‍👧‍👦</span>
                  </div>
                  Family-Only Data Sharing Policy
                </h2>
                <div className="bg-care-50 border border-care-200 rounded-2xl p-6 mb-6">
                  <p className="text-care-800 font-medium text-lg">
                    Your family's conversations are shared exclusively with designated family members - never with anyone else.
                  </p>
                </div>
                <div className="prose prose-lg text-trust-700 max-w-none">
                  <p className="mb-4">Our strict family-only sharing means:</p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start">
                      <span className="text-care-500 mr-3 mt-1">✓</span>
                      <span>Only family members you explicitly authorize can access conversation insights</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-care-500 mr-3 mt-1">✓</span>
                      <span>You control exactly who receives daily reports and emergency alerts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-care-500 mr-3 mt-1">✓</span>
                      <span>Family members can be added or removed from access at any time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-care-500 mr-3 mt-1">✓</span>
                      <span>Each family member sees only the insights relevant to their care role</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-3xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-warm-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-warm-600 text-xl">🗓️</span>
                  </div>
                  Data Retention - Automatic Deletion After 30 Days
                </h2>
                <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6 mb-6">
                  <p className="text-warm-800 font-medium text-lg">
                    All conversation recordings are automatically deleted after 30 days. Only summary insights are retained for ongoing care.
                  </p>
                </div>
                <div className="prose prose-lg text-trust-700 max-w-none">
                  <p className="mb-4">Our data retention policy ensures privacy while maintaining care continuity:</p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start">
                      <span className="text-warm-500 mr-3 mt-1">⏰</span>
                      <span><strong>30-day automatic deletion:</strong> Raw conversation recordings are permanently deleted</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warm-500 mr-3 mt-1">📋</span>
                      <span><strong>Care summaries retained:</strong> Anonymous wellness patterns help improve ongoing care</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warm-500 mr-3 mt-1">🚨</span>
                      <span><strong>Emergency records:</strong> Critical health alerts may be retained longer for safety</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warm-500 mr-3 mt-1">🗑️</span>
                      <span><strong>Immediate deletion available:</strong> Families can request faster deletion at any time</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* No Third-Party Sharing */}
              <section>
                <h2 className="text-3xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl">🚫</span>
                  </div>
                  No Third-Party Sharing Ever
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                  <p className="text-red-800 font-medium text-lg">
                    We never sell, rent, or share your family's data with third parties. Not for marketing, not for research, not ever.
                  </p>
                </div>
                <div className="prose prose-lg text-trust-700 max-w-none">
                  <p className="mb-4">Our commitment means:</p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">✗</span>
                      <span>No data sharing with insurance companies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">✗</span>
                      <span>No marketing data sales to advertisers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">✗</span>
                      <span>No research data sharing with universities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">✗</span>
                      <span>No government data requests (except legal requirements)</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Secure Data Handling */}
              <section>
                <h2 className="text-3xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 text-xl">🔒</span>
                  </div>
                  Secure Data Handling Practices
                </h2>
                <div className="prose prose-lg text-trust-700 max-w-none">
                  <p className="mb-4">We use industry-leading security measures to protect your family's conversations:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                      <h4 className="font-semibold text-primary-800 mb-2">🔐 Encryption</h4>
                      <p className="text-trust-600 text-sm">End-to-end encryption for all conversations and data transmission</p>
                    </div>
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                      <h4 className="font-semibold text-primary-800 mb-2">☁️ Secure Storage</h4>
                      <p className="text-trust-600 text-sm">GDPR-compliant cloud infrastructure with UK data centres</p>
                    </div>
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                      <h4 className="font-semibold text-primary-800 mb-2">👤 Access Controls</h4>
                      <p className="text-trust-600 text-sm">Multi-factor authentication and role-based family access</p>
                    </div>
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                      <h4 className="font-semibold text-primary-800 mb-2">🔍 Regular Audits</h4>
                      <p className="text-trust-600 text-sm">Monthly security reviews and penetration testing</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Family Rights */}
              <section>
                <h2 className="text-3xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-care-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-care-600 text-xl">⚖️</span>
                  </div>
                  Your Family's Rights to Access and Delete Data
                </h2>
                <div className="prose prose-lg text-trust-700 max-w-none">
                  <p className="mb-4">Under GDPR and UK data protection laws, your family has complete control:</p>
                  <div className="space-y-4">
                    <div className="bg-care-50 border border-care-200 rounded-xl p-4">
                      <h4 className="font-semibold text-care-800 mb-2">📋 Right to Access</h4>
                      <p className="text-trust-600">Request complete copies of all data we hold about your family member</p>
                    </div>
                    <div className="bg-care-50 border border-care-200 rounded-xl p-4">
                      <h4 className="font-semibold text-care-800 mb-2">✏️ Right to Correction</h4>
                      <p className="text-trust-600">Correct any inaccurate information in your family's care profile</p>
                    </div>
                    <div className="bg-care-50 border border-care-200 rounded-xl p-4">
                      <h4 className="font-semibold text-care-800 mb-2">🗑️ Right to Deletion</h4>
                      <p className="text-trust-600">Request immediate deletion of all family data at any time</p>
                    </div>
                    <div className="bg-care-50 border border-care-200 rounded-xl p-4">
                      <h4 className="font-semibold text-care-800 mb-2">📤 Right to Portability</h4>
                      <p className="text-trust-600">Download your family's data in a standard format for transfer</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-3xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-warm-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-warm-600 text-xl">📞</span>
                  </div>
                  Contact Information for Privacy Questions
                </h2>
                <div className="bg-gradient-to-r from-warm-50 to-primary-50 border border-warm-200 rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-trust-800 mb-4">Privacy Officer</h4>
                      <div className="space-y-2 text-trust-600">
                        <p>📧 privacy@eldercare-ai.co.uk</p>
                        <p>📞 0800 123 4567</p>
                        <p>📬 ElderCare AI Privacy Team<br/>
                           123 Care Street<br/>
                           London SW1A 1AA</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-trust-800 mb-4">Response Times</h4>
                      <div className="space-y-2 text-trust-600">
                        <p>🚨 <strong>Emergency privacy concerns:</strong> Within 2 hours</p>
                        <p>📋 <strong>Data access requests:</strong> Within 3 working days</p>
                        <p>🗑️ <strong>Deletion requests:</strong> Within 24 hours</p>
                        <p>❓ <strong>General privacy questions:</strong> Within 1 working day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-trust-200 text-center">
              <p className="text-trust-500 mb-4">
                This privacy policy demonstrates our commitment to protecting your family's most precious conversations.
              </p>
              <Link href="/" className="inline-flex items-center bg-gradient-to-r from-primary-500 to-care-500 text-white px-8 py-3 rounded-full font-semibold hover:from-primary-600 hover:to-care-600 transition-all duration-200 shadow-soft">
                Back to ElderCare AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import Link from 'next/link'
import { useState } from 'react'

function AIVoiceDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioRef, setAudioRef] = useState(null)

  // Demo conversation segments - Sarah's introduction
  const conversationSegments = [
    { time: 0, speaker: 'AI', text: "Hello! I'm Sarah, your AI companion from ElderCare. I'm here to chat with you daily." },
    { time: 4, speaker: 'Family', text: "This sounds wonderful! How does it work exactly?" },
    { time: 7, speaker: 'AI', text: "I call your loved one each day for friendly conversations about their wellbeing, mood, and activities." },
    { time: 12, speaker: 'Family', text: "That's exactly what we need for peace of mind." },
    { time: 15, speaker: 'AI', text: "I analyze each conversation and instantly alert you if there are any concerns or changes." },
    { time: 20, speaker: 'Family', text: "So we'll know right away if something's wrong?" },
    { time: 23, speaker: 'AI', text: "Absolutely! Your family stays connected and informed, every single day." }
  ]

  const handlePlayPause = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause()
      } else {
        audioRef.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const getCurrentSegment = () => {
    return conversationSegments.find((segment, index) => {
      const nextSegment = conversationSegments[index + 1]
      return currentTime >= segment.time && (!nextSegment || currentTime < nextSegment.time)
    })
  }

  const currentSegment = getCurrentSegment()

  return (
    <div className="space-y-6">
      {/* Audio Player Controls */}
      <div className="flex items-center justify-center space-x-6 p-8 bg-gradient-to-r from-care-50 via-white to-primary-50 rounded-2xl border-2 border-care-200 shadow-trust">
        {/* Sarah Avatar with Speaking Animation */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-care-400 to-care-500 rounded-full flex items-center justify-center shadow-soft border-4 border-white">
            <span className="text-3xl">👩‍💼</span>
          </div>
          {isPlaying && (
            <>
              <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-0 w-20 h-20 bg-green-300 rounded-full animate-pulse opacity-50"></div>
            </>
          )}
          <div className="text-center mt-2">
            <p className="text-sm font-semibold text-trust-800">Sarah</p>
            <p className="text-xs text-trust-500">Your AI Companion</p>
          </div>
        </div>

        <button
          onClick={handlePlayPause}
          className="w-20 h-20 bg-gradient-to-r from-care-500 to-care-600 text-white rounded-full flex items-center justify-center hover:from-care-600 hover:to-care-700 transform hover:scale-105 transition-all duration-200 shadow-trust border-4 border-white"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-sm text-trust-700 mb-3 font-medium">
            <span>Sarah's Introduction</span>
            <span>{Math.floor(currentTime)}s / 30s</span>
          </div>
          <div className="bg-care-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-care-500 to-care-600 h-3 rounded-full transition-all duration-300 shadow-soft"
              style={{ width: `${(currentTime / 30) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-trust-600 mt-2 text-center">
            {isPlaying ? "Sarah is speaking..." : "Click play to meet Sarah"}
          </p>
        </div>
      </div>

      {/* Conversation Display */}
      <div className="bg-gradient-to-br from-care-50 to-warm-50 rounded-xl p-6 min-h-[200px] border-2 border-care-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-trust-800 text-lg">Sarah's Conversation Style</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 bg-green-500 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}></div>
            <span className="text-xs text-trust-600 font-medium">Live Demo</span>
          </div>
        </div>

        {currentSegment ? (
          <div className="space-y-4">
            <div className={`flex ${currentSegment.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs p-4 rounded-2xl ${
                currentSegment.speaker === 'AI' 
                  ? 'bg-primary-100 text-primary-800 rounded-bl-md' 
                  : 'bg-care-100 text-care-800 rounded-br-md'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentSegment.speaker === 'AI' ? 'bg-care-200 text-care-700' : 'bg-primary-200 text-primary-700'
                  }`}>
                    {currentSegment.speaker === 'AI' ? '👩‍💼' : '👨‍👩‍👧‍👦'}
                  </div>
                  <span className="text-xs font-medium">
                    {currentSegment.speaker === 'AI' ? 'Sarah (AI Companion)' : 'Family Member'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{currentSegment.text}</p>
              </div>
            </div>

            {/* Sarah's Capabilities */}
            {currentSegment.speaker === 'Family' && (
              <div className="bg-white rounded-lg p-4 border border-care-200 shadow-soft">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-care-400 rounded-full"></div>
                  <span className="text-xs font-medium text-trust-600">Sarah's Features</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-trust-500">Voice:</span>
                    <span className="ml-1 text-care-600 font-medium">Natural 🗣️</span>
                  </div>
                  <div>
                    <span className="text-trust-500">Analysis:</span>
                    <span className="ml-1 text-primary-600 font-medium">Smart 🧠</span>
                  </div>
                  <div>
                    <span className="text-trust-500">Alerts:</span>
                    <span className="ml-1 text-warm-600 font-medium">Instant ⚡</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-trust-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-trust-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">▶️</span>
              </div>
              <p>Click play to hear a sample conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for demo */}
      <audio
        ref={setAudioRef}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {/* You would replace this with your actual ElevenLabs generated audio file */}
        <source src="/demo-conversation.mp3" type="audio/mpeg" />
      </audio>

      {/* Demo Note */}
      <div className="text-center">
        <p className="text-sm text-trust-500 italic">
          This is a demonstration of Sarah's introduction and capabilities.
          <br />
          <span className="text-care-600 font-medium">Experience how natural and caring Sarah's conversations are.</span>
        </p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [email, setEmail] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    alert(`Thanks for your interest! We'll contact you at ${email}`)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg">💝</span>
              </div>
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-700 to-care-600 bg-clip-text text-transparent">
                ElderCare AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200">
                Sign In
              </Link>
              <div className="flex items-center space-x-3">
                <Link href="/demo-preview" className="bg-gradient-to-r from-care-500 to-care-600 text-white px-6 py-2.5 rounded-full hover:from-care-600 hover:to-care-700 transform hover:scale-105 transition-all duration-200 shadow-soft font-medium">
                  Dashboard Demo
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-full hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center bg-care-50 border border-care-200 rounded-full px-4 py-2 mb-8">
            <span className="text-care-600 text-sm font-medium">🛡️ Trusted by 10,000+ families nationwide</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-trust-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary-700 via-care-600 to-primary-700 bg-clip-text text-transparent">
              Peace of Mind
            </span>
            <span className="block text-trust-800">for Every Family</span>
          </h1>

          <p className="text-xl sm:text-2xl text-trust-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Professional AI companion calls provide daily check-ins for elderly family members. 
            Real-time health monitoring, mood analysis, and instant alerts ensure comprehensive care and family connection.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-sm text-trust-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-care-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              GDPR Compliant
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-care-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              NHS Recommended
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-care-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              24/7 Support
            </div>
          </div>

          {/* Quick Actions */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/signup" className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft text-center">
                Start Free Trial
              </Link>
            </div>
            
            <form onSubmit={handleSignup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for updates"
                className="flex-1 px-6 py-3 border border-trust-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg shadow-soft"
                required
              />
              <button 
                type="submit"
                className="bg-white text-primary-600 border-2 border-primary-200 px-6 py-3 rounded-full font-semibold hover:bg-primary-50 transition-all duration-200 shadow-soft"
              >
                Get Updates
              </button>
            </form>
          </div>
          <p className="text-trust-500">Free 7-day trial • No credit card required • Cancel anytime</p>
        </div>

        {/* Meet Sarah - AI Voice Introduction Section */}
        <div className="mt-16 mb-20">
          <div className="bg-gradient-to-br from-primary-50 via-white to-care-50 rounded-3xl shadow-trust p-8 lg:p-12 max-w-6xl mx-auto border border-primary-100">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-care-100 border border-care-200 rounded-full px-4 py-2 mb-6">
                <div className="relative mr-2">
                  <div className="w-3 h-3 bg-care-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-care-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-care-700 text-sm font-medium">🎤 Powered by ElevenLabs AI</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-heading font-bold text-trust-900 mb-4">
                Meet Sarah, Your AI Companion
              </h3>
              <p className="text-xl text-trust-600 max-w-3xl mx-auto leading-relaxed mb-12">
                Click to hear Sarah introduce herself and learn how she provides caring daily conversations for your family.
              </p>

              {/* Large Central Meet Sarah Button - Perfect Circle */}
              <div className="flex justify-center mb-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full blur-3xl opacity-50 animate-pulse scale-125"></div>
                  <button className="relative bg-gradient-to-r from-blue-500 to-teal-500 text-white w-80 h-80 rounded-full text-2xl font-bold shadow-2xl hover:from-blue-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <span>Meet Sarah</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8 border border-trust-100">
              <AIVoiceDemo />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-care-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👩‍💼</span>
                </div>
                <h4 className="font-semibold text-trust-800 mb-2">Meet Sarah</h4>
                <p className="text-sm text-trust-600">Your dedicated AI companion with a warm, caring personality</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="font-semibold text-trust-800 mb-2">Daily Conversations</h4>
                <p className="text-sm text-trust-600">Natural, engaging chats that feel like talking to family</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-semibold text-trust-800 mb-2">Instant Updates</h4>
                <p className="text-sm text-trust-600">Real-time alerts and insights delivered to your family</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Preview */}
        <div className="mt-20 animate-slide-up">
          <div className="bg-white rounded-3xl shadow-trust p-8 max-w-6xl mx-auto border border-trust-100">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-heading font-semibold text-trust-900 mb-2">Family Dashboard</h3>
              <p className="text-trust-600">Real-time insights into your parent's wellbeing</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Status Card */}
              <div className="bg-gradient-to-br from-care-50 to-care-100 p-6 rounded-2xl border border-care-200 hover:shadow-care transition-all duration-300">
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
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200 hover:shadow-warm transition-all duration-300">
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
              <div className="bg-gradient-to-br from-warm-50 to-warm-100 p-6 rounded-2xl border border-warm-200 hover:shadow-warm transition-all duration-300">
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

            {/* Conversation Summary */}
            <div className="bg-gradient-to-r from-trust-50 to-warm-50 p-6 rounded-2xl border border-trust-200">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-trust-800 text-lg">Today's Conversation</h4>
                <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full">AI Summary</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-trust-600">9:15 AM</p>
                      <span className="w-1 h-1 bg-trust-300 rounded-full"></span>
                      <p className="text-sm text-trust-500">Duration: 12 minutes</p>
                    </div>
                    <p className="text-trust-800 leading-relaxed">"I had a wonderful sleep and woke up feeling refreshed. I've already had my breakfast and took my morning medications. Susan from next door popped by to chat about her garden - she's growing the most beautiful roses this year!"</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-care-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-trust-600 mb-1">Health Indicators</p>
                    <p className="text-trust-800">✓ Medications taken on time ✓ Good mobility ✓ Positive social interaction</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-warm-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-trust-600 mb-1">AI Assessment</p>
                    <p className="text-trust-800">Mood: Content and engaged • Health: Stable • Social: Active community connection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-gradient-to-r from-primary-600 to-care-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl sm:text-3xl font-medium text-white mb-8 leading-relaxed">
            "ElderCare AI provides exceptional peace of mind for our entire family. The comprehensive monitoring and professional care coordination keeps our loved ones safe and connected, no matter the distance."
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">👩‍💼</span>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Sarah Mitchell</p>
              <p className="text-primary-100">Family Care Coordinator, London</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">How ElderCare AI Works</h2>
            <p className="text-xl text-trust-600 max-w-3xl mx-auto">Advanced AI technology that feels warm and personal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-care">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4 text-trust-900">Daily AI Companion</h3>
              <p className="text-trust-600 leading-relaxed">
                Warm, intelligent AI calls your parent daily for meaningful conversations about their day, 
                health, and wellbeing. Each call is personalized and natural.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-care-100 to-care-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-care">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4 text-trust-900">Intelligent Monitoring</h3>
              <p className="text-trust-600 leading-relaxed">
                AI analyzes conversations for mood changes, health concerns, and social activities. 
                Instant alerts for emergencies or concerning patterns.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-warm-100 to-warm-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-care">
                <span className="text-3xl">💝</span>
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4 text-trust-900">Family Connection</h3>
              <p className="text-trust-600 leading-relaxed">
                Daily insights, mood trends, and real-time notifications keep you connected 
                and confident your parent is safe and cared for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-to-br from-trust-50 to-warm-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">Choose Your Care Plan</h2>
            <p className="text-xl text-trust-600">Transparent pricing for peace of mind</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 hover:shadow-care transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-heading font-bold mb-2 text-trust-900">Essential Care</h3>
                <p className="text-trust-600 mb-6">Perfect for daily check-ins</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary-600">£39</span>
                  <span className="text-trust-500">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {['Daily AI companion calls', 'Basic health monitoring', 'Weekly family reports', 'Email notifications'].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="w-5 h-5 text-care-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-trust-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="w-full bg-primary-600 text-white py-4 rounded-2xl hover:bg-primary-700 transition-colors duration-200 font-semibold text-center block">
                Start Free Trial
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-3xl shadow-trust p-8 border-2 border-primary-200 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-500 to-care-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>

              <div className="text-center mt-4">
                <h3 className="text-2xl font-heading font-bold mb-2 text-trust-900">Complete Care</h3>
                <p className="text-trust-600 mb-6">Comprehensive family peace of mind</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary-600">£59</span>
                  <span className="text-trust-500">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {['Everything in Essential Care', 'Real-time emergency alerts', 'SMS & phone notifications', '24/7 emergency support', 'Advanced mood analysis'].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="w-5 h-5 text-care-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-trust-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="w-full bg-gradient-to-r from-primary-500 to-care-500 text-white py-4 rounded-2xl hover:from-primary-600 hover:to-care-600 transition-all duration-200 font-semibold text-center block">
                Start Free Trial
              </Link>
            </div>

            {/* Family Plan */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 hover:shadow-care transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-heading font-bold mb-2 text-trust-900">Family Care</h3>
                <p className="text-trust-600 mb-6">For multiple parents & siblings</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary-600">£99</span>
                  <span className="text-trust-500">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {['Everything in Complete Care', 'Up to 3 elderly parents', 'Family member sharing', 'Priority 24/7 support', 'Dedicated care coordinator'].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="w-5 h-5 text-care-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-trust-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="w-full bg-primary-600 text-white py-4 rounded-2xl hover:bg-primary-700 transition-colors duration-200 font-semibold text-center block">
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-trust-600">All plans include 7-day free trial • No setup fees • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-trust-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-care-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">💝</span>
                </div>
                <h3 className="text-2xl font-heading font-bold">ElderCare AI</h3>
              </div>
              <p className="text-trust-300 leading-relaxed mb-6">
                Keeping families connected and elderly parents safe through compassionate AI companionship.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-trust-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-sm">📧</span>
                </div>
                <div className="w-10 h-10 bg-trust-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-sm">📱</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-trust-300">
                {['How It Works', 'Pricing', 'Security & Privacy', 'API Documentation'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-trust-300">
                {['Help Centre', 'Contact Support', 'Book Demo', 'Family Resources'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-trust-300">
                {['About Us', 'Careers', 'Press Kit', 'Partner Program'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-trust-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-trust-400 mb-4 md:mb-0">
                &copy; 2025 ElderCare AI. All rights reserved.
              </p>
              <div className="flex space-x-6 text-trust-400">
                <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
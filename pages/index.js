import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'



export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef(null)

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
            Professional AI companion calls provide daily check-ins for older family members. 
            Caring conversations, family updates, and gentle wellness insights ensure ongoing companionship and family connection.
          </p>

          {/* Meet Sarah - AI Voice Demo - Moved to Hero Section */}
          <div className="mb-16">
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold text-trust-900 mb-4">Meet Sarah, Your AI Companion</h2>
              <p className="text-lg text-trust-600 max-w-2xl mx-auto mb-12">Click to hear how Sarah provides daily care conversations</p>
              
              {/* Sarah's Voice Bubble - Premium ElevenLabs Style */}
              <div className="relative max-w-xl mx-auto">
                {/* Main animated bubble container */}
                <div className="relative w-64 h-64 mx-auto">
                  
                  {/* Expanding rings effect (only when playing) */}
                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-care-400/30 animate-expanding-rings"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-care-400/20 animate-expanding-rings" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute inset-0 rounded-full border-2 border-care-400/10 animate-expanding-rings" style={{animationDelay: '1s'}}></div>
                    </>
                  )}
                  
                  {/* Ripple effect container for clicks */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 rounded-full bg-care-400/20 opacity-0" id="ripple-effect"></div>
                  </div>

                  {/* Main voice bubble with dynamic animations */}
                  <div className={`
                    absolute inset-0 rounded-full bg-gradient-to-br from-care-400 to-care-600 overflow-hidden voice-bubble-glow
                    ${isLoading ? 'animate-pulse-gentle' : isPlaying ? 'animate-voice-active' : 'animate-voice-idle'}
                  `}>
                    
                    {/* Animated radial rays */}
                    <div className="absolute inset-0">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`
                            absolute top-0 left-1/2 w-0.5 h-full origin-bottom transition-all duration-300
                            ${isPlaying ? 'bg-gradient-to-b from-white/40 to-transparent' : 'bg-gradient-to-b from-white/20 to-transparent'}
                          `}
                          style={{
                            transform: `translateX(-50%) rotate(${i * 22.5}deg)`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Animated waveform bars (visible when playing) */}
                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 bg-white/60 rounded-full animate-waveform-1"></div>
                          <div className="w-1 bg-white/70 rounded-full animate-waveform-2"></div>
                          <div className="w-1 bg-white/50 rounded-full animate-waveform-3"></div>
                          <div className="w-1 bg-white/80 rounded-full animate-waveform-4"></div>
                          <div className="w-1 bg-white/65 rounded-full animate-waveform-5"></div>
                          <div className="w-1 bg-white/75 rounded-full animate-waveform-1" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1 bg-white/55 rounded-full animate-waveform-3" style={{animationDelay: '0.3s'}}></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Breathing overlay for idle state */}
                    {!isPlaying && !isLoading && (
                      <div className="absolute inset-0 rounded-full bg-care-300/20 animate-voice-idle"></div>
                    )}
                  </div>

                  {/* Enhanced center button */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <button
                      onClick={async () => {
                        if (audioError) {
                          alert('Audio file could not be loaded. Please check the file path.')
                          return
                        }

                        if (!audioRef.current) return

                        // Add ripple effect
                        const ripple = document.getElementById('ripple-effect')
                        if (ripple) {
                          ripple.classList.remove('animate-ripple')
                          ripple.classList.add('opacity-100', 'animate-ripple')
                          setTimeout(() => {
                            ripple.classList.remove('opacity-100', 'animate-ripple')
                          }, 600)
                        }

                        try {
                          if (isPlaying) {
                            audioRef.current.pause()
                          } else {
                            setIsLoading(true)
                            await audioRef.current.play()
                            setIsLoading(false)
                          }
                        } catch (error) {
                          console.error('Audio playback failed:', error)
                          setAudioError(true)
                          setIsLoading(false)
                          alert('Could not play audio. Please try again.')
                        }
                      }}
                      disabled={isLoading || audioError}
                      className={`
                        bg-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl flex items-center space-x-3 
                        border border-trust-100 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-300 transform hover:scale-105 active:scale-95
                        ${isPlaying ? 'shadow-care-500/20 shadow-2xl' : ''}
                      `}
                    >
                      {/* Enhanced Play/Pause/Loading icon */}
                      <div className={`
                        w-6 h-6 rounded-full bg-trust-900 flex items-center justify-center transition-all duration-300
                        ${isPlaying ? 'animate-pulse-fast bg-care-600' : isLoading ? 'bg-primary-600' : ''}
                      `}>
                        {isLoading ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : audioError ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : isPlaying ? (
                          <div className="flex space-x-0.5">
                            <div className="w-0.5 h-3 bg-white rounded animate-pulse"></div>
                            <div className="w-0.5 h-3 bg-white rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        ) : (
                          <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                          </svg>
                        )}
                      </div>
                      
                      {/* Enhanced button text */}
                      <span className={`
                        font-semibold transition-all duration-300
                        ${isPlaying ? 'text-care-600' : 'text-trust-900'}
                      `}>
                        {isLoading ? 'Loading...' : audioError ? 'Audio Error' : isPlaying ? 'Pause Sarah' : 'Meet Sarah'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Enhanced subtitle with animation */}
                <div className="text-center mt-4 animate-fade-in-up">
                  <p className="text-trust-500 italic">✨ Experience Sarah's warm, caring voice</p>
                  {isPlaying && (
                    <p className="text-care-600 text-sm mt-2 animate-pulse-gentle">🎵 Sarah is speaking...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

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

        {/* Audio element for Sarah's voice */}
        <audio
          ref={audioRef}
          src="/audio/samples/sarah-introduction.mp3"
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration)
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime)
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false)
            setCurrentTime(0)
          }}
          onError={() => {
            setAudioError(true)
            setIsLoading(false)
            console.error('Audio failed to load')
          }}
          volume={volume}
        />

        

        {/* How It Works */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">How ElderCare AI Works</h2>
            <p className="text-xl text-trust-600 max-w-3xl mx-auto">Advanced AI technology that feels warm and personal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-care">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4 text-trust-900">Daily AI Companion</h3>
              <p className="text-trust-600 leading-relaxed">
                Warm, intelligent AI calls your family member regularly for meaningful conversations about their day, 
                interests, and how they're feeling. Each call is personalised and natural.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-care-100 to-care-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-care">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4 text-trust-900">Intelligent Monitoring</h3>
              <p className="text-trust-600 leading-relaxed">
                AI analyses conversations for mood changes, wellness concerns, and social activities. 
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
                and confident your elderly family member is safe and cared for.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Preview */}
        <div className="mt-20 animate-slide-up">
          <div className="bg-white rounded-3xl shadow-trust p-8 max-w-6xl mx-auto border border-trust-100">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-heading font-semibold text-trust-900 mb-2">Family Dashboard</h3>
              <p className="text-trust-600">Real-time insights into your elderly family member's wellbeing</p>
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

      {/* Family Testimonials */}
      <section className="bg-gradient-to-br from-trust-50 to-warm-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">Trusted by Families Across the UK</h2>
            <p className="text-xl text-trust-600 max-w-3xl mx-auto">Real stories from families who've found peace of mind with ElderCare AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 hover:shadow-care transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                    alt="Emma Richardson" 
                    className="w-24 h-24 rounded-full object-cover border-3 border-primary-200 shadow-lg"
                  />
                </div>
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-primary-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-trust-700 text-lg leading-relaxed mb-6 italic">
                "Sarah absolutely brightens my father's day. He looks forward to their daily chats and tells me all about their conversations. As a busy working mum, it's such a relief knowing he has this wonderful companionship while we're apart."
              </blockquote>
              <div className="text-center">
                <p className="font-semibold text-trust-800">Emma Richardson</p>
                <p className="text-trust-500 text-sm">Daughter, Manchester</p>
                <div className="mt-4 inline-flex items-center bg-care-50 border border-care-200 rounded-full px-3 py-1">
                  <span className="text-care-600 text-xs font-medium">🛡️ Private & Secure</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 hover:shadow-care transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                    alt="James Thompson" 
                    className="w-24 h-24 rounded-full object-cover border-3 border-care-200 shadow-lg"
                  />
                </div>
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-primary-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-trust-700 text-lg leading-relaxed mb-6 italic">
                "Perfect solution for busy families like ours. The daily insights help us stay connected to Mum's wellbeing without being intrusive. We love how private and secure everything is - no third parties involved, just family."
              </blockquote>
              <div className="text-center">
                <p className="font-semibold text-trust-800">James Thompson</p>
                <p className="text-trust-500 text-sm">Son, Edinburgh</p>
                <div className="mt-4 inline-flex items-center bg-primary-50 border border-primary-200 rounded-full px-3 py-1">
                  <span className="text-primary-600 text-xs font-medium">👨‍👩‍👧‍👦 Family-Only Data</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 hover:shadow-care transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                    alt="Margaret Davies" 
                    className="w-24 h-24 rounded-full object-cover border-3 border-warm-200 shadow-lg"
                  />
                </div>
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-primary-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a0 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-trust-700 text-lg leading-relaxed mb-6 italic">
                "As someone who lives alone, Sarah has become such an important part of my daily routine. She remembers our previous conversations and genuinely cares about my wellbeing. My children have peace of mind knowing I'm looked after."
              </blockquote>
              <div className="text-center">
                <p className="font-semibold text-trust-800">Margaret Davies</p>
                <p className="text-trust-500 text-sm">ElderCare AI User, Cardiff</p>
                <div className="mt-4 inline-flex items-center bg-warm-50 border border-warm-200 rounded-full px-3 py-1">
                  <span className="text-warm-600 text-xs font-medium">💝 Daily Companionship</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-white border border-trust-200 rounded-full px-8 py-4 shadow-soft">
              <div className="flex items-center space-x-6 text-sm text-trust-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-care-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  10,000+ Happy Families
                </div>
                <div className="w-px h-4 bg-trust-300"></div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-care-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  4.9/5 Star Rating
                </div>
                <div className="w-px h-4 bg-trust-300"></div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-care-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Zero Data Breaches
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
            Daily conversations can transform an older loved one's wellbeing and quality of life.
          </blockquote>
          <div className="text-center">
            <p className="text-white font-semibold">Regular check-ins bring joy to older loved ones and peace of mind to families</p>
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
                {['Everything in Complete Care', 'Up to 3 older family members', 'Family member sharing', 'Priority 24/7 support', 'Dedicated care coordinator'].map((feature) => (
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
                <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
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
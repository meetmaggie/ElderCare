
'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'

export default function DemoPreview() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef(null)

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
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200">
                Back to Home
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-full hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Demo Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-care-50 border border-care-200 rounded-full px-4 py-2 mb-6">
            <span className="text-care-600 text-sm font-medium">🎯 Interactive Demo Experience</span>
          </div>
          <h1 className="text-4xl font-heading font-bold text-trust-900 mb-4">
            Experience ElderCare AI
          </h1>
          <p className="text-xl text-trust-600 max-w-3xl mx-auto">
            See how our AI companion Sarah provides daily care conversations for your elderly family members
          </p>
        </div>

        {/* Sarah's Voice Demo */}
        <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-4">Meet Sarah, Your AI Companion</h2>
            <p className="text-lg text-trust-600 max-w-2xl mx-auto mb-12">Click to hear how Sarah provides daily care conversations</p>
            
            {/* Sarah's Voice Bubble */}
            <div className="relative max-w-xl mx-auto">
              <div className="relative w-64 h-64 mx-auto">
                
                {/* Expanding rings effect (only when playing) */}
                {isPlaying && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-care-400/30 animate-expanding-rings"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-care-400/20 animate-expanding-rings" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute inset-0 rounded-full border-2 border-care-400/10 animate-expanding-rings" style={{animationDelay: '1s'}}></div>
                  </>
                )}
                
                {/* Main voice bubble */}
                <div className={`
                  absolute inset-0 rounded-full bg-gradient-to-br from-care-400 to-care-600 overflow-hidden voice-bubble-glow
                  ${isLoading ? 'animate-pulse-gentle' : isPlaying ? 'animate-voice-active' : 'animate-voice-idle'}
                `}>
                  
                  {/* Animated waveform bars (visible when playing) */}
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center space-x-1">
                        <div className="w-1 bg-white/60 rounded-full animate-waveform-1"></div>
                        <div className="w-1 bg-white/70 rounded-full animate-waveform-2"></div>
                        <div className="w-1 bg-white/50 rounded-full animate-waveform-3"></div>
                        <div className="w-1 bg-white/80 rounded-full animate-waveform-4"></div>
                        <div className="w-1 bg-white/65 rounded-full animate-waveform-5"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Breathing overlay for idle state */}
                  {!isPlaying && !isLoading && (
                    <div className="absolute inset-0 rounded-full bg-care-300/20 animate-voice-idle"></div>
                  )}
                </div>

                {/* Center button */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <button
                    onClick={async () => {
                      if (audioError) {
                        alert('Audio file could not be loaded. Please check the file path.')
                        return
                      }

                      if (!audioRef.current) return

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
                    
                    <span className={`
                      font-semibold transition-all duration-300
                      ${isPlaying ? 'text-care-600' : 'text-trust-900'}
                    `}>
                      {isLoading ? 'Loading...' : audioError ? 'Audio Error' : isPlaying ? 'Pause Sarah' : 'Meet Sarah'}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-trust-500 italic">✨ Experience Sarah's warm, caring voice</p>
                {isPlaying && (
                  <p className="text-care-600 text-sm mt-2 animate-pulse-gentle">🎵 Sarah is speaking...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Dashboard Preview */}
        <div className="bg-white rounded-3xl shadow-soft p-8 border border-trust-100 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-heading font-semibold text-trust-900 mb-2">Family Dashboard Preview</h3>
            <p className="text-trust-600">Real-time insights into your elderly family member's wellbeing</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status Card */}
            <div className="bg-gradient-to-br from-care-50 to-care-100 p-6 rounded-2xl border border-care-200">
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
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200">
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
            <div className="bg-gradient-to-br from-warm-50 to-warm-100 p-6 rounded-2xl border border-warm-200">
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
              <h4 className="font-semibold text-trust-800 text-lg">Recent Conversation</h4>
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
                  <p className="text-trust-800 leading-relaxed">"I had a wonderful sleep and woke up feeling refreshed. I've already had my breakfast and took my morning medications. Susan from next door popped by to chat about her garden."</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-care-400 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-trust-600 mb-1">Health Indicators</p>
                  <p className="text-trust-800">✓ Medications taken on time ✓ Good mobility ✓ Positive social interaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-500 to-care-500 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-heading font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-6 opacity-90">Join thousands of families who trust ElderCare AI for peace of mind</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-primary-50 transition-all duration-200 shadow-soft">
                Start Free Trial
              </Link>
              <Link href="/" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Audio element for Sarah's voice */}
      <audio
        ref={audioRef}
        src="/audio/samples/sarah-introduction.mp3"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
        }}
        onError={() => {
          setAudioError(true)
          setIsLoading(false)
          console.error('Audio failed to load')
        }}
      />
    </div>
  )
}

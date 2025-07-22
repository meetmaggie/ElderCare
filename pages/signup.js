
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'

export default function Signup() {
  const [formData, setFormData] = useState({
    // Family member info
    familyName: '',
    familyEmail: '',
    familyPhone: '',
    
    // Elderly parent info
    parentName: '',
    parentPhone: '',
    emergencyContact: '',
    emergencyPhone: '',
    preferredCallTime: '',
    
    // Plan selection
    selectedPlan: 'basic'
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const plans = {
    basic: { name: 'Basic', price: 39, features: ['Daily AI companion calls', 'Health monitoring', 'Emergency alerts'] },
    premium: { name: 'Premium', price: 59, features: ['Everything in Basic', 'Family dashboard', 'Weekly reports', 'Priority support'] },
    family: { name: 'Family', price: 99, features: ['Everything in Premium', 'Multiple family members', 'Advanced analytics', 'Monthly care coordinator calls'] }
  }

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ]

  const validateForm = () => {
    const newErrors = {}
    
    // Family member validation
    if (!formData.familyName.trim()) newErrors.familyName = 'Name is required'
    if (!formData.familyEmail.trim()) {
      newErrors.familyEmail = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.familyEmail)) {
      newErrors.familyEmail = 'Email is invalid'
    }
    if (!formData.familyPhone.trim()) newErrors.familyPhone = 'Phone number is required'
    
    // Parent validation
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required'
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Parent phone is required'
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required'
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required'
    if (!formData.preferredCallTime) newErrors.preferredCallTime = 'Preferred call time is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // First, insert into family_users table
      const { data: familyUser, error: familyError } = await supabase
        .from('family_users')
        .insert([
          {
            email: formData.familyEmail,
            name: formData.familyName,
            phone: formData.familyPhone,
            subscription_status: 'trial',
            plan: formData.selectedPlan,
            plan_price: plans[formData.selectedPlan].price,
            created_at: new Date().toISOString()
          }
        ])
        .select()
      
      if (familyError) throw familyError
      
      const familyUserId = familyUser[0].id
      
      // Then, insert into elderly_users table
      const { error: elderlyError } = await supabase
        .from('elderly_users')
        .insert([
          {
            name: formData.parentName,
            phone: formData.parentPhone,
            family_user_id: familyUserId,
            emergency_contact: formData.emergencyContact,
            emergency_phone: formData.emergencyPhone,
            call_schedule: formData.preferredCallTime,
            created_at: new Date().toISOString()
          }
        ])
      
      if (elderlyError) throw elderlyError
      
      setIsSuccess(true)
    } catch (error) {
      console.error('Error saving signup:', error)
      let errorMessage = 'There was an error processing your signup. Please try again.'
      
      if (error.code === '23505') {
        errorMessage = 'An account with this email already exists. Please use a different email or sign in.'
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database tables are not set up yet. Please contact support.'
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-trust p-8 max-w-md mx-auto text-center border border-trust-100"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h2 className="text-3xl font-heading font-bold text-trust-900 mb-4">Welcome to ElderCare AI!</h2>
          <p className="text-trust-600 mb-8 leading-relaxed">
            Thank you for signing up for your free 7-day trial. We'll contact you within 24 hours to set up your service and schedule the first call with <span className="font-semibold text-trust-800">{formData.parentName}</span>.
          </p>
          
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-primary-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-primary-700 space-y-1 text-left">
              <li className="flex items-center"><span className="text-primary-500 mr-2">•</span>Setup call within 24 hours</li>
              <li className="flex items-center"><span className="text-primary-500 mr-2">•</span>First AI companion call scheduled</li>
              <li className="flex items-center"><span className="text-primary-500 mr-2">•</span>Family dashboard access provided</li>
            </ul>
          </div>
          
          <Link 
            href="/"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-soft inline-block"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Sign Up - ElderCare AI | Peace of Mind for Every Family</title>
        <meta name="description" content="Sign up for ElderCare AI and give your family peace of mind with daily AI companion calls. Start your free 7-day trial today." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50">
        {/* Header Navigation */}
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
                href="/"
                className="text-trust-600 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </header>

        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-trust-900 mb-4">
                Join Our Care Family
              </h2>
              <p className="text-xl text-trust-600 mb-2">Start your free 7-day trial today</p>
              <p className="text-trust-500">No credit card required • Cancel anytime</p>
            </motion.div>

            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit} 
              className="bg-white rounded-3xl shadow-trust border border-trust-100"
            >
              <div className="p-8 md:p-12">
                {errors.submit && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-start"
                  >
                    <span className="text-red-500 mr-3 mt-0.5">⚠</span>
                    <span>{errors.submit}</span>
                  </motion.div>
                )}

                {/* Your Details Section */}
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      1
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-heading font-semibold text-trust-900">Your Details</h3>
                      <p className="text-trust-600 mt-1">Information about the family member signing up</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-trust-700 font-medium mb-3">Full Name *</label>
                      <input
                        type="text"
                        value={formData.familyName}
                        onChange={(e) => handleInputChange('familyName', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.familyName ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.familyName && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.familyName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-trust-700 font-medium mb-3">Email Address *</label>
                      <input
                        type="email"
                        value={formData.familyEmail}
                        onChange={(e) => handleInputChange('familyEmail', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.familyEmail ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.familyEmail && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.familyEmail}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-trust-700 font-medium mb-3">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.familyPhone}
                        onChange={(e) => handleInputChange('familyPhone', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.familyPhone ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                        placeholder="+44 7XXX XXXXXX"
                      />
                      {errors.familyPhone && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.familyPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Parent Details Section */}
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-care-100 text-care-600 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      2
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-heading font-semibold text-trust-900">Parent's Details</h3>
                      <p className="text-trust-600 mt-1">Information about your parent who will receive calls</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-trust-700 font-medium mb-3">Parent's Full Name *</label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => handleInputChange('parentName', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.parentName ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                        placeholder="Enter parent's full name"
                      />
                      {errors.parentName && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.parentName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-trust-700 font-medium mb-3">Parent's Phone *</label>
                      <input
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.parentPhone ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                        placeholder="+44 7XXX XXXXXX"
                      />
                      {errors.parentPhone && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.parentPhone}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-trust-700 font-medium mb-3">Emergency Contact Name *</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.emergencyContact ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                        placeholder="Emergency contact name"
                      />
                      {errors.emergencyContact && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.emergencyContact}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-trust-700 font-medium mb-3">Emergency Phone *</label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.emergencyPhone ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                        placeholder="+44 7XXX XXXXXX"
                      />
                      {errors.emergencyPhone && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.emergencyPhone}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-trust-700 font-medium mb-3">Preferred Call Time *</label>
                      <select
                        value={formData.preferredCallTime}
                        onChange={(e) => handleInputChange('preferredCallTime', e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg ${
                          errors.preferredCallTime ? 'border-red-300 bg-red-50' : 'border-trust-200 hover:border-trust-300'
                        }`}
                      >
                        <option value="">Select preferred call time</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {errors.preferredCallTime && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">•</span>{errors.preferredCallTime}</p>}
                    </div>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-warm-100 text-warm-600 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      3
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-heading font-semibold text-trust-900">Choose Your Plan</h3>
                      <p className="text-trust-600 mt-1">Select the plan that best fits your family's needs</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(plans).map(([key, plan]) => (
                      <div
                        key={key}
                        className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-soft ${
                          formData.selectedPlan === key
                            ? 'border-primary-500 bg-primary-50 shadow-soft'
                            : 'border-trust-200 hover:border-primary-300'
                        }`}
                        onClick={() => handleInputChange('selectedPlan', key)}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={key}
                          checked={formData.selectedPlan === key}
                          onChange={(e) => handleInputChange('selectedPlan', e.target.value)}
                          className="absolute top-6 right-6 w-5 h-5"
                        />
                        <h4 className="text-xl font-heading font-semibold text-trust-900 mb-3">{plan.name}</h4>
                        <div className="text-3xl font-bold text-primary-600 mb-4">
                          £{plan.price}
                          <span className="text-sm text-trust-500 font-normal">/month</span>
                        </div>
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-trust-600">
                              <span className="text-primary-500 mr-3 mt-1 text-sm">✓</span>
                              <span className="text-sm leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-gradient-to-r from-primary-500 to-primary-600 text-white px-12 py-5 rounded-full font-semibold text-lg transform transition-all duration-200 ${
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
                        Creating Your Account...
                      </span>
                    ) : (
                      `Start Free Trial - £${plans[formData.selectedPlan].price}/month after`
                    )}
                  </button>
                  <div className="mt-6 space-y-2">
                    <p className="text-trust-500 text-sm">Free 7-day trial • No credit card required • Cancel anytime</p>
                    <p className="text-trust-400 text-xs">By signing up, you agree to our Terms of Service and Privacy Policy</p>
                  </div>
                </div>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </>
  )
}

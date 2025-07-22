
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import Head from 'next/head'

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
      const { data, error } = await supabase
        .from('signups')
        .insert([
          {
            family_name: formData.familyName,
            family_email: formData.familyEmail,
            family_phone: formData.familyPhone,
            parent_name: formData.parentName,
            parent_phone: formData.parentPhone,
            emergency_contact: formData.emergencyContact,
            emergency_phone: formData.emergencyPhone,
            preferred_call_time: formData.preferredCallTime,
            selected_plan: formData.selectedPlan,
            plan_price: plans[formData.selectedPlan].price,
            created_at: new Date().toISOString()
          }
        ])
      
      if (error) throw error
      
      setIsSuccess(true)
    } catch (error) {
      console.error('Error saving signup:', error)
      setErrors({ submit: 'There was an error processing your signup. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-trust p-8 max-w-md mx-auto text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-trust-900 mb-4">Welcome to ElderCare AI!</h2>
          <p className="text-trust-600 mb-6">Thank you for signing up. We'll contact you within 24 hours to set up your service and schedule the first call with {formData.parentName}.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Sign Up - ElderCare AI</title>
        <meta name="description" content="Sign up for ElderCare AI and give your family peace of mind with daily AI companion calls." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-care-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">💝</span>
              </div>
              <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary-700 to-care-600 bg-clip-text text-transparent">
                ElderCare AI
              </h1>
            </div>
            <h2 className="text-4xl font-heading font-bold text-trust-900 mb-4">Join Our Care Family</h2>
            <p className="text-xl text-trust-600">Start your free 7-day trial today</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-trust p-8">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {errors.submit}
              </div>
            )}

            {/* Family Member Information */}
            <div className="mb-8">
              <h3 className="text-2xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                Your Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-trust-700 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.familyName}
                    onChange={(e) => handleInputChange('familyName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.familyName ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.familyName && <p className="text-red-500 text-sm mt-1">{errors.familyName}</p>}
                </div>
                
                <div>
                  <label className="block text-trust-700 font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.familyEmail}
                    onChange={(e) => handleInputChange('familyEmail', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.familyEmail ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.familyEmail && <p className="text-red-500 text-sm mt-1">{errors.familyEmail}</p>}
                </div>
                
                <div className="md:col-span-1">
                  <label className="block text-trust-700 font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.familyPhone}
                    onChange={(e) => handleInputChange('familyPhone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.familyPhone ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                    placeholder="+44 7XXX XXXXXX"
                  />
                  {errors.familyPhone && <p className="text-red-500 text-sm mt-1">{errors.familyPhone}</p>}
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="mb-8">
              <h3 className="text-2xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-care-100 text-care-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Parent Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-trust-700 font-medium mb-2">Parent's Full Name *</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => handleInputChange('parentName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.parentName ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                    placeholder="Enter parent's full name"
                  />
                  {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>}
                </div>
                
                <div>
                  <label className="block text-trust-700 font-medium mb-2">Parent's Phone *</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.parentPhone ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                    placeholder="+44 7XXX XXXXXX"
                  />
                  {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>}
                </div>
                
                <div>
                  <label className="block text-trust-700 font-medium mb-2">Emergency Contact *</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.emergencyContact ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                    placeholder="Emergency contact name"
                  />
                  {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
                </div>
                
                <div>
                  <label className="block text-trust-700 font-medium mb-2">Emergency Phone *</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.emergencyPhone ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                    placeholder="+44 7XXX XXXXXX"
                  />
                  {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-trust-700 font-medium mb-2">Preferred Call Time *</label>
                  <select
                    value={formData.preferredCallTime}
                    onChange={(e) => handleInputChange('preferredCallTime', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.preferredCallTime ? 'border-red-300 bg-red-50' : 'border-trust-200'
                    }`}
                  >
                    <option value="">Select preferred call time</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  {errors.preferredCallTime && <p className="text-red-500 text-sm mt-1">{errors.preferredCallTime}</p>}
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="mb-8">
              <h3 className="text-2xl font-heading font-semibold text-trust-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-warm-100 text-warm-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                Choose Your Plan
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(plans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
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
                      className="absolute top-4 right-4"
                    />
                    <h4 className="text-xl font-heading font-semibold text-trust-900 mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold text-primary-600 mb-4">£{plan.price}<span className="text-sm text-trust-500">/month</span></div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-trust-600">
                          <span className="text-primary-500 mr-2">✓</span>
                          <span className="text-sm">{feature}</span>
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
                className={`bg-gradient-to-r from-primary-500 to-primary-600 text-white px-12 py-4 rounded-full font-semibold text-lg transform transition-all duration-200 ${
                  isLoading
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:from-primary-600 hover:to-primary-700 hover:scale-105 shadow-soft'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Start Free Trial - £${plans[formData.selectedPlan].price}/month after`
                )}
              </button>
              <p className="text-trust-500 text-sm mt-4">Free 7-day trial • No credit card required • Cancel anytime</p>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

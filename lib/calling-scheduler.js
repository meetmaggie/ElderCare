
import { supabase } from './supabase.js'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

// Agent IDs
const AGENTS = {
  DISCOVERY: 'agent_01k0q3vpk7f8bsrq2aqk71v9j9', // for first-time calls
  DAILY_CHECKIN: 'agent_01k0pz5awhf8xbn85wrg227fve' // for ongoing calls
}

export class CallingScheduler {
  constructor() {
    this.isRunning = false
  }

  // Main scheduler function - runs every 30 minutes
  async runScheduler() {
    if (this.isRunning) {
      console.log('Scheduler already running, skipping...')
      return
    }

    this.isRunning = true
    console.log('Starting automated calling scheduler...', new Date().toISOString())

    try {
      // Get all elderly users who need calls
      const usersNeedingCalls = await this.getUsersNeedingCalls()
      
      console.log(`Found ${usersNeedingCalls.length} users needing calls`)

      for (const user of usersNeedingCalls) {
        try {
          await this.initiateCall(user)
          // Small delay between calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 5000))
        } catch (error) {
          console.error(`Error initiating call for user ${user.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in scheduler:', error)
    } finally {
      this.isRunning = false
      console.log('Scheduler cycle completed')
    }
  }

  // Get users who need calls based on their schedule
  async getUsersNeedingCalls() {
    const now = new Date()
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5) // HH:MM format

    try {
      const { data: users, error } = await supabase
        .from('elderly_users')
        .select(`
          *,
          family_users!inner(*)
        `)
        .not('phone', 'is', null)
        .or('next_scheduled_call.is.null,next_scheduled_call.lte.now()')

      if (error) {
        console.error('Error fetching users needing calls:', error)
        return []
      }

      // Filter users based on time and frequency logic
      const usersNeedingCalls = []

      for (const user of users || []) {
        const shouldCall = await this.shouldCallUser(user, now, currentTime)
        if (shouldCall) {
          usersNeedingCalls.push(user)
        }
      }

      return usersNeedingCalls
    } catch (error) {
      console.error('Error in getUsersNeedingCalls:', error)
      return []
    }
  }

  // Determine if a user should receive a call right now
  async shouldCallUser(user, now, currentTime) {
    const preferredTime = user.preferred_call_time || '09:00:00'
    const preferredHourMin = preferredTime.substring(0, 5)
    
    // For testing accounts, allow calls any time
    if (user.family_users.email?.endsWith('@test.local')) {
      return true
    }

    // Check if it's within 30 minutes of preferred time
    const timeDiff = this.getTimeDifferenceMinutes(currentTime, preferredHourMin)
    if (timeDiff > 30) {
      return false
    }

    // Check if user needs a call based on frequency
    const lastCall = await this.getLastCall(user.id)
    
    if (!lastCall) {
      return true // First call
    }

    const daysSinceLastCall = this.getDaysSinceDate(lastCall.call_date)
    const callFrequency = user.family_users.call_frequency || 'Daily'
    
    switch (callFrequency) {
      case 'Daily':
        return daysSinceLastCall >= 1
      case 'Every other day':
        return daysSinceLastCall >= 2
      case '3 times per week':
        return this.shouldCallThreeTimesWeek(lastCall.call_date, now)
      case 'Weekly':
        return daysSinceLastCall >= 7
      default:
        return daysSinceLastCall >= 1
    }
  }

  // Get time difference in minutes
  getTimeDifferenceMinutes(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number)
    const [h2, m2] = time2.split(':').map(Number)
    const minutes1 = h1 * 60 + m1
    const minutes2 = h2 * 60 + m2
    return Math.abs(minutes1 - minutes2)
  }

  // Get days since a date
  getDaysSinceDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Check if should call for 3 times per week (Mon, Wed, Fri)
  shouldCallThreeTimesWeek(lastCallDate, now) {
    const daysSince = this.getDaysSinceDate(lastCallDate)
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Only call on Monday (1), Wednesday (3), Friday (5)
    if (![1, 3, 5].includes(currentDay)) {
      return false
    }
    
    return daysSince >= 2
  }

  // Get last call for a user
  async getLastCall(userId) {
    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .eq('elderly_user_id', userId)
        .order('call_date', { ascending: false })
        .limit(1)
        .single()

      return error ? null : data
    } catch (error) {
      return null
    }
  }

  // Initiate call via ElevenLabs
  async initiateCall(user) {
    try {
      console.log(`Initiating call for ${user.name} (${user.phone})`)

      // Determine which agent to use
      const agentId = user.first_call_completed ? AGENTS.DAILY_CHECKIN : AGENTS.DISCOVERY

      // Create call record entry
      const { data: callRecord, error: callRecordError } = await supabase
        .from('call_records')
        .insert({
          elderly_user_id: user.id,
          agent_used: agentId,
          phone_number: user.phone,
          status: 'pending'
        })
        .select()
        .single()

      if (callRecordError) {
        console.error('Error creating call record:', callRecordError)
        return
      }

      // Prepare user context for ElevenLabs
      const userContext = await this.prepareUserContext(user)

      // Make ElevenLabs API call
      const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/conversations`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: agentId,
          conversation_config: {
            phone_number: user.phone,
            context: userContext,
            webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-repl-url.replit.dev'}/api/elevenlabs-webhook`
          }
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Update call record with ElevenLabs call ID
      await supabase
        .from('call_records')
        .update({
          elevenlabs_call_id: result.conversation_id,
          status: 'initiated'
        })
        .eq('id', callRecord.id)

      // Calculate next scheduled call
      const nextCall = this.calculateNextCall(user.family_users.call_frequency || 'Daily')
      
      // Update user's next scheduled call
      await supabase
        .from('elderly_users')
        .update({
          next_scheduled_call: nextCall.toISOString()
        })
        .eq('id', user.id)

      console.log(`Call initiated successfully for ${user.name}`)

    } catch (error) {
      console.error(`Error initiating call for ${user.name}:`, error)
      
      // Update call record with error status
      await supabase
        .from('call_records')
        .update({ status: 'failed' })
        .eq('elderly_user_id', user.id)
        .eq('status', 'pending')
    }
  }

  // Prepare user context for ElevenLabs agent
  async prepareUserContext(user) {
    // Get recent conversation topics
    const { data: recentCalls } = await supabase
      .from('call_records')
      .select('key_topics, summary')
      .eq('elderly_user_id', user.id)
      .order('call_date', { ascending: false })
      .limit(3)

    const recentTopics = recentCalls?.flatMap(call => call.key_topics || []) || []
    
    return {
      user_name: user.name,
      recent_topics: recentTopics.slice(0, 5),
      is_first_call: !user.first_call_completed,
      emergency_contact: user.emergency_contact || '',
      emergency_phone: user.emergency_phone || ''
    }
  }

  // Calculate next call time based on frequency
  calculateNextCall(frequency) {
    const now = new Date()
    
    switch (frequency) {
      case 'Daily':
        now.setDate(now.getDate() + 1)
        break
      case 'Every other day':
        now.setDate(now.getDate() + 2)
        break
      case '3 times per week':
        // Find next Mon, Wed, or Fri
        const currentDay = now.getDay()
        let daysToAdd = 2
        if (currentDay === 1) daysToAdd = 2 // Mon -> Wed
        else if (currentDay === 3) daysToAdd = 2 // Wed -> Fri
        else if (currentDay === 5) daysToAdd = 3 // Fri -> Mon
        now.setDate(now.getDate() + daysToAdd)
        break
      case 'Weekly':
        now.setDate(now.getDate() + 7)
        break
      default:
        now.setDate(now.getDate() + 1)
    }
    
    return now
  }

  // Start the scheduler (runs every 30 minutes)
  start() {
    console.log('Starting automated calling scheduler...')
    
    // Run immediately
    this.runScheduler()
    
    // Then run every 30 minutes
    setInterval(() => {
      this.runScheduler()
    }, 30 * 60 * 1000) // 30 minutes
  }
}

export default CallingScheduler

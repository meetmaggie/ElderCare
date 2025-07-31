
import { supabase } from '../../../lib/supabase'

// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const DISCOVERY_AGENT_ID = 'agent_01k0q3vpk7f8bsrq2aqk71v9j9'
const DAILY_CHECKIN_AGENT_ID = 'agent_01k0pz5awhf8xbn85wrg227fve'

export async function POST(request) {
  console.log('📞 Incoming call webhook received')
  console.log('Request headers:', Object.fromEntries(request.headers.entries()))

  try {
    // Parse Twilio form data
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')

    console.log('Incoming call details:', { callSid, from, to })
    console.log('All form data:', Object.fromEntries(formData.entries()))

    if (!callSid) {
      console.error('Missing CallSid in webhook')
      return new Response(generateErrorTwiML('System error'), {
        headers: { 'Content-Type': 'application/xml' }
      })
    }

    // Find the call record - try multiple approaches
    let callRecord = null
    let callError = null

    // First try by twilio_call_sid
    const { data: recordBySid, error: sidError } = await supabase
      .from('call_records')
      .select('*, elderly_users(*)')
      .eq('twilio_call_sid', callSid)
      .single()

    if (!sidError && recordBySid) {
      callRecord = recordBySid
    } else {
      // If not found, try to find the most recent call record for debugging
      const { data: recentCall, error: recentError } = await supabase
        .from('call_records')
        .select('*, elderly_users(*)')
        .is('twilio_call_sid', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!recentError && recentCall) {
        // Update the record with the CallSid
        await supabase
          .from('call_records')
          .update({ twilio_call_sid: callSid })
          .eq('id', recentCall.id)
        
        callRecord = recentCall
        console.log('Updated call record with CallSid:', callSid)
      }
    }

    if (!callRecord) {
      console.error('No call record found for CallSid:', callSid)
      console.error('Available call records check needed')
      return new Response(generateErrorTwiML('Service temporarily unavailable'), {
        headers: { 'Content-Type': 'application/xml' }
      })
    }

    // Determine which agent to use
    const isFirstCall = !callRecord.elderly_users.first_call_completed
    const agentId = isFirstCall ? DISCOVERY_AGENT_ID : DAILY_CHECKIN_AGENT_ID

    console.log(`Using ${isFirstCall ? 'Discovery' : 'Daily Check-in'} agent: ${agentId}`)

    // Prepare user context for the agent
    const userContext = await prepareUserContext(callRecord.elderly_users)

    // Generate TwiML to connect to ElevenLabs
    const twiml = generateElevenLabsTwiML(agentId, userContext, callSid)

    // Check if TwiML generation failed
    if (twiml.includes('<Say')) {
      console.error('TwiML generation failed, returning error response')
      return new Response(twiml, {
        headers: { 'Content-Type': 'application/xml' }
      })
    }

    // Update call record status
    await supabase
      .from('call_records')
      .update({ 
        call_status: 'connected',
        agent_used: agentId
      })
      .eq('id', callRecord.id)

    console.log('TwiML response generated successfully for agent:', agentId)
    console.log('TwiML content:', twiml.substring(0, 200) + '...')

    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' }
    })

  } catch (error) {
    console.error('Error in incoming call handler:', error)
    return new Response(generateErrorTwiML('System temporarily unavailable'), {
      headers: { 'Content-Type': 'application/xml' }
    })
  }
}

// Prepare user context for ElevenLabs agent
async function prepareUserContext(elderlyUser) {
  try {
    // Get recent conversation data
    const { data: recentCalls } = await supabase
      .from('call_records')
      .select('summary, key_topics, mood, transcript, call_date, specific_mentions, hobby_keywords, family_keywords, health_keywords')
      .eq('elderly_user_id', elderlyUser.id)
      .eq('call_status', 'completed')
      .order('call_date', { ascending: false })
      .limit(3)

    // Get mood tracking for trend analysis
    const { data: moodHistory } = await supabase
      .from('mood_tracking')
      .select('mood_score, mood_description, call_date')
      .eq('elderly_user_id', elderlyUser.id)
      .order('call_date', { ascending: false })
      .limit(5)

    // Extract dynamic variables from conversation history
    const recentTopics = recentCalls?.flatMap(call => call.key_topics || []).slice(0, 5) || []
    const lastMood = recentCalls?.[0]?.mood || null
    const conversationCount = recentCalls?.length || 0

    // Extract hobbies from all conversations
    const allHobbies = recentCalls?.flatMap(call => call.hobby_keywords || []) || []
    const uniqueHobbies = [...new Set(allHobbies)].slice(0, 5)

    // Extract family mentions
    const familyMentions = recentCalls?.flatMap(call => call.family_keywords || []) || []
    const uniqueFamilyTopics = [...new Set(familyMentions)].slice(0, 5)

    // Extract health mentions from recent calls
    const healthMentions = recentCalls?.filter(call => 
      call.key_topics?.includes('Health') || (call.health_keywords && call.health_keywords.length > 0)
    ).map(call => ({
      date: call.call_date,
      summary: call.summary,
      keywords: call.health_keywords || []
    })).slice(0, 3)

    // Calculate mood trend
    const avgMood = moodHistory && moodHistory.length > 0 
      ? moodHistory.reduce((sum, mood) => sum + (mood.mood_score || 3), 0) / moodHistory.length
      : 3

    const moodTrend = avgMood >= 4 ? 'Positive' : avgMood >= 3 ? 'Stable' : 'Needs Attention'

    // Previous conversation summaries
    const previousTopics = recentCalls?.map(call => call.summary).filter(Boolean).slice(0, 3) || []

    return {
      user_name: elderlyUser.name,
      is_first_call: !elderlyUser.first_call_completed,
      conversation_count: conversationCount,

      // Dynamic variables from conversation history
      hobbies: uniqueHobbies,
      family_updates: uniqueFamilyTopics,
      previous_topics: previousTopics,
      health_mentions: healthMentions,
      recent_topics: recentTopics,

      // Mood and wellness tracking
      last_mood: lastMood,
      mood_trend: moodTrend,
      recent_mood_history: moodHistory?.slice(0, 3) || [],

      // Contact and emergency info
      emergency_contact: elderlyUser.emergency_contact || '',
      emergency_phone: elderlyUser.emergency_phone || ''
    }

  } catch (error) {
    console.error('Error preparing user context:', error)
    return {
      user_name: elderlyUser.name,
      is_first_call: !elderlyUser.first_call_completed,
      conversation_count: 0
    }
  }
}

// Generate TwiML for ElevenLabs connection
function generateElevenLabsTwiML(agentId, userContext, callSid) {
  // Validate required environment variables
  if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY not configured')
    return generateErrorTwiML('Service configuration error')
  }

  if (!agentId) {
    console.error('Agent ID not provided')
    return generateErrorTwiML('Service configuration error')
  }

  try {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}">
      <Parameter name="authorization" value="Bearer ${ELEVENLABS_API_KEY}" />
      <Parameter name="user_name" value="${userContext.user_name || 'User'}" />
      <Parameter name="is_first_call" value="${userContext.is_first_call || false}" />
      <Parameter name="conversation_count" value="${userContext.conversation_count || 0}" />
      <Parameter name="call_sid" value="${callSid}" />
    </Stream>
  </Connect>
</Response>`

    console.log('Generated TwiML for agent:', agentId)
    return twiml

  } catch (error) {
    console.error('Error generating TwiML:', error)
    return generateErrorTwiML('Service temporarily unavailable')
  }
}

// Generate error TwiML
function generateErrorTwiML(message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}. Please try again later. Goodbye.</Say>
  <Hangup />
</Response>`
}

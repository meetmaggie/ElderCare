
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    // Parse Twilio webhook data
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')
    const callStatus = formData.get('CallStatus')

    console.log('Incoming call webhook:', { callSid, from, to, callStatus })

    // Clean phone number (remove +1, spaces, etc.)
    const cleanPhone = from?.replace(/[\+\-\s\(\)]/g, '')
    
    if (!cleanPhone) {
      console.error('No caller phone number provided')
      return new Response(generateErrorTwiML('Unable to identify caller'), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Look up elderly user by phone number
    const { data: elderlyUser, error: userError } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('phone', cleanPhone)
      .single()

    if (userError || !elderlyUser) {
      console.error('Elderly user not found for phone:', cleanPhone)
      
      // Create call record for unknown caller
      await supabase
        .from('call_records')
        .insert({
          phone_number: cleanPhone,
          call_date: new Date().toISOString(),
          status: 'rejected',
          twilio_call_sid: callSid,
          notes: 'Unknown caller - no user found in database'
        })

      return new Response(generateErrorTwiML('This number is not registered in our system'), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Determine which agent to use based on call history
    const isFirstCall = !elderlyUser.first_call_completed
    const agentId = isFirstCall ? 
      'agent_01k0q3vpk7f8bsrq2aqk71v9j9' : // Discovery agent
      'agent_01k0pz5awhf8xbn85wrg227fve'   // Daily check-in agent
    
    const agentType = isFirstCall ? 'Discovery' : 'Daily check-in'

    console.log(`Routing ${elderlyUser.name} to ${agentType} agent`)

    // Create call record
    const { data: callRecord, error: callError } = await supabase
      .from('call_records')
      .insert({
        elderly_user_id: elderlyUser.id,
        phone_number: cleanPhone,
        call_date: new Date().toISOString(),
        status: 'in_progress',
        twilio_call_sid: callSid,
        agent_used: agentId
      })
      .select()
      .single()

    if (callError) {
      console.error('Error creating call record:', callError)
    }

    // Prepare user context for ElevenLabs
    const userContext = await prepareUserContext(elderlyUser)

    // Generate TwiML to connect to ElevenLabs
    const twiml = generateElevenLabsTwiML(agentId, elderlyUser, userContext, callRecord?.id)

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error('Error in incoming call webhook:', error)
    return new Response(generateErrorTwiML('System temporarily unavailable'), {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}

// Prepare enhanced user context for ElevenLabs agent
async function prepareUserContext(elderlyUser) {
  try {
    // Get recent call history
    const { data: recentCalls } = await supabase
      .from('call_records')
      .select('summary, key_topics, mood, call_date, health_keywords, hobby_keywords, family_keywords')
      .eq('elderly_user_id', elderlyUser.id)
      .eq('status', 'completed')
      .order('call_date', { ascending: false })
      .limit(3)

    // Get mood tracking
    const { data: moodHistory } = await supabase
      .from('mood_tracking')
      .select('mood_score, mood_description, call_date')
      .eq('elderly_user_id', elderlyUser.id)
      .order('call_date', { ascending: false })
      .limit(5)

    // Extract insights from conversation history
    const hobbies = recentCalls?.flatMap(call => call.hobby_keywords || []) || []
    const familyTopics = recentCalls?.flatMap(call => call.family_keywords || []) || []
    const healthMentions = recentCalls?.filter(call => call.health_keywords?.length > 0) || []
    const previousTopics = recentCalls?.map(call => call.summary).filter(Boolean) || []
    
    // Calculate mood trend
    const avgMood = moodHistory && moodHistory.length > 0 
      ? moodHistory.reduce((sum, mood) => sum + (mood.mood_score || 3), 0) / moodHistory.length
      : 3

    return {
      user_name: elderlyUser.name,
      is_first_call: !elderlyUser.first_call_completed,
      hobbies: [...new Set(hobbies)].slice(0, 5),
      family_updates: [...new Set(familyTopics)].slice(0, 3),
      previous_topics: previousTopics.slice(0, 3),
      health_mentions: healthMentions.slice(0, 2),
      mood_trend: avgMood >= 4 ? 'Positive' : avgMood >= 3 ? 'Stable' : 'Needs Attention',
      emergency_contact: elderlyUser.emergency_contact || '',
      total_conversations: recentCalls?.length || 0
    }
  } catch (error) {
    console.error('Error preparing user context:', error)
    return {
      user_name: elderlyUser.name,
      is_first_call: !elderlyUser.first_call_completed
    }
  }
}

// Generate TwiML to connect call to ElevenLabs agent
function generateElevenLabsTwiML(agentId, elderlyUser, userContext, callRecordId) {
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-repl-url.replit.dev'}/api/twilio-status`
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hello ${elderlyUser.name}, connecting you now.</Say>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation/stream">
      <Parameter name="agent_id" value="${agentId}" />
      <Parameter name="authorization" value="Bearer ${process.env.ELEVENLABS_API_KEY}" />
      <Parameter name="user_name" value="${elderlyUser.name}" />
      <Parameter name="user_context" value="${JSON.stringify(userContext)}" />
      <Parameter name="webhook_url" value="${process.env.NEXT_PUBLIC_SITE_URL}/api/elevenlabs-webhook" />
      <Parameter name="call_record_id" value="${callRecordId}" />
    </Stream>
  </Connect>
</Response>`
}

// Generate error TwiML response
function generateErrorTwiML(message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}. Please try again later. Goodbye.</Say>
  <Hangup />
</Response>`
}

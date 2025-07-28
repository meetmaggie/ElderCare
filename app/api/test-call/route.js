import { supabase } from '../../../lib/supabase'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'
const DISCOVERY_AGENT_ID = 'agent_01k0q3vpk7f8bsrq2aqk71v9j9'
const DAILY_CHECKIN_AGENT_ID = 'agent_01k0pz5awhf8xbn85wrg227fve'

export async function POST(request) {
  try {
    const { userEmail } = await request.json()

    // Verify this is a test account
    if (!userEmail || !userEmail.endsWith('@test.local')) {
      return Response.json({ error: 'Test calls only available for test accounts' }, { status: 403 })
    }

    // Find the family user
    const { data: familyUser, error: familyError } = await supabase
      .from('family_users')
      .select('id, email')
      .eq('email', userEmail)
      .single()

    if (familyError || !familyUser) {
      return Response.json({ error: 'Test account not found' }, { status: 404 })
    }

    // Find linked elderly user
    const { data: elderlyUser, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('family_user_id', familyUser.id)
      .single()

    if (elderlyError || !elderlyUser) {
      return Response.json({ error: 'No elderly user found for test account' }, { status: 404 })
    }

    if (!elderlyUser.phone) {
      return Response.json({ error: 'No phone number configured for test user' }, { status: 400 })
    }

    console.log(`Initiating test call for ${elderlyUser.name} at ${elderlyUser.phone}`)

    // Determine which agent to use based on call history
    const isFirstCall = !elderlyUser.first_call_completed
    const agentId = isFirstCall ? DISCOVERY_AGENT_ID : DAILY_CHECKIN_AGENT_ID
    const agentType = isFirstCall ? 'Discovery' : 'Daily check-in'

    console.log(`Agent selection: ${agentType} (first_call_completed: ${elderlyUser.first_call_completed})`)

    // Get enhanced conversation history for dynamic variables
    const { data: recentCalls } = await supabase
      .from('call_records')
      .select('summary, key_topics, mood, transcript, call_date, specific_mentions, hobby_keywords, family_keywords, health_keywords')
      .eq('elderly_user_id', elderlyUser.id)
      .eq('status', 'completed')
      .order('call_date', { ascending: false })
      .limit(3)

    // Get mood tracking for trend analysis
    const { data: moodHistory } = await supabase
      .from('mood_tracking')
      .select('mood_score, mood_description, call_date')
      .eq('elderly_user_id', elderlyUser.id)
      .order('call_date', { ascending: false })
      .limit(5)

    // Create call record entry
    const { data: callRecord, error: callRecordError } = await supabase
      .from('call_records')
      .insert({
        elderly_user_id: elderlyUser.id,
        call_date: new Date().toISOString(),
        call_status: 'pending',
        conversation_id: null
      })
      .select()
      .single()

    if (callRecordError) {
      console.error('Error creating call record:', callRecordError)
      return Response.json({ error: 'Failed to create call record' }, { status: 500 })
    }

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

    const userContext = {
      user_name: elderlyUser.name,
      is_first_call: isFirstCall,
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
      emergency_phone: elderlyUser.emergency_phone || '',
      
      // Agent guidance based on data
      agent_guidance: generateAgentGuidance(isFirstCall, healthMentions, avgMood, recentCalls),
      
      // Test call identifier
      test_call: true,
      agent_type: agentType
    }

    // Helper function to generate agent guidance
    function generateAgentGuidance(isFirstCall, healthMentions, avgMood, recentCalls) {
      const guidance = []
      
      if (isFirstCall) {
        guidance.push("Discovery call: Focus on learning about the user's interests, family, daily routine, and hobbies")
      } else {
        guidance.push("Follow-up call: Reference previous conversations and check on topics mentioned before")
        
        if (healthMentions.length > 0) {
          guidance.push("Health topics were mentioned recently - gently check in on their wellbeing")
        }
        
        if (avgMood < 3) {
          guidance.push("Recent mood indicators suggest they may need extra support and encouragement")
        }
        
        if (recentCalls && recentCalls.length > 0) {
          const lastCall = recentCalls[0]
          if (lastCall.summary) {
            guidance.push(`Last conversation summary: ${lastCall.summary.substring(0, 100)}...`)
          }
        }
      }
      
      return guidance
    }

    // Make ElevenLabs API call with correct format
    const elevenlabsPayload = {
      agent_id: agentId,
      phone_number: elderlyUser.phone,
      customer_data: {
        name: elderlyUser.name,
        context: `${agentType} call for ${elderlyUser.name}. ${isFirstCall ? 'First time introduction' : 'Follow-up check-in'}`,
        webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-repl-url.replit.dev'}/api/elevenlabs-webhook`,
        user_context: userContext
      }
    }

    console.log('Calling ElevenLabs API with payload:', elevenlabsPayload)
    console.log('API endpoint:', `${ELEVENLABS_BASE_URL}/convai/conversations`)

    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ELEVENLABS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(elevenlabsPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`)

      // Update call record with error status
      await supabase
        .from('call_records')
        .update({ call_status: 'failed' })
        .eq('id', callRecord.id)

      return Response.json({ 
        error: `ElevenLabs API error: ${response.status}` 
      }, { status: 500 })
    }

    const result = await response.json()
    console.log('ElevenLabs response:', result)

    // Update call record with ElevenLabs call ID
    await supabase
      .from('call_records')
      .update({
        conversation_id: result.conversation_id,
        call_status: 'initiated'
      })
      .eq('id', callRecord.id)

    console.log(`Test call initiated successfully for ${elderlyUser.name}`)

    return Response.json({ 
      success: true, 
      message: `Test call initiated for ${elderlyUser.name}`,
      elderlyUser: elderlyUser.name,
      phone: elderlyUser.phone,
      callId: result.conversation_id
    })

  } catch (error) {
    console.error('Error in test call API:', error)
    return Response.json({ 
      error: 'Failed to initiate test call: ' + error.message 
    }, { status: 500 })
  }
}
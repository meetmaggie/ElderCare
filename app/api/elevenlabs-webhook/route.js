import { supabase } from '../../../lib/supabase'
import crypto from 'crypto'

export async function POST(request) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text()
    const webhookData = JSON.parse(rawBody)

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-elevenlabs-signature')
      if (!signature) {
        console.error('Missing webhook signature')
        return Response.json({ error: 'Missing signature' }, { status: 401 })
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        console.error('Invalid webhook signature')
        return Response.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    console.log('ElevenLabs webhook received:', webhookData)

    // Validate environment on first run
    validateEnvironment()

    // Extract data from webhook - handle different ElevenLabs event formats
    const {
      conversation_id,
      status,
      duration_seconds,
      transcript,
      summary,
      metadata,
      event_type,
      agent_id
    } = webhookData

    // Log the agent that was used
    if (agent_id) {
      const agentType = agent_id === 'agent_01k0q3vpk7f8bsrq2aqk71v9j9' ? 'Discovery' : 
                       agent_id === 'agent_01k0pz5awhf8xbn85wrg227fve' ? 'Daily Check-in' : 'Unknown'
      console.log(`Webhook from ${agentType} agent (${agent_id})`)
    }

    if (!conversation_id) {
      return Response.json({ error: 'Missing conversation_id' }, { status: 400 })
    }

    // Find the call record entry
    const { data: callRecord, error: callRecordError } = await supabase
      .from('call_records')
      .select('*, elderly_users(*)')
      .eq('elevenlabs_call_id', conversation_id)
      .single()

    if (callRecordError || !callRecord) {
      console.error('Call record not found:', callRecordError)
      return Response.json({ error: 'Call record not found' }, { status: 404 })
    }

    // Update call record with completion data
    const { error: updateError } = await supabase
      .from('call_records')
      .update({
        status: status === 'completed' ? 'completed' : 'failed',
        duration: duration_seconds,
        transcript: transcript,
        summary: summary
      })
      .eq('id', callRecord.id)

    if (updateError) {
      console.error('Error updating call record:', updateError)
      return Response.json({ error: 'Failed to update call record' }, { status: 500 })
    }

    // If call was successful, process the conversation data
    if (status === 'completed' && transcript) {
      await processConversationData(callRecord, {
        transcript,
        summary,
        duration_seconds,
        metadata
      })
    }

    // Mark first call as completed if applicable
    if (status === 'completed' && !callRecord.elderly_users.first_call_completed) {
      await supabase
        .from('elderly_users')
        .update({ first_call_completed: true })
        .eq('id', callRecord.elderly_user_id)
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Process conversation data and extract insights
async function processConversationData(callRecord, conversationData) {
  try {
    const { transcript, summary } = conversationData

    // Analyze transcript for mood and health mentions
    const analysis = await analyzeConversation(transcript, summary)

    // Update call record with analysis
    await supabase
      .from('call_records')
      .update({
        mood: analysis.mood_description,
        key_topics: analysis.topics
      })
      .eq('id', callRecord.id)

    // Create mood tracking entry
    if (analysis.mood_score) {
      await supabase
        .from('mood_tracking')
        .insert({
          elderly_user_id: callRecord.elderly_user_id,
          call_date: new Date().toISOString().split('T')[0],
          mood_score: analysis.mood_score,
          mood_description: analysis.mood_description,
          analysis: analysis.mood_analysis
        })
    }

    // Create alerts if needed
    await createAlertsFromAnalysis(callRecord, analysis)

  } catch (error) {
    console.error('Error processing conversation data:', error)
  }
}

// Validate required environment variables
function validateEnvironment() {
  const required = ['ELEVENLABS_API_KEY']
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
  }

  if (process.env.ELEVENLABS_WEBHOOK_SECRET) {
    console.log('✓ Webhook signature verification enabled')
  } else {
    console.warn('⚠ Webhook signature verification disabled - consider setting ELEVENLABS_WEBHOOK_SECRET')
  }
}

// Analyze conversation for mood, topics, and health mentions
async function analyzeConversation(transcript, summary) {
  const text = transcript.toLowerCase()

  // Health keywords to detect
  const healthKeywords = [
    'pain', 'hurt', 'ache', 'sick', 'ill', 'doctor', 'hospital', 'medicine', 
    'medication', 'tired', 'dizzy', 'fall', 'fell', 'injury', 'blood pressure',
    'diabetes', 'heart', 'chest', 'breathing', 'sleep', 'insomnia'
  ]

  // Mood indicators
  const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excellent', 'fine', 'well']
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'worried', 'anxious', 'depressed']

  // Extract health mentions
  const health_keywords = healthKeywords.filter(keyword => text.includes(keyword))

  // Basic mood analysis
  const positiveCount = positiveWords.reduce((count, word) => 
    count + (text.match(new RegExp(word, 'g')) || []).length, 0)
  const negativeCount = negativeWords.reduce((count, word) => 
    count + (text.match(new RegExp(word, 'g')) || []).length, 0)

  let mood_score = 3 // neutral
  let mood_description = 'Neutral'

  if (positiveCount > negativeCount + 1) {
    mood_score = 4
    mood_description = 'Content'
  } else if (positiveCount > negativeCount + 2) {
    mood_score = 5
    mood_description = 'Happy'
  } else if (negativeCount > positiveCount + 1) {
    mood_score = 2
    mood_description = 'Concerned'
  } else if (negativeCount > positiveCount + 2) {
    mood_score = 1
    mood_description = 'Sad'
  }

  // Extract topics (simple keyword-based)
  const topics = []
  if (text.includes('family') || text.includes('children') || text.includes('grandchildren')) {
    topics.push('Family')
  }
  if (text.includes('health') || health_keywords.length > 0) {
    topics.push('Health')
  }
  if (text.includes('weather')) {
    topics.push('Weather')
  }
  if (text.includes('food') || text.includes('eat') || text.includes('meal')) {
    topics.push('Food')
  }

  return {
    mood_score,
    mood_description,
    mood_analysis: `Mood analysis based on conversation indicators: ${positiveCount} positive, ${negativeCount} negative mentions`,
    health_keywords,
    topics: topics.length > 0 ? topics : ['General'],
    summary: summary || 'Conversation summary not available'
  }
}

// Create alerts based on conversation analysis
async function createAlertsFromAnalysis(callRecord, analysis) {
  const alerts = []

  // Health keyword alerts
  if (analysis.health_keywords.length > 0) {
    alerts.push({
      elderly_user_id: callRecord.elderly_user_id,
      family_user_id: callRecord.elderly_users.family_user_id,
      priority: analysis.health_keywords.length > 2 ? 'MEDIUM' : 'LOW',
      category: 'Health',
      title: 'Health keywords detected',
      description: `Health-related topics mentioned: ${analysis.health_keywords.join(', ')}`,
      resolved: false
    })
  }

  // Mood alerts
  if (analysis.mood_score <= 2) {
    alerts.push({
      elderly_user_id: callRecord.elderly_user_id,
      family_user_id: callRecord.elderly_users.family_user_id,
      priority: analysis.mood_score === 1 ? 'HIGH' : 'MEDIUM',
      category: 'Mood',
      title: 'Low mood detected',
      description: `AI detected indicators of ${analysis.mood_description.toLowerCase()} mood during conversation`,
      resolved: false
    })
  }

  // Insert alerts
  if (alerts.length > 0) {
    const { error } = await supabase
      .from('alerts')
      .insert(alerts)

    if (error) {
      console.error('Error creating alerts:', error)
    } else {
      console.log(`Created ${alerts.length} alerts for call ${callRecord.id}`)
    }
  }
}
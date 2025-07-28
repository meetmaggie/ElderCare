
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const webhookData = await request.json()
    console.log('ElevenLabs webhook received:', webhookData)

    // Extract data from webhook
    const {
      conversation_id,
      status,
      duration_seconds,
      transcript,
      summary,
      metadata
    } = webhookData

    if (!conversation_id) {
      return Response.json({ error: 'Missing conversation_id' }, { status: 400 })
    }

    // Find the call log entry
    const { data: callLog, error: callLogError } = await supabase
      .from('call_logs')
      .select('*, elderly_users(*)')
      .eq('elevenlabs_call_id', conversation_id)
      .single()

    if (callLogError || !callLog) {
      console.error('Call log not found:', callLogError)
      return Response.json({ error: 'Call log not found' }, { status: 404 })
    }

    // Update call log with completion data
    const { error: updateError } = await supabase
      .from('call_logs')
      .update({
        status: status === 'completed' ? 'completed' : 'failed',
        duration: duration_seconds
      })
      .eq('id', callLog.id)

    if (updateError) {
      console.error('Error updating call log:', updateError)
      return Response.json({ error: 'Failed to update call log' }, { status: 500 })
    }

    // If call was successful, process the conversation data
    if (status === 'completed' && transcript) {
      await processConversationData(callLog, {
        transcript,
        summary,
        duration_seconds,
        metadata
      })
    }

    // Mark first call as completed if applicable
    if (status === 'completed' && !callLog.elderly_users.first_call_completed) {
      await supabase
        .from('elderly_users')
        .update({ first_call_completed: true })
        .eq('id', callLog.user_id)
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Process conversation data and extract insights
async function processConversationData(callLog, conversationData) {
  try {
    const { transcript, summary, metadata } = conversationData

    // Analyze transcript for mood and health mentions
    const analysis = await analyzeConversation(transcript, summary)

    // Create conversation record
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        call_log_id: callLog.id,
        summary: summary || analysis.summary,
        transcript: transcript,
        mood_analysis: analysis.mood_description,
        key_topics: analysis.topics,
        health_mentions: analysis.health_keywords,
        ai_insights: analysis.insights,
        conversation_quality: analysis.quality
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return
    }

    // Create mood tracking entry
    if (analysis.mood_score) {
      await supabase
        .from('mood_tracking')
        .insert({
          elderly_user_id: callLog.user_id,
          call_log_id: callLog.id,
          call_date: new Date().toISOString().split('T')[0],
          mood_score: analysis.mood_score,
          mood_description: analysis.mood_description,
          analysis: analysis.mood_analysis
        })
    }

    // Create alerts if needed
    await createAlertsFromAnalysis(callLog, conversation.id, analysis)

  } catch (error) {
    console.error('Error processing conversation data:', error)
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
    summary: summary || 'Conversation summary not available',
    insights: `Conversation quality appears good. ${health_keywords.length > 0 ? 'Health topics mentioned.' : 'No significant health concerns.'} Mood: ${mood_description}.`,
    quality: 'Medium'
  }
}

// Create alerts based on conversation analysis
async function createAlertsFromAnalysis(callLog, conversationId, analysis) {
  const alerts = []

  // Health keyword alerts
  if (analysis.health_keywords.length > 0) {
    alerts.push({
      call_log_id: callLog.id,
      elderly_user_id: callLog.user_id,
      alert_type: 'health',
      severity: analysis.health_keywords.length > 2 ? 'MEDIUM' : 'LOW',
      title: 'Health keywords detected',
      description: `Health-related topics mentioned: ${analysis.health_keywords.join(', ')}`,
      keywords_detected: analysis.health_keywords
    })
  }

  // Mood alerts
  if (analysis.mood_score <= 2) {
    alerts.push({
      call_log_id: callLog.id,
      elderly_user_id: callLog.user_id,
      alert_type: 'mood',
      severity: analysis.mood_score === 1 ? 'HIGH' : 'MEDIUM',
      title: 'Low mood detected',
      description: `AI detected indicators of ${analysis.mood_description.toLowerCase()} mood during conversation`,
      keywords_detected: []
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
      console.log(`Created ${alerts.length} alerts for call ${callLog.id}`)
    }
  }
}

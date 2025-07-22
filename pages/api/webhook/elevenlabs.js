
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('ElevenLabs webhook received:', JSON.stringify(req.body, null, 2))

    const {
      conversation_id,
      transcript,
      duration_seconds,
      call_status,
      extracted_data,
      metadata
    } = req.body

    // Validate required fields
    if (!conversation_id || !transcript) {
      console.error('Missing required fields:', { conversation_id, transcript })
      return res.status(400).json({ error: 'Missing required fields: conversation_id and transcript' })
    }

    // Process extracted data with fallbacks
    const processedData = processCallData(extracted_data, transcript)
    
    // Determine elderly user (in production, this would come from metadata)
    // For now, we'll use the first elderly user in the database
    const { data: elderlyUsers, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('id, family_user_id, name')
      .limit(1)

    if (elderlyError || !elderlyUsers || elderlyUsers.length === 0) {
      console.error('Error finding elderly user:', elderlyError)
      return res.status(500).json({ error: 'Could not find elderly user' })
    }

    const elderlyUser = elderlyUsers[0]

    // Save call record to database
    const { data: callRecord, error: callError } = await supabase
      .from('call_records')
      .insert([
        {
          elderly_user_id: elderlyUser.id,
          call_date: new Date().toISOString(),
          call_duration: formatDuration(duration_seconds),
          mood_assessment: processedData.mood,
          conversation_summary: generateSummary(transcript, processedData),
          health_concerns: processedData.healthConcerns,
          ai_analysis: processedData.aiAnalysis,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (callError) {
      console.error('Error saving call record:', callError)
      return res.status(500).json({ error: 'Failed to save call record' })
    }

    console.log('Call record saved:', callRecord[0])

    // Generate alerts based on extracted data
    const alerts = await generateAlerts(processedData, elderlyUser, transcript)
    
    // Save alerts to database
    if (alerts.length > 0) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert(alerts.map(alert => ({
          ...alert,
          elderly_user_id: elderlyUser.id,
          family_user_id: elderlyUser.family_user_id,
          created_at: new Date().toISOString()
        })))

      if (alertError) {
        console.error('Error saving alerts:', alertError)
      } else {
        console.log(`Generated ${alerts.length} alerts`)
      }
    }

    // Return success response
    res.status(200).json({ 
      success: true, 
      call_id: callRecord[0].id,
      alerts_generated: alerts.length,
      mood_detected: processedData.mood,
      health_concerns: processedData.healthConcerns.length
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function processCallData(extractedData, transcript) {
  // Initialize default values
  let mood = 'neutral'
  let healthConcerns = []
  let socialActivity = 'normal'
  let emergencyFlags = []
  let aiAnalysis = ''

  try {
    // Process extracted data if available
    if (extractedData) {
      mood = extractedData.mood_rating || detectMoodFromTranscript(transcript)
      healthConcerns = extractedData.health_concerns || extractHealthConcerns(transcript)
      socialActivity = extractedData.social_activity || 'normal'
      emergencyFlags = extractedData.emergency_flags || detectEmergencyKeywords(transcript)
    } else {
      // Fallback to transcript analysis
      mood = detectMoodFromTranscript(transcript)
      healthConcerns = extractHealthConcerns(transcript)
      emergencyFlags = detectEmergencyKeywords(transcript)
    }

    // Generate AI analysis
    aiAnalysis = generateAIAnalysis(mood, healthConcerns, emergencyFlags, socialActivity)

  } catch (error) {
    console.error('Error processing call data:', error)
    aiAnalysis = 'Error processing call data. Manual review recommended.'
  }

  return {
    mood,
    healthConcerns,
    socialActivity,
    emergencyFlags,
    aiAnalysis
  }
}

function detectMoodFromTranscript(transcript) {
  const lowerTranscript = transcript.toLowerCase()
  
  // Positive mood indicators
  const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excited', 'cheerful', 'pleased']
  const negativeWords = ['sad', 'worried', 'anxious', 'depressed', 'upset', 'lonely', 'tired', 'stressed']
  
  const positiveCount = positiveWords.filter(word => lowerTranscript.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerTranscript.includes(word)).length
  
  if (positiveCount > negativeCount && positiveCount > 0) return 'happy'
  if (negativeCount > positiveCount && negativeCount > 0) return 'worried'
  if (lowerTranscript.includes('okay') || lowerTranscript.includes('fine')) return 'content'
  
  return 'neutral'
}

function extractHealthConcerns(transcript) {
  const healthKeywords = [
    'pain', 'hurt', 'ache', 'sick', 'dizzy', 'tired', 'weak', 'fell', 'fall',
    'chest pain', 'shortness of breath', 'headache', 'nausea', 'confused',
    'medication', 'doctor', 'hospital', 'appointment'
  ]
  
  const concerns = []
  const lowerTranscript = transcript.toLowerCase()
  
  healthKeywords.forEach(keyword => {
    if (lowerTranscript.includes(keyword)) {
      concerns.push(keyword)
    }
  })
  
  return concerns
}

function detectEmergencyKeywords(transcript) {
  const emergencyKeywords = [
    'chest pain', 'can\'t breathe', 'difficulty breathing', 'fell down', 
    'fallen', 'ambulance', 'hospital', 'emergency', 'help me', 'call 911'
  ]
  
  const flags = []
  const lowerTranscript = transcript.toLowerCase()
  
  emergencyKeywords.forEach(keyword => {
    if (lowerTranscript.includes(keyword)) {
      flags.push(keyword)
    }
  })
  
  return flags
}

function generateAIAnalysis(mood, healthConcerns, emergencyFlags, socialActivity) {
  let analysis = []
  
  // Mood analysis
  switch (mood) {
    case 'happy':
      analysis.push('Positive mood indicators detected.')
      break
    case 'worried':
      analysis.push('Concerns about mood - monitoring recommended.')
      break
    case 'content':
      analysis.push('Stable mood, generally content.')
      break
    default:
      analysis.push('Neutral mood assessment.')
  }
  
  // Health analysis
  if (emergencyFlags.length > 0) {
    analysis.push(`URGENT: Emergency keywords detected (${emergencyFlags.join(', ')}).`)
  } else if (healthConcerns.length > 0) {
    analysis.push(`Health mentions noted: ${healthConcerns.join(', ')}.`)
  } else {
    analysis.push('No significant health concerns mentioned.')
  }
  
  // Social analysis
  if (socialActivity === 'isolated') {
    analysis.push('Social isolation patterns detected.')
  }
  
  return analysis.join(' ')
}

async function generateAlerts(processedData, elderlyUser, transcript) {
  const alerts = []
  
  // Emergency alerts (HIGH priority)
  if (processedData.emergencyFlags.length > 0) {
    alerts.push({
      alert_type: 'emergency',
      severity: 'high',
      triggered_by: 'Emergency keywords detected in conversation',
      message: `Emergency keywords detected during call: ${processedData.emergencyFlags.join(', ')}. Immediate attention required.`,
      action_taken: 'Immediate call + SMS sent to family',
      keywords_detected: processedData.emergencyFlags
    })
  }
  
  // Health concern alerts (MEDIUM priority)
  if (processedData.healthConcerns.length > 0 && processedData.emergencyFlags.length === 0) {
    alerts.push({
      alert_type: 'health_mention',
      severity: 'medium',
      triggered_by: 'Health concerns mentioned',
      message: `Health concerns mentioned during conversation: ${processedData.healthConcerns.join(', ')}.`,
      action_taken: 'Email notification sent to family',
      keywords_detected: processedData.healthConcerns
    })
  }
  
  // Mood alerts (LOW to MEDIUM priority)
  if (processedData.mood === 'worried' || processedData.mood === 'sad') {
    // Check for pattern of concerning mood (would need historical data in production)
    alerts.push({
      alert_type: 'mood_change',
      severity: 'medium',
      triggered_by: 'Concerning mood detected',
      message: `Mood analysis indicates ${processedData.mood} state during today's call.`,
      action_taken: 'Email notification sent to family',
      keywords_detected: [`mood: ${processedData.mood}`]
    })
  }
  
  // Social isolation alerts
  if (processedData.socialActivity === 'isolated') {
    alerts.push({
      alert_type: 'social_isolation',
      severity: 'medium',
      triggered_by: 'Social isolation patterns detected',
      message: 'Conversation indicates potential social isolation or loneliness.',
      action_taken: 'Email notification sent to family',
      keywords_detected: ['social isolation']
    })
  }
  
  return alerts
}

function generateSummary(transcript, processedData) {
  const summaryParts = []
  
  // Add mood context
  summaryParts.push(`Conversation mood: ${processedData.mood}.`)
  
  // Add health context
  if (processedData.healthConcerns.length > 0) {
    summaryParts.push(`Health topics discussed: ${processedData.healthConcerns.join(', ')}.`)
  }
  
  // Add emergency context
  if (processedData.emergencyFlags.length > 0) {
    summaryParts.push(`URGENT CONCERNS: ${processedData.emergencyFlags.join(', ')}.`)
  }
  
  // Add a brief excerpt
  const words = transcript.split(' ')
  if (words.length > 50) {
    summaryParts.push(`Conversation excerpt: "${words.slice(0, 30).join(' ')}..."`)
  } else {
    summaryParts.push(`Full conversation: "${transcript}"`)
  }
  
  return summaryParts.join(' ')
}

function formatDuration(seconds) {
  if (!seconds) return 'Unknown duration'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  } else {
    return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`
  }
}

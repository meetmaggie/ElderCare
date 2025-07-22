
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get all elderly users
    const { data: elderlyUsers, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('*')

    if (elderlyError) {
      throw elderlyError
    }

    const demoCallRecords = []
    const demoAlerts = []

    // Generate demo data for each elderly user
    elderlyUsers.forEach((elderly, index) => {
      // Generate call records for the past 7 days
      for (let i = 0; i < 7; i++) {
        const callDate = new Date()
        callDate.setDate(callDate.getDate() - i)
        
        const moods = ['content', 'happy', 'worried', 'sad', 'cheerful']
        const healthConcerns = [
          ['back pain'], 
          ['headache'], 
          [], 
          ['knee ache', 'tired'], 
          ['chest tightness']
        ]
        
        const conversations = [
          "Had a lovely chat about the garden. Mentioned some back pain but spirits are good.",
          "Talked about family visit last week. Feeling a bit under the weather with a headache.",
          "Great conversation about the new book they're reading. Very engaged and happy.",
          "Discussed weekly shopping trip. Mentioned feeling tired and knee bothering them.",
          "Spoke about old memories. Mentioned chest feeling tight but said it's probably nothing."
        ]

        demoCallRecords.push({
          elderly_user_id: elderly.id,
          call_date: callDate.toISOString(),
          call_duration: `${Math.floor(Math.random() * 15) + 5} minutes`,
          mood_assessment: moods[i % moods.length],
          conversation_summary: conversations[i % conversations.length],
          health_concerns: healthConcerns[i % healthConcerns.length],
          ai_analysis: `AI detected ${moods[i % moods.length]} mood with ${healthConcerns[i % healthConcerns.length].length > 0 ? 'some health mentions' : 'no health concerns'}`,
          conversation_id: `demo-call-${elderly.id}-${i}`,
          call_status: 'completed',
          transcript: `This is a demo transcript for ${elderly.name}'s call on ${callDate.toDateString()}.`
        })

        // Generate some alerts
        if (healthConcerns[i % healthConcerns.length].length > 0) {
          demoAlerts.push({
            elderly_user_id: elderly.id,
            alert_type: 'health_mention',
            message: `Health concerns mentioned: ${healthConcerns[i % healthConcerns.length].join(', ')}`,
            severity: 'medium',
            created_at: callDate.toISOString()
          })
        }

        if (moods[i % moods.length] === 'worried' || moods[i % moods.length] === 'sad') {
          demoAlerts.push({
            elderly_user_id: elderly.id,
            alert_type: 'mood_change',
            message: `Mood analysis indicates ${moods[i % moods.length]} state during call`,
            severity: 'low',
            created_at: callDate.toISOString()
          })
        }
      }
    })

    // Insert call records
    const { error: callsError } = await supabase
      .from('call_records')
      .upsert(demoCallRecords)

    if (callsError) {
      throw callsError
    }

    // Insert alerts
    const { error: alertsError } = await supabase
      .from('alerts')
      .upsert(demoAlerts)

    if (alertsError) {
      throw alertsError
    }

    res.status(200).json({
      message: 'Demo data populated successfully',
      callRecords: demoCallRecords.length,
      alerts: demoAlerts.length
    })

  } catch (error) {
    console.error('Error populating demo data:', error)
    res.status(500).json({ error: 'Failed to populate demo data' })
  }
}

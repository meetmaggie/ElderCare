
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Starting demo data fix...')

    // Demo account configurations
    const demoAccounts = [
      {
        email: 'sarah.johnson.demo@gmail.com',
        elderlyName: 'Margaret Johnson',
        elderlyPhone: '+1-555-0123',
        relationship: 'mother'
      },
      {
        email: 'david.chen.demo@gmail.com',
        elderlyName: 'William Chen',
        elderlyPhone: '+1-555-0124',
        relationship: 'father'
      },
      {
        email: 'emma.thompson.demo@gmail.com',
        elderlyName: 'Robert Thompson',
        elderlyPhone: '+1-555-0125',
        relationship: 'grandfather'
      }
    ]

    const results = []

    for (const account of demoAccounts) {
      try {
        // Get the family user
        const { data: familyUser, error: familyError } = await supabase
          .from('family_users')
          .select('*')
          .eq('email', account.email)
          .single()

        if (familyError || !familyUser) {
          console.log(`No family user found for ${account.email}`)
          results.push({ email: account.email, status: 'no_family_user' })
          continue
        }

        // Check if elderly user already exists
        const { data: existingElderly } = await supabase
          .from('elderly_users')
          .select('*')
          .eq('family_user_id', familyUser.id)
          .single()

        if (existingElderly) {
          console.log(`Elderly user already exists for ${account.email}`)
          results.push({ email: account.email, status: 'already_exists' })
          continue
        }

        // Create elderly user
        const { data: elderlyUser, error: elderlyError } = await supabase
          .from('elderly_users')
          .insert({
            family_user_id: familyUser.id,
            name: account.elderlyName,
            phone: account.elderlyPhone,
            relationship: account.relationship,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (elderlyError) {
          console.error(`Error creating elderly user for ${account.email}:`, elderlyError)
          results.push({ email: account.email, status: 'error', error: elderlyError.message })
          continue
        }

        // Create some sample call records
        const callRecords = [
          {
            elderly_user_id: elderlyUser.id,
            call_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            call_duration: '00:03:45',
            mood_assessment: 'content',
            health_concerns: [],
            conversation_summary: 'Had a pleasant conversation about the weather and upcoming family visit. Feeling well overall.',
            ai_analysis: 'Positive mood detected. No health concerns identified. Good social engagement.'
          },
          {
            elderly_user_id: elderlyUser.id,
            call_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            call_duration: '00:04:12',
            mood_assessment: 'happy',
            health_concerns: [],
            conversation_summary: 'Excited about grandchildren visiting this weekend. Mentioned sleeping well.',
            ai_analysis: 'Very positive interaction. Good sleep patterns reported. High anticipation for family visit.'
          }
        ]

        const { error: callError } = await supabase
          .from('call_records')
          .insert(callRecords)

        if (callError) {
          console.error(`Error creating call records for ${account.email}:`, callError)
        }

        // Create a sample alert
        const { error: alertError } = await supabase
          .from('alerts')
          .insert({
            elderly_user_id: elderlyUser.id,
            type: 'health',
            severity: 'low',
            message: 'Mentioned feeling slightly more tired than usual',
            triggered_by: 'AI detected keyword: tired',
            created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
            resolved_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          })

        if (alertError) {
          console.error(`Error creating alert for ${account.email}:`, alertError)
        }

        results.push({ email: account.email, status: 'created' })
        console.log(`Successfully created elderly user for ${account.email}`)

      } catch (error) {
        console.error(`Error processing ${account.email}:`, error)
        results.push({ email: account.email, status: 'error', error: error.message })
      }
    }

    console.log('Demo data fix completed:', results)
    res.status(200).json({ success: true, results })

  } catch (error) {
    console.error('Error fixing demo data:', error)
    res.status(500).json({ error: error.message })
  }
}

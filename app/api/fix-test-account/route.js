
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { userEmail, userId } = await request.json()

    // Verify this is a test account
    if (!userEmail.endsWith('@test.local')) {
      return Response.json({ error: 'Only test accounts can be fixed via this endpoint' }, { status: 400 })
    }

    // Check if family user exists
    const { data: existingFamily, error: checkError } = await supabase
      .from('family_users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking family user:', checkError)
      return Response.json({ error: 'Database error' }, { status: 500 })
    }

    // If family user doesn't exist, create it
    if (!existingFamily) {
      const { error: familyError } = await supabase
        .from('family_users')
        .insert({
          id: userId,
          email: userEmail,
          name: 'Test User',
          subscription_status: 'active',
          plan: 'premium',
          plan_price: 29.99,
          alert_preferences: 'email',
          alert_frequency: 'standard',
          call_frequency: 'daily'
        })

      if (familyError) {
        console.error('Error creating family user:', familyError)
        return Response.json({ error: 'Failed to create family user' }, { status: 500 })
      }
    }

    // Check if elderly user exists
    const { data: existingElderly, error: elderlyCheckError } = await supabase
      .from('elderly_users')
      .select('id')
      .eq('family_user_id', userId)
      .maybeSingle()

    if (elderlyCheckError) {
      console.error('Error checking elderly user:', elderlyCheckError)
      return Response.json({ error: 'Database error' }, { status: 500 })
    }

    // If elderly user doesn't exist, create it
    if (!existingElderly) {
      const { error: elderlyError } = await supabase
        .from('elderly_users')
        .insert({
          family_user_id: userId,
          name: 'Test Elderly Person',
          phone: '+44 7700 900123',
          emergency_contact: 'Test User',
          emergency_phone: '+44 7700 900456',
          call_schedule: 'daily_9am',
          health_conditions: 'Test conditions',
          special_instructions: 'Test account setup'
        })

      if (elderlyError) {
        console.error('Error creating elderly user:', elderlyError)
        return Response.json({ error: 'Failed to create elderly user' }, { status: 500 })
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Test account database records created successfully' 
    })

  } catch (error) {
    console.error('Fix test account error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

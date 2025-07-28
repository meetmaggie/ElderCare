
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { userEmail } = await request.json()

    // Verify this is a test account
    if (!userEmail || !userEmail.endsWith('@test.local')) {
      return Response.json({ error: 'Reset only available for test accounts' }, { status: 403 })
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

    // Reset to Discovery call mode
    const { error: updateError } = await supabase
      .from('elderly_users')
      .update({
        first_call_completed: false,
        next_scheduled_call: null
      })
      .eq('id', elderlyUser.id)

    if (updateError) {
      console.error('Error resetting elderly user:', updateError)
      return Response.json({ error: 'Failed to reset call status' }, { status: 500 })
    }

    console.log(`Reset ${elderlyUser.name} to Discovery call mode`)

    return Response.json({ 
      success: true, 
      message: `${elderlyUser.name} reset to Discovery call mode`,
      elderlyUser: elderlyUser.name,
      nextCallType: 'Discovery'
    })

  } catch (error) {
    console.error('Error in reset discovery API:', error)
    return Response.json({ 
      error: 'Failed to reset discovery mode: ' + error.message 
    }, { status: 500 })
  }
}


import { supabase } from '../../../lib/supabase'
import CallingScheduler from '../../../lib/calling-scheduler'

export async function POST(request) {
  try {
    const { userId, isTestCall = false } = await request.json()

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('elderly_users')
      .select(`
        *,
        family_users!inner(*)
      `)
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // For non-test accounts, check if it's appropriate time to call
    if (!isTestCall && !user.family_users.email?.endsWith('@test.local')) {
      const now = new Date()
      const currentHour = now.getHours()
      
      // Don't call between 9 PM and 8 AM
      if (currentHour >= 21 || currentHour < 8) {
        return Response.json({ 
          error: 'Calls are not allowed between 9 PM and 8 AM' 
        }, { status: 400 })
      }
    }

    // Initialize scheduler and trigger call
    const scheduler = new CallingScheduler()
    await scheduler.initiateCall(user)

    return Response.json({ 
      success: true, 
      message: `Call initiated for ${user.name}`,
      elderlyUser: user.name
    })

  } catch (error) {
    console.error('Error triggering call:', error)
    return Response.json({ 
      error: 'Failed to initiate call: ' + error.message 
    }, { status: 500 })
  }
}

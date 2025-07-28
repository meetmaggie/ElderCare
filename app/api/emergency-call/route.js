
import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { elderlyUserId } = await request.json()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get elderly user details
    const { data: elderlyUser, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('id', elderlyUserId)
      .single()

    if (elderlyError || !elderlyUser) {
      return NextResponse.json({ error: 'Elderly user not found' }, { status: 404 })
    }

    // For now, we'll log the emergency call request
    // In a real implementation, this would trigger an actual ElevenLabs call
    console.log('Emergency call requested for:', elderlyUser.name, elderlyUser.phone)

    // Log the emergency call in the database
    const { error: logError } = await supabase
      .from('calls')
      .insert([
        {
          elderly_user_id: elderlyUserId,
          call_type: 'emergency',
          status: 'initiated',
          duration: '0',
          summary: 'Emergency call initiated by family member',
          created_at: new Date().toISOString()
        }
      ])

    if (logError) {
      console.error('Error logging emergency call:', logError)
    }

    // Create an alert for the emergency call
    const { error: alertError } = await supabase
      .from('alerts')
      .insert([
        {
          elderly_user_id: elderlyUserId,
          priority: 'HIGH',
          category: 'Emergency',
          title: 'Emergency call initiated',
          description: 'Family member initiated an emergency call',
          action_taken: 'Emergency call placed',
          resolved: false,
          created_at: new Date().toISOString()
        }
      ])

    if (alertError) {
      console.error('Error creating emergency alert:', alertError)
    }

    // TODO: Integrate with ElevenLabs API to make actual call
    // const elevenlabsResponse = await makeEmergencyCall(elderlyUser.phone)

    return NextResponse.json({ 
      success: true, 
      message: 'Emergency call initiated successfully',
      elderlyUser: elderlyUser.name
    })

  } catch (error) {
    console.error('Error in emergency call API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// TODO: Implement actual ElevenLabs call function
async function makeEmergencyCall(phoneNumber) {
  // This would integrate with ElevenLabs API to make the actual call
  // For now, it's a placeholder
  return { success: true, callId: 'placeholder' }
}

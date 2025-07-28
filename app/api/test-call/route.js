
import { supabase } from '../../../lib/supabase'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'
const DISCOVERY_AGENT_ID = 'agent_01k0q3vpk7f8bsrq2aqk71v9j9'

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

    // Create call record entry
    const { data: callRecord, error: callRecordError } = await supabase
      .from('call_records')
      .insert({
        elderly_user_id: elderlyUser.id,
        agent_used: DISCOVERY_AGENT_ID,
        phone_number: elderlyUser.phone,
        status: 'pending',
        call_date: new Date().toISOString()
      })
      .select()
      .single()

    if (callRecordError) {
      console.error('Error creating call record:', callRecordError)
      return Response.json({ error: 'Failed to create call record' }, { status: 500 })
    }

    // Prepare user context for ElevenLabs
    const userContext = {
      user_name: elderlyUser.name,
      is_first_call: !elderlyUser.first_call_completed,
      emergency_contact: elderlyUser.emergency_contact || '',
      emergency_phone: elderlyUser.emergency_phone || '',
      test_call: true
    }

    // Make ElevenLabs API call
    const elevenlabsPayload = {
      agent_id: DISCOVERY_AGENT_ID,
      mode: 'phone',
      phone_number: elderlyUser.phone,
      context: userContext,
      webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-repl-url.replit.dev'}/api/elevenlabs-webhook`
    }

    console.log('Calling ElevenLabs API with payload:', elevenlabsPayload)

    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/conversations`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
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
        .update({ status: 'failed' })
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
        elevenlabs_call_id: result.conversation_id,
        status: 'initiated'
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

import { supabase } from '../../../lib/supabase'

// Use environment variables for agent IDs
const DISCOVERY_AGENT_ID = process.env.ELEVENLABS_DISCOVERY_AGENT_ID
const DAILY_CHECKIN_AGENT_ID = process.env.ELEVENLABS_DAILY_AGENT_ID

export async function POST(request) {
  try {
    const { userEmail } = await request.json()

    // Verify this is a test account
    if (!userEmail || !userEmail.endsWith('@test.local')) {
      return Response.json({ error: 'Test calls only available for test accounts' }, { status: 403 })
    }

    console.log('Processing test call for:', userEmail)

    // Simplified: Look for test elderly user directly
    const { data: elderlyUser, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('email', userEmail.replace('@test.local', '@elderly.local'))
      .single()

    if (elderlyError || !elderlyUser) {
      console.log('No elderly user found, creating test user...')

      // Create a simple test elderly user
      const { data: newElderlyUser, error: createError } = await supabase
        .from('elderly_users')
        .insert({
          name: 'Test User',
          email: userEmail.replace('@test.local', '@elderly.local'),
          phone: '+1-555-123-4567', // Use US number for simplicity
          first_call_completed: false,
          emergency_contact: 'Test Family',
          emergency_phone: '+1-555-987-6543'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating test user:', createError)
        return Response.json({ error: 'Failed to create test user' }, { status: 500 })
      }

      elderlyUser = newElderlyUser
    }

    if (!elderlyUser.phone) {
      return Response.json({ error: 'No phone number configured for test user' }, { status: 400 })
    }

    console.log(`Initiating test call for ${elderlyUser.name} at ${elderlyUser.phone}`)

    // Determine which agent to use
    const isFirstCall = !elderlyUser.first_call_completed
    const agentId = isFirstCall ? DISCOVERY_AGENT_ID : DAILY_CHECKIN_AGENT_ID
    const agentType = isFirstCall ? 'Discovery' : 'Daily check-in'

    console.log(`Agent selection: ${agentType} (Agent ID: ${agentId})`)

    // Verify agent IDs are configured
    if (!DISCOVERY_AGENT_ID || !DAILY_CHECKIN_AGENT_ID) {
      return Response.json({ 
        error: 'Agent IDs not configured. Please check ELEVENLABS_DISCOVERY_AGENT_ID and ELEVENLABS_DAILY_AGENT_ID environment variables.' 
      }, { status: 500 })
    }

    // Create simple call record
    const { data: callRecord, error: callRecordError } = await supabase
      .from('call_records')
      .insert({
        elderly_user_id: elderlyUser.id,
        call_date: new Date().toISOString(),
        call_status: 'pending',
        agent_used: agentId
      })
      .select()
      .single()

    if (callRecordError) {
      console.error('Error creating call record:', callRecordError)
      return Response.json({ error: 'Failed to create call record' }, { status: 500 })
    }

    // Make the Twilio call
    const twilioResult = await makeTwilioCallDirect(elderlyUser, callRecord.id, elderlyUser.phone)

    if (!twilioResult.success) {
      console.error('Twilio call failed:', twilioResult.error)

      // Update call record with error status
      await supabase
        .from('call_records')
        .update({ call_status: 'failed' })
        .eq('id', callRecord.id)

      return Response.json({ 
        error: `Call initiation failed: ${twilioResult.error}` 
      }, { status: 500 })
    }

    // Update call record with Twilio CallSid
    await supabase
      .from('call_records')
      .update({
        twilio_call_sid: twilioResult.callSid,
        call_status: 'calling'
      })
      .eq('id', callRecord.id)

    console.log(`Test call initiated successfully for ${elderlyUser.name}`)

    return Response.json({ 
      success: true, 
      message: `Test call initiated for ${elderlyUser.name}`,
      elderlyUser: elderlyUser.name,
      phone: elderlyUser.phone,
      callSid: twilioResult.callSid,
      agentType: agentType,
      isFirstCall: isFirstCall
    })

  } catch (error) {
    console.error('Error in test call API:', error)
    return Response.json({ 
      error: 'Failed to initiate test call: ' + error.message 
    }, { status: 500 })
  }
}

// Simplified Twilio calling function
async function makeTwilioCallDirect(elderlyUser, callRecordId, phoneNumber) {
  try {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN  
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return { success: false, error: 'Twilio credentials not configured' }
    }

    // Use the current Replit domain
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'https://1eb18c8d-306d-4d45-ac0c-3c9329f5aeaf-00-25f9yh2yq2vx4.janeway.replit.dev'

    const webhookUrl = `${baseUrl}/api/incoming-call`
    const statusCallbackUrl = `${baseUrl}/api/twilio-status`

    console.log('Using webhook URL:', webhookUrl)
    console.log('Using status callback URL:', statusCallbackUrl)

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: TWILIO_PHONE_NUMBER,
        Url: webhookUrl,
        StatusCallback: statusCallbackUrl,
        StatusCallbackEvent: 'initiated,ringing,answered,completed',
        StatusCallbackMethod: 'POST'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio API error:', errorText)
      return { success: false, error: `Twilio API error: ${response.status}` }
    }

    const result = await response.json()
    console.log('Twilio call initiated:', result.sid)

    return { 
      success: true, 
      callSid: result.sid 
    }

  } catch (error) {
    console.error('Error making Twilio call:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}
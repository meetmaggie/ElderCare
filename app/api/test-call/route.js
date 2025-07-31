
// app/api/test-call/route.js - Fixed for call_date column
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    console.log('🔍 DEBUG: Starting test call...')
    
    // Check all required environment variables
    const requiredEnvVars = {
      'ELEVENLABS_API_KEY': process.env.ELEVENLABS_API_KEY,
      'ELEVENLABS_DISCOVERY_AGENT_ID': process.env.ELEVENLABS_DISCOVERY_AGENT_ID,
      'ELEVENLABS_DAILY_AGENT_ID': process.env.ELEVENLABS_DAILY_AGENT_ID,
      'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
      'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN,
      'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER,
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    
    // Log which variables are present/missing
    const missingVars = []
    
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        missingVars.push(key)
        console.log(`❌ MISSING: ${key}`)
      } else {
        console.log(`✅ PRESENT: ${key} = ${value.substring(0, 10)}...`)
      }
    }
    
    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
      console.error('🚨', errorMessage)
      return Response.json({ 
        error: errorMessage,
        missing: missingVars
      }, { status: 500 })
    }

    console.log('✅ All environment variables are present!')
    
    // Initialize Supabase
    console.log('🔗 Connecting to Supabase...')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Parse request
    const { userEmail, phoneNumber, callType = 'discovery' } = await request.json()
    console.log('📞 Test call request:', { userEmail, phoneNumber, callType })

    // Verify this is a test account
    if (!userEmail || !userEmail.endsWith('@test.local')) {
      return Response.json({ error: 'Test calls only available for test accounts' }, { status: 403 })
    }

    // Use provided phone number or default to your test number
    const targetPhone = phoneNumber || '+447562277268'
    console.log('📱 Target phone:', targetPhone)

    // Determine which agent to use
    let agentType = 'Discovery'
    
    if (callType === 'daily') {
      // Check if they've had a discovery call before
      const { data: previousCalls } = await supabase
        .from('call_records')
        .select('*')
        .eq('caller_phone', targetPhone)
        .eq('agent_used', 'Discovery')
        .eq('call_status', 'completed')
      
      if (previousCalls && previousCalls.length > 0) {
        agentType = 'Daily Check-in'
      }
    }

    console.log('🤖 Using agent type:', agentType)

    // Now try to insert a call record using call_date instead of created_at
    console.log('📝 Attempting to create call record...')
    
    const currentDate = new Date().toISOString()
    const testRecord = {
      caller_phone: targetPhone,
      call_status: 'calling',
      agent_used: agentType,
      call_date: currentDate  // Use call_date instead of created_at
    }
    
    console.log('📋 Record to insert:', testRecord)

    try {
      const { data: callRecord, error: callRecordError } = await supabase
        .from('call_records')
        .insert(testRecord)
        .select()
        .single()

      if (callRecordError) {
        console.error('❌ Insert failed - Full error details:')
        console.error('Error code:', callRecordError.code)
        console.error('Error message:', callRecordError.message)
        console.error('Error details:', callRecordError.details)
        console.error('Error hint:', callRecordError.hint)
        
        return Response.json({ 
          error: 'Failed to create call record: ' + callRecordError.message,
          errorCode: callRecordError.code,
          errorDetails: callRecordError.details,
          errorHint: callRecordError.hint
        }, { status: 500 })
      }

      console.log('✅ Database insert successful! Call record created:', callRecord)

      // Now make the actual Twilio call
      console.log('📞 Initiating Twilio call...')
      const twilioResult = await makeTwilioCall(targetPhone, callRecord.id)

      if (!twilioResult.success) {
        console.error('❌ Twilio call failed:', twilioResult.error)

        // Update call record with error
        await supabase
          .from('call_records')
          .update({ call_status: 'failed' })
          .eq('id', callRecord.id)

        return Response.json({ 
          error: `Call failed: ${twilioResult.error}` 
        }, { status: 500 })
      }

      // Update call record with Twilio SID
      await supabase
        .from('call_records')
        .update({
          twilio_call_sid: twilioResult.callSid,
          call_status: 'calling'
        })
        .eq('id', callRecord.id)

      console.log('✅ Test call initiated successfully!')

      return Response.json({ 
        success: true, 
        message: `${agentType} call initiated successfully!`,
        callSid: twilioResult.callSid,
        agentType: agentType,
        phoneNumber: targetPhone,
        callRecordId: callRecord.id
      })

    } catch (insertError) {
      console.error('❌ Database insert error:', insertError)
      return Response.json({ 
        error: 'Database insert failed: ' + insertError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ General error:', error)
    return Response.json({ 
      error: 'Test failed: ' + error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

async function makeTwilioCall(phoneNumber, callRecordId) {
  try {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN  
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return { success: false, error: 'Twilio credentials missing' }
    }

    // Get your repl URL automatically 
    const repl = process.env.REPL_SLUG || process.env.REPL_ID
    const webhookUrl = `https://1eb18c8d-306d-4d45-ac0c-3c9329f5aeaf-00-25f9yh2yq2vx4.janeway.replit.dev/api/incoming-call`
    
    console.log('🔗 Using webhook URL:', webhookUrl)

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
        Method: 'POST'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio API error:', errorText)
      return { success: false, error: `Twilio API error: ${response.status} - ${errorText}` }
    }

    const result = await response.json()
    console.log('📞 Twilio call created:', result.sid)

    return { 
      success: true, 
      callSid: result.sid 
    }

  } catch (error) {
    console.error('Twilio call error:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

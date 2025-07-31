import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST() {
  console.log('Processing test call...')

  try {
    const testEmail = 'testing@test.local'

    // Find the family user first
    const { data: familyUser, error: familyError } = await supabase
      .from('family_users')
      .select('*')
      .eq('email', testEmail)
      .single()

    if (familyError) {
      console.error('Family user not found:', familyError)
      return NextResponse.json({ 
        error: 'Test family user not found. Please run fix-test-account first.' 
      }, { status: 404 })
    }

    // Find the elderly user linked to this family
    const { data: elderlyUser, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('family_user_id', familyUser.id)
      .single()

    if (elderlyError) {
      console.error('Elderly user not found:', elderlyError)
      return NextResponse.json({ 
        error: 'Test elderly user not found. Please run fix-test-account first.' 
      }, { status: 404 })
    }

    console.log('Test users found:', {
      family: familyUser.name,
      elderly: elderlyUser.name,
      phone: elderlyUser.phone
    })

    // Check required environment variables
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
    const discoveryAgentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber || !discoveryAgentId) {
      return NextResponse.json({ 
        error: 'Missing required environment variables' 
      }, { status: 500 })
    }

    // Use a test phone number
    const phoneToCall = elderlyUser.phone || '+1-555-123-4567'

    // Create call record
    const { data: callRecord, error: recordError } = await supabase
      .from('call_records')
      .insert({
        elderly_user_id: elderlyUser.id,
        call_date: new Date().toISOString(),
        status: 'initiating',
        phone_number: phoneToCall,
        agent_used: 'Discovery',
        call_type: 'test'
      })
      .select()
      .single()

    if (recordError) {
      console.error('Error creating call record:', recordError)
      return NextResponse.json({ 
        error: 'Failed to create call record' 
      }, { status: 500 })
    }

    // Make the Twilio call
    const twilio = require('twilio')(twilioAccountSid, twilioAuthToken)

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-repl-url.replit.dev'}/api/incoming-call`

    try {
      const call = await twilio.calls.create({
        to: phoneToCall,
        from: twilioPhoneNumber,
        url: webhookUrl,
        method: 'POST'
      })

      // Update call record with Twilio SID
      await supabase
        .from('call_records')
        .update({ 
          twilio_call_sid: call.sid,
          status: 'calling'
        })
        .eq('id', callRecord.id)

      console.log('Test call initiated:', call.sid)

      return NextResponse.json({
        success: true,
        message: 'Test call initiated successfully',
        callSid: call.sid,
        phoneNumber: phoneToCall,
        elderlyUser: elderlyUser.name
      })

    } catch (twilioError) {
      console.error('Twilio error:', twilioError)

      // Update call record status
      await supabase
        .from('call_records')
        .update({ status: 'failed' })
        .eq('id', callRecord.id)

      return NextResponse.json({ 
        error: `Failed to initiate call: ${twilioError.message}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test call error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

import { supabase } from '../../../lib/supabase'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN  
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

export async function POST(request) {
  try {
    const { elderly_user_id, force_call = false, call_type = 'scheduled' } = await request.json()

    if (!elderly_user_id) {
      return Response.json({ error: 'elderly_user_id is required' }, { status: 400 })
    }

    // Validate Twilio credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials')
      return Response.json({ error: 'Twilio not configured' }, { status: 500 })
    }

    // Get elderly user details
    const { data: elderlyUser, error: userError } = await supabase
      .from('elderly_users')
      .select('*, family_users(*)')
      .eq('id', elderly_user_id)
      .single()

    if (userError || !elderlyUser) {
      return Response.json({ error: 'Elderly user not found' }, { status: 404 })
    }

    if (!elderlyUser.phone) {
      return Response.json({ error: 'No phone number configured for user' }, { status: 400 })
    }

    // Check if user needs a call (unless forced)
    if (!force_call && call_type === 'scheduled') {
      const shouldCall = await checkIfUserNeedsCall(elderlyUser)
      if (!shouldCall.needsCall) {
        return Response.json({ 
          success: false, 
          message: shouldCall.reason,
          nextCallTime: shouldCall.nextCallTime
        })
      }
    }

    console.log(`Initiating outbound call to ${elderlyUser.name} at ${elderlyUser.phone}`)

    // Determine agent type
    const isFirstCall = !elderlyUser.first_call_completed
    const agentType = isFirstCall ? 'Discovery' : 'Daily check-in'

    // Create call record
    const { data: callRecord, error: callRecordError } = await supabase
      .from('call_records')
      .insert({
        elderly_user_id: elderlyUser.id,
        phone_number: elderlyUser.phone,
        call_date: new Date().toISOString(),
        status: 'initiating',
        agent_used: isFirstCall ? 
          'agent_01k0q3vpk7f8bsrq2aqk71v9j9' : 
          'agent_01k0pz5awhf8xbn85wrg227fve',
        call_type: call_type
      })
      .select()
      .single()

    if (callRecordError) {
      console.error('Error creating call record:', callRecordError)
      return Response.json({ error: 'Failed to create call record' }, { status: 500 })
    }

    // Make Twilio API call
    const twilioResponse = await makeTwilioCall(elderlyUser, callRecord.id)

    if (twilioResponse.success) {
      // Update call record with Twilio CallSid
      await supabase
        .from('call_records')
        .update({
          twilio_call_sid: twilioResponse.callSid,
          status: 'calling'
        })
        .eq('id', callRecord.id)

      // Update user's next scheduled call time
      const nextCallTime = calculateNextCallTime(elderlyUser.family_users?.call_frequency || 'Daily')
      await supabase
        .from('elderly_users')
        .update({ next_scheduled_call: nextCallTime.toISOString() })
        .eq('id', elderlyUser.id)

      return Response.json({
        success: true,
        message: `${agentType} call initiated for ${elderlyUser.name}`,
        callSid: twilioResponse.callSid,
        callRecordId: callRecord.id,
        agentType: agentType
      })
    } else {
      // Update call record with error
      await supabase
        .from('call_records')
        .update({ status: 'failed', notes: twilioResponse.error })
        .eq('id', callRecord.id)

      return Response.json({ 
        error: `Failed to initiate call: ${twilioResponse.error}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in make-outbound-call:', error)
    return Response.json({ 
      error: 'Failed to initiate call: ' + error.message 
    }, { status: 500 })
  }
}

// Make actual Twilio call
async function makeTwilioCall(elderlyUser, callRecordId) {
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-repl-url.replit.dev'}/api/incoming-call`
    const statusCallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-repl-url.replit.dev'}/api/twilio-status`

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: `+1${elderlyUser.phone}`,
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

// Check if user needs a call based on schedule
async function checkIfUserNeedsCall(elderlyUser) {
  try {
    const now = new Date()
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5)
    
    // For test accounts, always allow calls
    if (elderlyUser.family_users?.email?.endsWith('@test.local')) {
      return { needsCall: true, reason: 'Test account - call allowed' }
    }

    // Check preferred call time (within 1 hour window)
    const preferredTime = elderlyUser.preferred_call_time || '09:00:00'
    const preferredHourMin = preferredTime.substring(0, 5)
    const timeDiff = getTimeDifferenceMinutes(currentTime, preferredHourMin)
    
    if (timeDiff > 60) {
      return { 
        needsCall: false, 
        reason: `Outside preferred call window. Preferred time: ${preferredHourMin}`,
        nextCallTime: null
      }
    }

    // Check call frequency
    const { data: lastCall } = await supabase
      .from('call_records')
      .select('call_date')
      .eq('elderly_user_id', elderlyUser.id)
      .eq('status', 'completed')
      .order('call_date', { ascending: false })
      .limit(1)
      .single()

    if (!lastCall) {
      return { needsCall: true, reason: 'First call for user' }
    }

    const daysSinceLastCall = getDaysSinceDate(lastCall.call_date)
    const callFrequency = elderlyUser.family_users?.call_frequency || 'Daily'

    switch (callFrequency) {
      case 'Daily':
        if (daysSinceLastCall >= 1) {
          return { needsCall: true, reason: 'Daily call due' }
        }
        break
      case 'Every other day':
        if (daysSinceLastCall >= 2) {
          return { needsCall: true, reason: 'Every other day call due' }
        }
        break
      case 'Weekly':
        if (daysSinceLastCall >= 7) {
          return { needsCall: true, reason: 'Weekly call due' }
        }
        break
    }

    const nextCall = calculateNextCallTime(callFrequency)
    return { 
      needsCall: false, 
      reason: `Too soon since last call (${daysSinceLastCall} days ago)`,
      nextCallTime: nextCall
    }

  } catch (error) {
    console.error('Error checking if user needs call:', error)
    return { needsCall: true, reason: 'Error checking schedule - allowing call' }
  }
}

// Helper functions
function getTimeDifferenceMinutes(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number)
  const [h2, m2] = time2.split(':').map(Number)
  const minutes1 = h1 * 60 + m1
  const minutes2 = h2 * 60 + m2
  return Math.abs(minutes1 - minutes2)
}

function getDaysSinceDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function calculateNextCallTime(frequency) {
  const now = new Date()
  switch (frequency) {
    case 'Daily':
      now.setDate(now.getDate() + 1)
      break
    case 'Every other day':
      now.setDate(now.getDate() + 2)
      break
    case 'Weekly':
      now.setDate(now.getDate() + 7)
      break
    default:
      now.setDate(now.getDate() + 1)
  }
  return now
}

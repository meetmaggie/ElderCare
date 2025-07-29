import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  console.log('📞 Twilio status webhook received!')

  try {
    // Parse Twilio webhook data
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const callStatus = formData.get('CallStatus')
    const callDuration = formData.get('CallDuration')
    const from = formData.get('From')
    const to = formData.get('To')

    console.log('Twilio status data:', {
      callSid,
      callStatus,
      callDuration,
      from,
      to
    })

    if (!callSid) {
      return Response.json({ error: 'Missing CallSid' }, { status: 400 })
    }

    // Find the call record
    const { data: callRecord, error: findError } = await supabase
      .from('call_records')
      .select('*, elderly_users(*)')
      .eq('twilio_call_sid', callSid)
      .single()

    if (findError || !callRecord) {
      console.error('Call record not found for CallSid:', callSid)
      return Response.json({ error: 'Call record not found' }, { status: 404 })
    }

    // Map Twilio status to our status
    let mappedStatus = 'unknown'
    switch (callStatus) {
      case 'completed':
        mappedStatus = 'completed'
        break
      case 'busy':
      case 'no-answer':
      case 'failed':
        mappedStatus = 'failed'
        break
      case 'canceled':
        mappedStatus = 'cancelled'
        break
      default:
        mappedStatus = callStatus
    }

    // Update call record with final status
    const { error: updateError } = await supabase
      .from('call_records')
      .update({
        status: mappedStatus,
        duration: callDuration ? parseInt(callDuration) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', callRecord.id)

    if (updateError) {
      console.error('Error updating call record:', updateError)
      return Response.json({ error: 'Failed to update call record' }, { status: 500 })
    }

    // If call completed successfully, mark first call as completed
    if (callStatus === 'completed' && callRecord.elderly_users && !callRecord.elderly_users.first_call_completed) {
      await supabase
        .from('elderly_users')
        .update({ first_call_completed: true })
        .eq('id', callRecord.elderly_user_id)

      console.log(`Marked first call completed for user ${callRecord.elderly_users.name}`)
    }

    // If call failed, create an alert
    if (['busy', 'no-answer', 'failed'].includes(callStatus)) {
      await createFailedCallAlert(callRecord, callStatus)
    }

    // For completed calls, the ElevenLabs webhook will handle conversation processing
    console.log(`Call ${callSid} status updated to ${mappedStatus}`)

    return Response.json({ 
      success: true, 
      status: mappedStatus,
      callSid: callSid
    })

  } catch (error) {
    console.error('Error in Twilio status webhook:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create alert for failed calls
async function createFailedCallAlert(callRecord, callStatus) {
  try {
    const alertTitle = `Call ${callStatus.replace('-', ' ')}`
    const alertDescription = `Attempted call to ${callRecord.elderly_users?.name || 'user'} was ${callStatus}`

    await supabase
      .from('alerts')
      .insert({
        elderly_user_id: callRecord.elderly_user_id,
        family_user_id: callRecord.elderly_users?.family_user_id,
        priority: callStatus === 'failed' ? 'HIGH' : 'MEDIUM',
        category: 'Call Status',
        title: alertTitle,
        description: alertDescription,
        resolved: false
      })

    console.log(`Created alert for failed call: ${callStatus}`)
  } catch (error) {
    console.error('Error creating failed call alert:', error)
  }
}
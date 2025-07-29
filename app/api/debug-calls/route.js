
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    // Get recent call records with detailed information
    const { data: callRecords, error } = await supabase
      .from('call_records')
      .select(`
        *,
        elderly_users (
          name,
          phone,
          first_call_completed
        )
      `)
      .order('call_date', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('Error fetching call records:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    // Analyze call records
    const analysis = {
      total_calls: callRecords.length,
      status_breakdown: {},
      null_duration_count: 0,
      null_mood_count: 0,
      null_transcript_count: 0,
      agent_usage: {},
      failed_calls_count: 0,
      successful_calls_count: 0,
      recent_calls: callRecords.slice(0, 5)
    }
    
    callRecords.forEach(call => {
      // Status breakdown - use call_status field
      const status = call.call_status || 'unknown'
      analysis.status_breakdown[status] = (analysis.status_breakdown[status] || 0) + 1
      
      // Track success/failure
      if (status === 'failed') {
        analysis.failed_calls_count++
      } else if (status === 'completed') {
        analysis.successful_calls_count++
      }
      
      // Null data counts
      if (call.duration === null) analysis.null_duration_count++
      if (call.mood === null) analysis.null_mood_count++
      if (call.transcript === null) analysis.null_transcript_count++
      
      // Agent usage
      if (call.agent_used) {
        analysis.agent_usage[call.agent_used] = (analysis.agent_usage[call.agent_used] || 0) + 1
      }
    })
    
    return Response.json({
      status: 'success',
      analysis,
      environment_check: {
        elevenlabs_api_key: !!process.env.ELEVENLABS_API_KEY,
        elevenlabs_webhook_secret: !!process.env.ELEVENLABS_WEBHOOK_SECRET,
        twilio_account_sid: !!process.env.TWILIO_ACCOUNT_SID,
        twilio_auth_token: !!process.env.TWILIO_AUTH_TOKEN,
        twilio_phone_number: !!process.env.TWILIO_PHONE_NUMBER,
        site_url: process.env.NEXT_PUBLIC_SITE_URL
      }
    })
    
  } catch (error) {
    console.error('Debug calls error:', error)
    return Response.json({ 
      error: error.message,
      status: 'failed'
    }, { status: 500 })
  }
}

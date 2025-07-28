
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    // Check recent call records
    const { data: recentCalls, error } = await supabase
      .from('call_records')
      .select('id, elderly_user_id, status, call_date, agent_used, elevenlabs_call_id')
      .order('call_date', { ascending: false })
      .limit(10)

    // Check webhook configuration
    const webhookConfig = {
      webhook_secret_configured: !!process.env.ELEVENLABS_WEBHOOK_SECRET,
      elevenlabs_api_key_configured: !!process.env.ELEVENLABS_API_KEY,
      webhook_endpoint: '/api/elevenlabs-webhook',
      last_updated: new Date().toISOString()
    }

    return Response.json({
      webhook_status: 'operational',
      configuration: webhookConfig,
      recent_calls: recentCalls || [],
      agents: {
        discovery: 'agent_01k0q3vpk7f8bsrq2aqk71v9j9',
        daily_checkin: 'agent_01k0pz5awhf8xbn85wrg227fve'
      }
    })

  } catch (error) {
    console.error('Webhook status error:', error)
    return Response.json({ 
      webhook_status: 'error',
      error: error.message 
    }, { status: 500 })
  }
}

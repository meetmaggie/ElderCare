// app/api/incoming-call/route.js - Try different WebSocket formats
export async function POST(request) {
  console.log('📞 Incoming call webhook triggered!')

  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')

    console.log('📋 Call details:', { callSid, from, to })

    // Get ElevenLabs credentials
    const discoveryAgentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID
    const apiKey = process.env.ELEVENLABS_API_KEY

    console.log('🔑 Using agent:', discoveryAgentId)

    if (!discoveryAgentId || !apiKey) {
      console.error('❌ Missing credentials!')
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Configuration error.</Say>
          <Hangup/>
        </Response>`,
        { headers: { 'Content-Type': 'application/xml' } }
      )
    }

    // Try Format 1: Latest ElevenLabs + Twilio integration format
    const format1 = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation/twilio">
      <Parameter name="agent_id" value="${discoveryAgentId}" />
      <Parameter name="xi-api-key" value="${apiKey}" />
      <Parameter name="sample_rate" value="8000" />
    </Stream>
  </Connect>
</Response>`

    console.log('📋 Trying FORMAT 1 (Twilio-specific endpoint):')
    console.log(format1)

    return new Response(format1, {
      headers: { 
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Technical error occurred.</Say>
        <Hangup/>
      </Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}
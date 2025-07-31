// app/api/incoming-call/route.js
export async function POST(request) {
  console.log('📞 Incoming call webhook triggered!')

  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')

    console.log('Call details:', { callSid, from, to })

    // Get ElevenLabs credentials
    const discoveryAgentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID
    const apiKey = process.env.ELEVENLABS_API_KEY

    console.log('Using Discovery agent:', discoveryAgentId)

    if (!discoveryAgentId || !apiKey) {
      console.error('Missing ElevenLabs credentials!')
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Configuration error. Please check your settings.</Say>
          <Hangup/>
        </Response>`,
        { headers: { 'Content-Type': 'application/xml' } }
      )
    }

    // Create TwiML to connect to ElevenLabs
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! Connecting you to your AI companion.</Say>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation">
      <Parameter name="agent_id" value="${discoveryAgentId}" />
      <Parameter name="authorization" value="Bearer ${apiKey}" />
    </Stream>
  </Connect>
</Response>`

    console.log('Sending TwiML response')

    return new Response(twimlResponse, {
      headers: { 'Content-Type': 'application/xml' }
    })

  } catch (error) {
    console.error('Webhook error:', error)

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Sorry, there was an error. Please try again.</Say>
        <Hangup/>
      </Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}
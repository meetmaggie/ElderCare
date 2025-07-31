
// app/api/incoming-call/route.js - Alternative ElevenLabs approach
export async function POST(request) {
  console.log('📞 Incoming call webhook triggered!')
  
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')
    
    console.log('📋 Call details:', { callSid, from, to })

    const agentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID
    const apiKey = process.env.ELEVENLABS_API_KEY
    
    // Dynamically determine WebSocket URL based on environment
    const host = request.headers.get('host')
    const websocketUrl = `wss://${host}:3002`
    
    console.log('🔗 Using WebSocket bridge URL:', websocketUrl)

    // TwiML for WebSocket bridge
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${websocketUrl}">
      <Parameter name="caller_phone" value="${from}" />
      <Parameter name="call_sid" value="${callSid}" />
      <Parameter name="agent_type" value="discovery" />
    </Stream>
  </Connect>
</Response>`
    
    console.log('📋 Sending redirect TwiML:')
    console.log(twimlResponse)
    
    return new Response(twimlResponse, {
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
        <Say>Sorry, connection failed. Please try again.</Say>
        <Hangup/>
      </Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}

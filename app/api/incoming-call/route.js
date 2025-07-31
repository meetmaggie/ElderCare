
// app/api/incoming-call/route.js - Updated for ElevenLabs
export async function POST(request) {
  console.log('📞 Incoming call webhook triggered!')
  
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')
    
    console.log('📋 Call details:', { callSid, from, to })
    
    // Your WebSocket bridge URL
    const websocketUrl = `wss://1eb18c8d-306d-4d45-ac0c-3c9329f5aeaf-00-25f9yh2yq2vx4.janeway.replit.dev:8080`
    
    console.log('🔗 Using WebSocket URL:', websocketUrl)
    
    // TwiML to connect to ElevenLabs bridge
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
    
    console.log('📋 Sending ElevenLabs TwiML:')
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
        <Say>Sorry, there was an error connecting to your AI companion.</Say>
        <Hangup/>
      </Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}

// app/api/incoming-call/route.js - Updated for WebSocket bridge
export async function POST(request) {
  console.log('📞 Incoming call webhook triggered!')

  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')

    console.log('📋 Call details:', { callSid, from, to })

    // Get your Replit WebSocket URL
    const repl = process.env.REPL_SLUG || process.env.REPL_ID || '1eb18c8d-306d-4d45-ac0c-3c9329f5aeaf-00-25f9yh2yq2vx4.janeway.replit'
    const websocketUrl = `wss://${repl}.dev:8080`

    console.log('🔗 Using WebSocket URL:', websocketUrl)

    // TwiML to connect to our WebSocket bridge
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! Connecting you to your AI companion.</Say>
  <Connect>
    <Stream url="${websocketUrl}" />
  </Connect>
</Response>`

    console.log('📋 Sending TwiML:')
    console.log(twimlResponse)

    return new Response(twimlResponse, {
      headers: { 
        'Content-Type': 'application/xml'
      }
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)

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
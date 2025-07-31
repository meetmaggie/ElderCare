
// app/api/incoming-call/route.js - Official ElevenLabs format
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
    
    // Official ElevenLabs + Twilio format from their docs
    const officialFormat = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${discoveryAgentId}">
      <Parameter name="xi-api-key" value="${apiKey}" />
    </Stream>
  </Connect>
</Response>`

    console.log('📋 Using OFFICIAL ElevenLabs format:')
    console.log(officialFormat)
    
    return new Response(officialFormat, {
      headers: { 
        'Content-Type': 'application/xml'
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

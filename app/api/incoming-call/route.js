
// app/api/incoming-call/route.js - Simple direct approach
export async function POST(request) {
  console.log('📞 Incoming call webhook triggered!')
  
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')
    
    console.log('📋 Call details:', { callSid, from, to })
    
    // Check which agent to use based on call history
    let agentType = 'Discovery'
    let message = 'Hello! This is Sarah, your AI companion. I\'m excited to get to know you better. What should I call you?'
    
    // Simple TwiML that uses ElevenLabs voice directly
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${message}</Say>
  <Gather input="speech" action="/api/handle-response" method="POST" speechTimeout="3" timeout="10">
    <Say voice="Polly.Joanna-Neural">I'm listening...</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">I didn't catch that. Let me call you back later. Goodbye!</Say>
  <Hangup/>
</Response>`
    
    console.log('📋 Sending simple TwiML:')
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

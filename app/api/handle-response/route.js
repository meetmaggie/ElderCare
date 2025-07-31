
// app/api/handle-response/route.js
export async function POST(request) {
  console.log('📞 Handling user response')
  
  try {
    const formData = await request.formData()
    const speechResult = formData.get('SpeechResult')
    const from = formData.get('From')
    
    console.log('User said:', speechResult)
    console.log('From:', from)
    
    // Simple response based on what they said
    let response = "Thank you for sharing that with me! I'm here to be your daily companion and check in with you. How are you feeling today?"
    
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${response}</Say>
  <Gather input="speech" action="/api/handle-response" method="POST" speechTimeout="5" timeout="15">
    <Say voice="Polly.Joanna-Neural">Please tell me how you're doing...</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">It was wonderful talking with you! I'll call again tomorrow. Take care!</Say>
  <Hangup/>
</Response>`
    
    return new Response(twimlResponse, {
      headers: { 'Content-Type': 'application/xml' }
    })
    
  } catch (error) {
    console.error('❌ Response handling error:', error)
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Thank you for talking with me today. Goodbye!</Say>
        <Hangup/>
      </Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}

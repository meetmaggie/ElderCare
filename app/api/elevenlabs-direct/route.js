
// app/api/elevenlabs-direct/route.js - Direct ElevenLabs API approach
export async function POST(request) {
  console.log('🔗 Testing direct ElevenLabs connection')
  
  try {
    const agentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID
    const apiKey = process.env.ELEVENLABS_API_KEY
    
    if (!agentId || !apiKey) {
      return Response.json({ error: 'Missing credentials' }, { status: 400 })
    }
    
    // Test direct conversation creation
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: agentId,
        mode: 'phone_call'
      })
    })
    
    const result = await response.json()
    console.log('ElevenLabs response:', result)
    
    return Response.json({ 
      success: response.ok,
      status: response.status,
      data: result
    })
    
  } catch (error) {
    console.error('ElevenLabs test error:', error)
    return Response.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

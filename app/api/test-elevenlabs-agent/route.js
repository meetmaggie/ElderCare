
export async function GET() {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
    const DISCOVERY_AGENT_ID = 'agent_01k0q3vpk7f8bsrq2aqk71v9j9'
    const DAILY_AGENT_ID = 'agent_01k0pz5awhf8xbn85wrg227fve'
    
    if (!ELEVENLABS_API_KEY) {
      return Response.json({ 
        error: 'ELEVENLABS_API_KEY not configured',
        status: 'failed'
      }, { status: 400 })
    }
    
    console.log('Testing ElevenLabs agent connectivity...')
    
    // Test Discovery Agent
    const discoveryResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${DISCOVERY_AGENT_ID}`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      }
    })
    
    // Test Daily Check-in Agent
    const dailyResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${DAILY_AGENT_ID}`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      }
    })
    
    const discoveryStatus = discoveryResponse.status
    const dailyStatus = dailyResponse.status
    
    console.log('Discovery agent status:', discoveryStatus)
    console.log('Daily agent status:', dailyStatus)
    
    const discoveryData = discoveryResponse.ok ? await discoveryResponse.json() : await discoveryResponse.text()
    const dailyData = dailyResponse.ok ? await dailyResponse.json() : await dailyResponse.text()
    
    return Response.json({
      status: 'completed',
      agents: {
        discovery: {
          id: DISCOVERY_AGENT_ID,
          status: discoveryStatus,
          accessible: discoveryResponse.ok,
          data: discoveryData
        },
        daily: {
          id: DAILY_AGENT_ID,
          status: dailyStatus,
          accessible: dailyResponse.ok,
          data: dailyData
        }
      },
      environment: {
        api_key_configured: !!ELEVENLABS_API_KEY,
        webhook_secret_configured: !!process.env.ELEVENLABS_WEBHOOK_SECRET,
        site_url: process.env.NEXT_PUBLIC_SITE_URL
      }
    })
    
  } catch (error) {
    console.error('ElevenLabs agent test error:', error)
    return Response.json({ 
      error: error.message,
      status: 'failed'
    }, { status: 500 })
  }
}

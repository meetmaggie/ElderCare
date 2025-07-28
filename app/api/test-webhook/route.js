
export async function POST(request) {
  try {
    const testData = await request.json()
    console.log('Test webhook received:', testData)
    
    return Response.json({ 
      success: true, 
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString(),
      data: testData
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return Response.json({ error: 'Test webhook failed' }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ 
    message: 'ElevenLabs webhook test endpoint',
    status: 'ready',
    timestamp: new Date().toISOString()
  })
}

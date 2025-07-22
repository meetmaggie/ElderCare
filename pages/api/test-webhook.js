
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simulate ElevenLabs webhook payload
  const mockWebhookData = {
    conversation_id: 'test-call-' + Date.now(),
    transcript: "Hello, how are you feeling today? I'm doing okay, though my back has been aching a bit. The weather is nice though, and I had a good chat with my neighbor yesterday. I've been taking my medications as usual.",
    duration_seconds: 720,
    call_status: 'completed',
    extracted_data: {
      mood_rating: 'content',
      health_concerns: ['back pain'],
      social_activity: 'normal',
      emergency_flags: []
    },
    metadata: {
      elderly_user_phone: '+1234567890',
      call_type: 'daily_check_in'
    }
  }

  try {
    // Forward to the actual webhook endpoint
    const webhookUrl = `${req.headers.origin}/api/webhook/elevenlabs`
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockWebhookData)
    })

    const result = await response.json()

    res.status(200).json({
      message: 'Test webhook sent successfully',
      mockData: mockWebhookData,
      webhookResponse: result
    })

  } catch (error) {
    console.error('Error testing webhook:', error)
    res.status(500).json({ error: 'Failed to test webhook' })
  }
}

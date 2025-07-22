export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { elderlyUserId } = req.body

    // If elderlyUserId provided, get the phone number
    let phone = '+1234567890' // default test phone

    if (elderlyUserId) {
      const { supabase } = await import('../../lib/supabase')
      const { data: elderlyUser, error } = await supabase
        .from('elderly_users')
        .select('phone')
        .eq('id', elderlyUserId)
        .single()

      if (!error && elderlyUser) {
        phone = elderlyUser.phone
      }
    }

    // Create mock ElevenLabs webhook data
    const mockWebhookData = {
      conversation_id: `test-call-${Date.now()}`,
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
        elderly_user_phone: phone,
        call_type: 'daily_check_in'
      }
    }

    // Call our own webhook endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhook/elevenlabs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockWebhookData)
    })

    const result = await response.json()

    res.status(200).json({
      message: 'Test webhook triggered successfully',
      webhookResponse: result,
      mockData: mockWebhookData
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    res.status(500).json({ error: 'Failed to trigger test webhook' })
  }
}
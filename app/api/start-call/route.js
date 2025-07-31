
export async function POST(request) {
  console.log('🚀 Starting outbound call process...')
  
  try {
    const { phoneNumber, message } = await request.json()
    
    if (!phoneNumber) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Twilio credentials - replace with your actual values
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid_here'
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here'
    const TWILIO_FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890'
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/incoming-call`
      : 'https://your-repl-url.replit.dev/api/incoming-call'

    console.log('📞 Initiating Twilio call to:', phoneNumber)

    // Step 1: Start the Twilio call
    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: TWILIO_FROM_NUMBER,
        Url: WEBHOOK_URL,
        Method: 'POST'
      })
    })

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text()
      console.error('❌ Twilio call failed:', errorText)
      return Response.json({ 
        error: `Twilio call failed: ${twilioResponse.status} - ${errorText}` 
      }, { status: 500 })
    }

    const twilioResult = await twilioResponse.json()
    console.log('✅ Twilio call initiated:', twilioResult.sid)

    // Step 2: Connect to Railway WebSocket server
    const WebSocket = require('ws')
    const railwayWsUrl = 'wss://elevenlabs-twilio-bridge-production-95ab.up.railway.app'
    
    console.log('🔌 Connecting to Railway WebSocket:', railwayWsUrl)

    return new Promise((resolve) => {
      const ws = new WebSocket(railwayWsUrl)
      let connectionTimeout

      ws.on('open', () => {
        console.log('✅ Connected to Railway WebSocket')
        
        // Step 3: Send start-call payload
        const payload = {
          type: 'start-call',
          timestamp: Date.now(),
          callSid: twilioResult.sid,
          phoneNumber: phoneNumber,
          message: message || 'Outbound call initiated'
        }
        
        console.log('📤 Sending payload:', payload)
        ws.send(JSON.stringify(payload))

        // Set timeout to close connection after 30 seconds
        connectionTimeout = setTimeout(() => {
          console.log('⏰ Closing WebSocket connection after 30 seconds')
          ws.close()
        }, 30000)
      })

      ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString())
          console.log('📥 Railway WebSocket response:', response)
        } catch (error) {
          console.log('📥 Railway WebSocket raw response:', data.toString())
        }
      })

      ws.on('close', (code, reason) => {
        console.log('🔌 Railway WebSocket closed:', code, reason.toString())
        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
        }
        
        resolve(Response.json({
          success: true,
          message: 'Call initiated and WebSocket connection established',
          callSid: twilioResult.sid,
          phoneNumber: phoneNumber
        }))
      })

      ws.on('error', (error) => {
        console.error('❌ Railway WebSocket error:', error)
        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
        }
        
        resolve(Response.json({
          success: true,
          message: 'Call initiated but WebSocket connection failed',
          callSid: twilioResult.sid,
          phoneNumber: phoneNumber,
          websocketError: error.message
        }))
      })

      // Fallback timeout in case WebSocket doesn't connect
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket connection timeout, closing...')
          ws.close()
        }
      }, 35000)
    })

  } catch (error) {
    console.error('❌ Error in start-call:', error)
    return Response.json({ 
      error: 'Failed to start call: ' + error.message 
    }, { status: 500 })
  }
}

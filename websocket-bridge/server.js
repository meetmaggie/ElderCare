
const { WebSocketServer } = require('ws')
const WebSocket = require('ws')
const fetch = require('node-fetch')
const http = require('http')

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('ElevenLabs-Twilio WebSocket Bridge Running')
})

// Create WebSocket server
const wss = new WebSocketServer({ server })

console.log('🚀 Starting ElevenLabs-Twilio bridge server...')

wss.on('connection', (twilioWs, request) => {
  console.log('📞 New Twilio WebSocket connection established!')
  console.log('🔗 Connection URL:', request.url)
  console.log('🌐 Client IP:', request.socket.remoteAddress)
  console.log('📋 Headers:', request.headers)
  
  let elevenLabsWs = null
  let streamSid = null
  let conversationId = null
  
  const connectToElevenLabs = async () => {
    try {
      console.log('🔗 Connecting to ElevenLabs...')
      
      const agentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID || 'agent_01k0q3vpk7f8bsrq2aqk71v9j9'
      const apiKey = process.env.ELEVENLABS_API_KEY
      
      if (!agentId || !apiKey) {
        console.error('❌ Missing ElevenLabs credentials')
        return
      }
      
      console.log('🤖 Using agent:', agentId)
      
      // Get signed URL from ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to get ElevenLabs signed URL:', response.status, errorText)
        return
      }
      
      const data = await response.json()
      console.log('✅ Got ElevenLabs signed URL')
      
      // Connect to ElevenLabs WebSocket
      elevenLabsWs = new WebSocket(data.signed_url)
      
      elevenLabsWs.on('open', () => {
        console.log('✅ Connected to ElevenLabs agent')
        
        // Send conversation initiation
        const initMessage = {
          type: 'conversation_initiation_client_data',
          conversation_initiation_client_data: {
            user_name: 'James',
            is_first_call: true,
            conversation_type: 'discovery'
          }
        }
        console.log('📤 Sending conversation initiation...')
        elevenLabsWs.send(JSON.stringify(initMessage))
      })
      
      elevenLabsWs.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          console.log('📨 ElevenLabs message:', message.type)
          
          switch (message.type) {
            case 'conversation_initiation_metadata':
              conversationId = message.conversation_initiation_metadata_event?.conversation_id
              console.log('✅ ElevenLabs conversation initiated:', conversationId)
              break
              
            case 'audio':
              if (twilioWs.readyState === WebSocket.OPEN && streamSid && message.audio_event?.audio_base_64) {
                const audioMessage = {
                  event: 'media',
                  streamSid: streamSid,
                  media: {
                    payload: message.audio_event.audio_base_64
                  }
                }
                twilioWs.send(JSON.stringify(audioMessage))
                console.log('🔊 Sent audio to Twilio')
              }
              break
              
            case 'interruption':
              if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
                const clearMessage = {
                  event: 'clear',
                  streamSid: streamSid
                }
                twilioWs.send(JSON.stringify(clearMessage))
                console.log('🛑 Cleared Twilio audio buffer')
              }
              break
              
            case 'ping':
              // Respond to ping with pong including required event_id
              if (elevenLabsWs.readyState === WebSocket.OPEN) {
                const eventId = message.event_id || `pong_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                const pongMessage = {
                  type: 'pong',
                  event_id: eventId
                }
                elevenLabsWs.send(JSON.stringify(pongMessage))
                console.log('🏓 Sent pong with event_id:', eventId)
              }
              break
              
            case 'conversation_end':
              console.log('✅ ElevenLabs conversation ended')
              if (twilioWs.readyState === WebSocket.OPEN) {
                twilioWs.close()
              }
              break
          }
        } catch (error) {
          console.error('❌ Error processing ElevenLabs message:', error)
        }
      })
      
      elevenLabsWs.on('error', (error) => {
        console.error('❌ ElevenLabs WebSocket error:', error)
      })
      
      elevenLabsWs.on('close', (code, reason) => {
        console.log('🔌 ElevenLabs WebSocket closed:', code, reason.toString())
      })
      
    } catch (error) {
      console.error('❌ Failed to connect to ElevenLabs:', error)
    }
  }
  
  // Send a test message to verify connection
  setTimeout(() => {
    if (twilioWs.readyState === WebSocket.OPEN) {
      console.log('✅ Sending connection test message to Twilio')
    }
  }, 1000)
  
  // Handle messages from Twilio
  twilioWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log('📨 Received Twilio message:', message.event)
      
      switch (message.event) {
        case 'start':
          streamSid = message.start.streamSid
          console.log('✅ Twilio stream started:', streamSid)
          connectToElevenLabs()
          break
          
        case 'media':
          if (elevenLabsWs?.readyState === WebSocket.OPEN && message.media?.payload) {
            const audioMessage = {
              user_audio_chunk: message.media.payload
            }
            elevenLabsWs.send(JSON.stringify(audioMessage))
          }
          break
          
        case 'stop':
          console.log('🔌 Twilio stream stopped')
          if (elevenLabsWs?.readyState === WebSocket.OPEN) {
            elevenLabsWs.close()
          }
          break
      }
    } catch (error) {
      console.error('❌ Error processing Twilio message:', error)
    }
  })
  
  twilioWs.on('close', (code, reason) => {
    console.log('🔌 Twilio WebSocket closed:', code, reason.toString())
    if (elevenLabsWs?.readyState === WebSocket.OPEN) {
      elevenLabsWs.close()
    }
  })
  
  twilioWs.on('error', (error) => {
    console.error('❌ Twilio WebSocket error:', error)
    console.error('❌ Error details:', error.message)
  })
  
  // Add connection state logging
  twilioWs.on('open', () => {
    console.log('✅ Twilio WebSocket fully opened')
  })
  
  twilioWs.on('close', (code, reason) => {
    console.log('🔌 Twilio WebSocket closed:', code, reason.toString())
    console.log('🔍 Close reason details:', { code, reason: reason.toString() })
  })
})

const PORT = process.env.PORT || 5000
console.log(`🔍 Environment PORT: ${process.env.PORT}`)
console.log(`🔍 Using PORT: ${PORT}`)
console.log(`🔍 Starting server on 0.0.0.0:${PORT}...`)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket bridge server running on 0.0.0.0:${PORT}`)
  console.log(`📞 Ready to bridge Twilio ↔ ElevenLabs`)
  console.log(`🌐 External URL: wss://1eb18c8d-306d-4d45-ac0c-3c9329f5aeaf-00-25f9yh2yq2vx4.janeway.replit.dev:${PORT}`)
  console.log(`✅ Server successfully bound to all interfaces`)
})

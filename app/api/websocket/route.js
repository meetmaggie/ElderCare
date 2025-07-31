
// app/api/websocket/route.js - WebSocket bridge for ElevenLabs
import { WebSocketServer } from 'ws'
import WebSocket from 'ws'
import fetch from 'node-fetch'

// Only start the WebSocket server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const wss = new WebSocketServer({ 
    port: 8080,
    host: '0.0.0.0'  // Allow external connections
  })

  wss.on('connection', (twilioWs) => {
    console.log('📞 Twilio WebSocket connected')
    
    let elevenLabsWs = null
    let streamSid = null
    
    // Connect to ElevenLabs
    const connectToElevenLabs = async () => {
      const agentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID
      const apiKey = process.env.ELEVENLABS_API_KEY
      
      if (!agentId || !apiKey) {
        console.error('❌ Missing ElevenLabs credentials')
        return
      }
      
      try {
        // Create signed URL for ElevenLabs
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
          method: 'GET',
          headers: {
            'xi-api-key': apiKey
          }
        })
        
        if (!response.ok) {
          console.error('❌ Failed to get ElevenLabs signed URL:', response.status)
          return
        }
        
        const { signed_url } = await response.json()
        console.log('✅ Got ElevenLabs signed URL')
        
        // Connect to ElevenLabs WebSocket
        elevenLabsWs = new WebSocket(signed_url)
        
        elevenLabsWs.on('open', () => {
          console.log('✅ Connected to ElevenLabs')
        })
        
        elevenLabsWs.on('message', (data) => {
          try {
            const message = JSON.parse(data)
            console.log('📨 ElevenLabs message:', message.type)
            
            switch (message.type) {
              case 'conversation_initiation_metadata':
                console.log('✅ ElevenLabs conversation initiated')
                break
                
              case 'audio':
                // Forward audio from ElevenLabs to Twilio
                if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
                  const audioMessage = {
                    event: 'media',
                    streamSid: streamSid,
                    media: {
                      payload: message.audio_event.audio_base_64
                    }
                  }
                  twilioWs.send(JSON.stringify(audioMessage))
                }
                break
                
              case 'interruption':
                // Clear Twilio audio buffer
                if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
                  const clearMessage = {
                    event: 'clear',
                    streamSid: streamSid
                  }
                  twilioWs.send(JSON.stringify(clearMessage))
                }
                break
                
              case 'ping':
                // Respond to ping with pong
                if (elevenLabsWs.readyState === WebSocket.OPEN) {
                  elevenLabsWs.send(JSON.stringify({ type: 'pong' }))
                }
                break
                
              case 'conversation_end':
                console.log('✅ ElevenLabs conversation ended')
                twilioWs.close()
                break
            }
          } catch (error) {
            console.error('❌ Error processing ElevenLabs message:', error)
          }
        })
        
        elevenLabsWs.on('error', (error) => {
          console.error('❌ ElevenLabs WebSocket error:', error)
        })
        
        elevenLabsWs.on('close', () => {
          console.log('🔌 ElevenLabs WebSocket closed')
        })
        
      } catch (error) {
        console.error('❌ Failed to connect to ElevenLabs:', error)
      }
    }
    
    // Handle Twilio messages
    twilioWs.on('message', (data) => {
      try {
        const message = JSON.parse(data)
        
        switch (message.event) {
          case 'start':
            streamSid = message.start.streamSid
            console.log('✅ Twilio stream started:', streamSid)
            connectToElevenLabs()
            break
            
          case 'media':
            // Forward audio from Twilio to ElevenLabs
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
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
    
    twilioWs.on('close', () => {
      console.log('🔌 Twilio WebSocket closed')
      if (elevenLabsWs?.readyState === WebSocket.OPEN) {
        elevenLabsWs.close()
      }
    })
    
    twilioWs.on('error', (error) => {
      console.error('❌ Twilio WebSocket error:', error)
    })
  })

  console.log('🚀 WebSocket server listening on port 8080')
}

// Export for Next.js API route compatibility
export async function GET() {
  return new Response('WebSocket server is running on port 8080', {
    status: 200
  })
}

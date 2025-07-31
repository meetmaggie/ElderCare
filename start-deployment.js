
#!/usr/bin/env node

const { spawn } = require('child_process')

console.log('🚀 Starting deployment services...')

let nextProcess = null

// Start WebSocket bridge server
console.log('🔌 Starting WebSocket bridge on port 5000...')
const wsProcess = spawn('node', ['websocket-bridge/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 5000 }
})

// Give WebSocket server time to start
setTimeout(() => {
  console.log('🌐 Starting Next.js on port 3000...')
  nextProcess = spawn('npm', ['run', 'start'], {
    stdio: 'inherit'
  })
  
  nextProcess.on('exit', (code) => {
    console.log('Next.js exited with code:', code)
    process.exit(code)
  })
}, 2000)

wsProcess.on('exit', (code) => {
  console.log('WebSocket bridge exited with code:', code)
  if (nextProcess) {
    nextProcess.kill()
  }
  process.exit(code)
})

// Handle cleanup
process.on('SIGTERM', () => {
  if (wsProcess) wsProcess.kill()
  if (nextProcess) nextProcess.kill()
})

process.on('SIGINT', () => {
  if (wsProcess) wsProcess.kill()
  if (nextProcess) nextProcess.kill()
  process.exit(0)
})

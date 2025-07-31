
#!/usr/bin/env node

const { spawn } = require('child_process')

console.log('🚀 Starting deployment services...')

// Start WebSocket bridge server
console.log('🔌 Starting WebSocket bridge on port 3002...')
const wsProcess = spawn('node', ['websocket-bridge/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3002' }
})

// Give WebSocket server time to start
setTimeout(() => {
  console.log('🌐 Starting Next.js on port 3000...')
  const nextProcess = spawn('npm', ['run', 'start'], {
    stdio: 'inherit'
  })
  
  nextProcess.on('exit', (code) => {
    console.log('Next.js exited with code:', code)
    process.exit(code)
  })
}, 2000)

wsProcess.on('exit', (code) => {
  console.log('WebSocket bridge exited with code:', code)
  process.exit(code)
})

// Handle cleanup
process.on('SIGTERM', () => {
  wsProcess.kill()
  nextProcess.kill()
})

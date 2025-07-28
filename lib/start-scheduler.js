
import CallingScheduler from './calling-scheduler.js'

// Initialize and start the automated calling scheduler
const scheduler = new CallingScheduler()

console.log('Initializing ElevenLabs Automated Calling System...')
console.log('- Discovery Agent ID:', 'agent_01k0q3vpk7f8bsrq2aqk71v9j9')
console.log('- Daily Check-in Agent ID:', 'agent_01k0pz5awhf8xbn85wrg227fve')
console.log('- Scheduler runs every 30 minutes')
console.log('- Webhook endpoint: /api/elevenlabs-webhook')

// Start the scheduler
scheduler.start()

export default scheduler

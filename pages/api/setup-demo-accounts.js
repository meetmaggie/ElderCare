
import { supabase } from '../../lib/supabase'
import { setupDemoAccounts } from '../../lib/demo-accounts'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const results = await setupDemoAccounts(supabase)
    
    res.status(200).json({
      message: 'Demo accounts setup completed',
      results: results,
      loginInstructions: {
        accounts: [
          {
            email: 'sarah.johnson.demo@example.com',
            password: 'password123',
            description: 'Sarah Johnson - Premium plan with Margaret (grandmother)'
          },
          {
            email: 'david.chen.demo@example.com', 
            password: 'password123',
            description: 'David Chen - Basic plan with Li (father)'
          },
          {
            email: 'emma.thompson.demo@example.com',
            password: 'password123', 
            description: 'Emma Thompson - Family plan with Robert (grandfather)'
          }
        ]
      }
    })
  } catch (error) {
    console.error('Error setting up demo accounts:', error)
    res.status(500).json({ error: 'Failed to setup demo accounts' })
  }
}

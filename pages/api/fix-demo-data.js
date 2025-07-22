
import { supabase } from '../../lib/supabase'
import { checkAndFixDemoData, demoAccounts } from '../../lib/demo-accounts'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const results = []

    // Check each demo account and fix missing data
    for (const [email, accountData] of Object.entries(demoAccounts)) {
      try {
        // Get the user ID for this email
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()
        
        if (userError) {
          console.error('Error fetching users:', userError)
          continue
        }

        const user = users.users.find(u => u.email === email)
        if (!user) {
          console.log(`User not found for ${email}`)
          continue
        }

        const wasFixed = await checkAndFixDemoData(supabase, email, user.id)
        results.push({
          email,
          status: wasFixed ? 'fixed' : 'already_complete',
          userId: user.id
        })
      } catch (error) {
        console.error(`Error fixing demo data for ${email}:`, error)
        results.push({
          email,
          status: 'error',
          error: error.message
        })
      }
    }

    res.status(200).json({
      message: 'Demo data fix completed',
      results: results
    })

  } catch (error) {
    console.error('Error fixing demo data:', error)
    res.status(500).json({ error: 'Failed to fix demo data' })
  }
}

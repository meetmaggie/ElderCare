// Demo account data for testing
export const demoAccounts = {
  'sarah.johnson.demo@gmail.com': {
    password: 'password123',
    familyData: {
      name: 'Sarah Johnson',
      phone: '+44 7123 456789',
      plan: 'premium',
      plan_price: 59
    },
    elderlyData: {
      name: 'Margaret Johnson',
      phone: '+44 7987 654321',
      emergency_contact: 'Sarah Johnson',
      emergency_phone: '+44 7123 456789',
      call_schedule: '10:00 AM - 12:00 PM'
    }
  },
  'david.chen.demo@gmail.com': {
    password: 'password123',
    familyData: {
      name: 'David Chen',
      phone: '+44 7234 567890',
      plan: 'basic',
      plan_price: 39
    },
    elderlyData: {
      name: 'Li Chen',
      phone: '+44 7876 543210',
      emergency_contact: 'David Chen',
      emergency_phone: '+44 7234 567890',
      call_schedule: '2:00 PM - 4:00 PM'
    }
  },
  'emma.thompson.demo@gmail.com': {
    password: 'password123',
    familyData: {
      name: 'Emma Thompson',
      phone: '+44 7345 678901',
      plan: 'family',
      plan_price: 99
    },
    elderlyData: {
      name: 'Robert Thompson',
      phone: '+44 7765 432109',
      emergency_contact: 'Emma Thompson',
      emergency_phone: '+44 7345 678901',
      call_schedule: '8:00 AM - 10:00 AM'
    }
  }
}

// Helper function to setup demo accounts in Supabase
export async function setupDemoAccounts(supabase) {
  const results = []

  for (const [email, accountData] of Object.entries(demoAccounts)) {
    try {
      // Create auth user using regular signup with auto-confirm for demo
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: accountData.password,
        options: {
          data: {
            name: accountData.familyData.name,
            phone: accountData.familyData.phone
          },
          emailRedirectTo: undefined
        }
      })

      if (authError) {
        // If user already exists, that's fine for demo purposes
        if (authError.message.includes('User already registered')) {
          console.log(`Demo user ${email} already exists, continuing with data setup`)

          // Try to get the existing user ID by signing them in temporarily
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: accountData.password
          })

          if (signInData.user && !signInError) {
            authData = { data: signInData, error: null }
          } else {
            console.log(`Could not get existing user data for ${email}, skipping`)
            continue
          }
        } else {
          console.error(`Error creating auth user for ${email}:`, authError)
          continue
        }
      }

      // For demo purposes, we'll assume the user is confirmed
      const userId = authData.user.id

      // Insert family user
      const { error: familyError } = await supabase
        .from('family_users')
        .upsert([
          {
            id: userId,
            email: email,
            name: accountData.familyData.name,
            phone: accountData.familyData.phone,
            subscription_status: 'active',
            plan: accountData.familyData.plan,
            plan_price: accountData.familyData.plan_price,
            alert_preferences: 'phone',
            alert_frequency: 'standard',
            call_frequency: 'daily'
          }
        ])

      if (familyError) {
        console.error(`Error creating family user for ${email}:`, familyError)
        continue
      }

      // Insert elderly user
      const { error: elderlyError } = await supabase
        .from('elderly_users')
        .upsert([
          {
            name: accountData.elderlyData.name,
            phone: accountData.elderlyData.phone,
            family_user_id: userId,
            emergency_contact: accountData.elderlyData.emergency_contact,
            emergency_phone: accountData.elderlyData.emergency_phone,
            call_schedule: accountData.elderlyData.call_schedule,
            health_conditions: 'High blood pressure, Arthritis',
            special_instructions: 'Prefers morning calls, hard of hearing - speak clearly'
          }
        ])

      if (elderlyError) {
        console.error(`Error creating elderly user for ${email}:`, elderlyError)
        continue
      }

      results.push({ email, status: 'success', userId: userId })
    } catch (error) {
      console.error(`Error setting up demo account ${email}:`, error)
      results.push({ email, status: 'error', error: error.message })
    }
  }

  return results
}
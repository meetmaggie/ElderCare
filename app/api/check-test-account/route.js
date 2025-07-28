
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    console.log('=== CHECKING TEST ACCOUNT DATABASE LINKAGE ===')
    
    const testEmail = 'testing@test.local'
    
    // 1. Query family_users table
    console.log('1. Checking family_users table...')
    const { data: familyUser, error: familyError } = await supabase
      .from('family_users')
      .select('*')
      .eq('email', testEmail)
      .single()

    if (familyError) {
      console.error('Family user error:', familyError)
      return Response.json({ 
        error: 'Family user not found', 
        details: familyError,
        step: 'family_users_query'
      }, { status: 404 })
    }

    console.log('Family user found:', {
      id: familyUser.id,
      email: familyUser.email,
      name: familyUser.name,
      plan: familyUser.plan
    })

    // 2. Query elderly_users table
    console.log('2. Checking elderly_users table...')
    const { data: elderlyUser, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('family_user_id', familyUser.id)
      .single()

    if (elderlyError) {
      console.error('Elderly user error:', elderlyError)
      return Response.json({ 
        error: 'Elderly user not found', 
        details: elderlyError,
        familyUserId: familyUser.id,
        step: 'elderly_users_query'
      }, { status: 404 })
    }

    console.log('Elderly user found:', {
      id: elderlyUser.id,
      name: elderlyUser.name,
      phone: elderlyUser.phone,
      family_user_id: elderlyUser.family_user_id
    })

    // 3. Check call_records table
    console.log('3. Checking call_records table...')
    const { data: callRecords, error: callError } = await supabase
      .from('call_records')
      .select('*')
      .eq('elderly_user_id', elderlyUser.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (callError) {
      console.error('Call records error:', callError)
    }

    console.log(`Found ${callRecords?.length || 0} call records`)

    // 4. Check conversations table (if it exists)
    console.log('4. Checking conversations table...')
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(5)

    if (convError) {
      console.log('Conversations table error (may not exist):', convError.message)
    }

    // 5. Check if there are any call_logs entries
    console.log('5. Checking call_logs table...')
    const { data: callLogs, error: logsError } = await supabase
      .from('call_logs')
      .select('*')
      .eq('user_id', elderlyUser.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (logsError) {
      console.log('Call logs error (may not exist):', logsError.message)
    }

    // Return comprehensive report
    const report = {
      success: true,
      testEmail: testEmail,
      linkage: {
        familyUser: {
          id: familyUser.id,
          email: familyUser.email,
          name: familyUser.name,
          phone: familyUser.phone,
          plan: familyUser.plan,
          subscription_status: familyUser.subscription_status
        },
        elderlyUser: {
          id: elderlyUser.id,
          name: elderlyUser.name,
          phone: elderlyUser.phone,
          family_user_id: elderlyUser.family_user_id,
          emergency_contact: elderlyUser.emergency_contact,
          emergency_phone: elderlyUser.emergency_phone,
          first_call_completed: elderlyUser.first_call_completed
        },
        linkageVerified: familyUser.id === elderlyUser.family_user_id
      },
      dataRecords: {
        callRecords: callRecords || [],
        callRecordsCount: callRecords?.length || 0,
        conversations: conversations || [],
        conversationsCount: conversations?.length || 0,
        callLogs: callLogs || [],
        callLogsCount: callLogs?.length || 0
      },
      agentTestConnection: {
        elderlyUserId: elderlyUser.id,
        phoneNumber: elderlyUser.phone,
        readyForTesting: !!(elderlyUser.phone && elderlyUser.name)
      }
    }

    console.log('=== LINKAGE VERIFICATION COMPLETE ===')
    console.log('Family User ID:', familyUser.id)
    console.log('Elderly User ID:', elderlyUser.id)
    console.log('Linkage Verified:', familyUser.id === elderlyUser.family_user_id)
    console.log('Phone Number:', elderlyUser.phone)
    console.log('Ready for Agent Testing:', !!(elderlyUser.phone && elderlyUser.name))

    return Response.json(report)

  } catch (error) {
    console.error('Error checking test account:', error)
    return Response.json({ 
      error: 'Internal server error', 
      details: error.message,
      step: 'general_error'
    }, { status: 500 })
  }
}

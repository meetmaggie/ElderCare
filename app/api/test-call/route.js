
// app/api/test-call/route.js - Debug Version
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    console.log('🔍 DEBUG: Starting test call...')
    
    // Check all required environment variables
    const requiredEnvVars = {
      'ELEVENLABS_API_KEY': process.env.ELEVENLABS_API_KEY,
      'ELEVENLABS_DISCOVERY_AGENT_ID': process.env.ELEVENLABS_DISCOVERY_AGENT_ID,
      'ELEVENLABS_DAILY_AGENT_ID': process.env.ELEVENLABS_DAILY_AGENT_ID,
      'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
      'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN,
      'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER,
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    
    // Log which variables are present/missing
    const missingVars = []
    
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        missingVars.push(key)
        console.log(`❌ MISSING: ${key}`)
      } else {
        console.log(`✅ PRESENT: ${key} = ${value.substring(0, 10)}...`)
      }
    }
    
    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
      console.error('🚨', errorMessage)
      return Response.json({ 
        error: errorMessage,
        missing: missingVars
      }, { status: 500 })
    }

    console.log('✅ All environment variables are present!')
    
    // Initialize Supabase
    console.log('🔗 Connecting to Supabase...')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Parse request
    const { userEmail, phoneNumber, callType = 'discovery' } = await request.json()
    console.log('📞 Test call request:', { userEmail, phoneNumber, callType })

    // Verify this is a test account
    if (!userEmail || !userEmail.endsWith('@test.local')) {
      return Response.json({ error: 'Test calls only available for test accounts' }, { status: 403 })
    }

    // Use provided phone number or default to your test number
    const targetPhone = phoneNumber || '+447562277268'
    console.log('📱 Target phone:', targetPhone)

    // Test database connection by checking if call_records table exists
    console.log('🔍 Testing database connection and table structure...')
    
    try {
      // First, try to query the table structure
      const { data: tableCheck, error: tableError } = await supabase
        .from('call_records')
        .select('*')
        .limit(1)

      if (tableError) {
        console.error('❌ Table check failed:', tableError)
        return Response.json({ 
          error: 'Database table check failed: ' + tableError.message,
          details: tableError,
          suggestion: 'The call_records table might not exist or has wrong permissions'
        }, { status: 500 })
      }

      console.log('✅ call_records table exists and is accessible')

    } catch (tableTestError) {
      console.error('❌ Database connection test failed:', tableTestError)
      return Response.json({ 
        error: 'Database connection failed: ' + tableTestError.message 
      }, { status: 500 })
    }

    // Now try to insert a test record
    console.log('📝 Attempting to create call record...')
    
    const testRecord = {
      caller_phone: targetPhone,
      call_status: 'testing',
      agent_used: 'Discovery',
      created_at: new Date().toISOString()
    }
    
    console.log('📋 Record to insert:', testRecord)

    try {
      const { data: callRecord, error: callRecordError } = await supabase
        .from('call_records')
        .insert(testRecord)
        .select()
        .single()

      if (callRecordError) {
        console.error('❌ Insert failed - Full error details:')
        console.error('Error code:', callRecordError.code)
        console.error('Error message:', callRecordError.message)
        console.error('Error details:', callRecordError.details)
        console.error('Error hint:', callRecordError.hint)
        
        return Response.json({ 
          error: 'Failed to create call record: ' + callRecordError.message,
          errorCode: callRecordError.code,
          errorDetails: callRecordError.details,
          errorHint: callRecordError.hint,
          suggestion: 'Check if the call_records table has the correct columns: caller_phone, call_status, agent_used, created_at'
        }, { status: 500 })
      }

      console.log('✅ Database insert successful! Call record created:', callRecord)

      return Response.json({ 
        success: true, 
        message: 'Database test successful!',
        callRecordId: callRecord.id,
        insertedData: callRecord,
        environmentCheck: 'PASSED',
        databaseCheck: 'PASSED'
      })

    } catch (insertError) {
      console.error('❌ Database insert error:', insertError)
      return Response.json({ 
        error: 'Database insert failed: ' + insertError.message,
        suggestion: 'This might be a permissions issue or missing columns in the call_records table'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ General error:', error)
    return Response.json({ 
      error: 'Test failed: ' + error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

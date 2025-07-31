
import { supabase } from '../../../lib/supabase'

export async function POST() {
  console.log('🔧 Fixing database schema...')
  
  try {
    // Add the missing twilio_call_sid column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE call_records 
        ADD COLUMN IF NOT EXISTS twilio_call_sid TEXT;
        
        ALTER TABLE call_records 
        ADD COLUMN IF NOT EXISTS call_status TEXT DEFAULT 'pending';
        
        ALTER TABLE call_records 
        ADD COLUMN IF NOT EXISTS agent_used TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_call_records_twilio_call_sid 
        ON call_records(twilio_call_sid);
      `
    })

    if (alterError) {
      console.error('Error altering table:', alterError)
      
      // Try direct SQL approach
      const { error: directError } = await supabase
        .from('call_records')
        .select('twilio_call_sid')
        .limit(1)
      
      if (directError && directError.code === '42703') {
        return Response.json({ 
          error: 'Database schema needs to be updated. Please run the SQL commands manually in Supabase dashboard.',
          sql: `
            ALTER TABLE call_records ADD COLUMN IF NOT EXISTS twilio_call_sid TEXT;
            ALTER TABLE call_records ADD COLUMN IF NOT EXISTS call_status TEXT DEFAULT 'pending';
            ALTER TABLE call_records ADD COLUMN IF NOT EXISTS agent_used TEXT;
          `
        }, { status: 500 })
      }
    }

    console.log('✅ Database schema updated successfully')
    
    return Response.json({ 
      success: true, 
      message: 'Database schema updated with missing columns' 
    })

  } catch (error) {
    console.error('Error fixing database schema:', error)
    return Response.json({ 
      error: 'Failed to update database schema: ' + error.message,
      suggestion: 'Please add the missing columns manually in Supabase dashboard'
    }, { status: 500 })
  }
}


import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { checkAndFixDemoData } from '../../../lib/demo-accounts'

export async function POST() {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if this is a demo account
    if (!session.user.email || !session.user.email.includes('.demo@')) {
      return NextResponse.json({ error: 'Not a demo account' }, { status: 400 })
    }

    // Fix the demo data
    const result = await checkAndFixDemoData(supabase, session.user.email, session.user.id)
    
    if (result) {
      return NextResponse.json({ success: true, message: 'Demo data fixed successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to fix demo data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fixing demo data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

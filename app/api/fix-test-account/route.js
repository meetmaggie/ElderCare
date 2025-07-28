
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    const { userEmail, userId } = body
    
    // Use the provided email and userId, or default to testing@test.local
    const testEmail = userEmail || 'testing@test.local'
    const testUserId = userId

    if (!testUserId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the test family user
    const { data: familyUser, error: familyError } = await supabase
      .from('family_users')
      .select('*')
      .eq('email', testEmail)
      .single()

    // If family user doesn't exist, create it
    if (familyError && familyError.code === 'PGRST116') {
      console.log(`Creating missing family user for ${testEmail}`)
      
      const { data: newFamilyUser, error: createFamilyError } = await supabase
        .from('family_users')
        .insert({
          id: testUserId,
          email: testEmail,
          name: 'Testing Family',
          phone: '+1-555-987-6543',
          subscription_status: 'active',
          plan: 'premium',
          plan_price: 29.99,
          alert_preferences: 'email',
          alert_frequency: 'standard',
          call_frequency: 'Daily'
        })
        .select()
        .single()

      if (createFamilyError) {
        console.error('Error creating family user:', createFamilyError)
        return Response.json({ error: 'Failed to create family user' }, { status: 500 })
      }

      // Use the newly created family user
      const finalFamilyUser = newFamilyUser || { id: testUserId, email: testEmail }
      
      // Continue with elderly user creation
      const { data: elderlyUser, error: elderlyError } = await supabase
        .from('elderly_users')
        .select('*')
        .eq('family_user_id', testUserId)
        .single()

      if (elderlyError && elderlyError.code === 'PGRST116') {
        const { data: newElderlyUser, error: createElderlyError } = await supabase
          .from('elderly_users')
          .insert({
            name: 'Margaret Johnson',
            phone: '+1-555-123-4567',
            family_user_id: testUserId,
            emergency_contact: 'Testing Family',
            emergency_phone: '+1-555-987-6543',
            first_call_completed: false,
            preferred_call_time: '09:00:00'
          })
          .select()
          .single()

        if (createElderlyError) {
          console.error('Error creating elderly user:', createElderlyError)
          return Response.json({ error: 'Failed to create elderly user' }, { status: 500 })
        }

        return Response.json({ 
          success: true, 
          message: 'Test account created successfully',
          familyUser: finalFamilyUser,
          elderlyUser: newElderlyUser
        })
      }

      return Response.json({ 
        success: true, 
        message: 'Test account setup completed',
        familyUser: finalFamilyUser,
        elderlyUser: elderlyUser
      })
    }

    if (familyError) {
      console.error('Error checking family user:', familyError)
      return Response.json({ error: 'Database error checking family user' }, { status: 500 })
    }

    // Check if elderly user exists for this family
    const { data: elderlyUser, error: elderlyError } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('family_user_id', familyUser.id)
      .single()

    if (elderlyError && elderlyError.code !== 'PGRST116') {
      console.error('Error checking elderly user:', elderlyError)
      return Response.json({ error: 'Database error' }, { status: 500 })
    }

    // If elderly user doesn't exist, create one
    if (!elderlyUser) {
      const { data: newElderlyUser, error: createError } = await supabase
        .from('elderly_users')
        .insert({
          name: 'Margaret Johnson',
          phone: '+1-555-123-4567',
          family_user_id: familyUser.id,
          emergency_contact: 'Testing Family',
          emergency_phone: '+1-555-987-6543',
          first_call_completed: false,
          preferred_call_time: '09:00:00'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating elderly user:', createError)
        return Response.json({ error: 'Failed to create elderly user' }, { status: 500 })
      }

      // Update family user with call frequency
      await supabase
        .from('family_users')
        .update({
          call_frequency: 'Daily'
        })
        .eq('id', familyUser.id)

      return Response.json({ 
        success: true, 
        message: 'Test account setup completed',
        elderlyUser: newElderlyUser
      })
    }

    // Update existing elderly user with proper phone number if missing
    if (!elderlyUser.phone) {
      await supabase
        .from('elderly_users')
        .update({
          phone: '+1-555-123-4567',
          emergency_contact: 'Testing Family',
          emergency_phone: '+1-555-987-6543'
        })
        .eq('id', elderlyUser.id)
    }

    // Ensure family user has call frequency set
    if (!familyUser.call_frequency) {
      await supabase
        .from('family_users')
        .update({
          call_frequency: 'Daily'
        })
        .eq('id', familyUser.id)
    }

    return Response.json({ 
      success: true, 
      message: 'Test account verified and updated',
      elderlyUser: elderlyUser
    })

  } catch (error) {
    console.error('Error in fix-test-account:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

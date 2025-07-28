
import { supabase } from '../../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email') || 'testing@test.local'

    // Get test user
    const { data: familyUser } = await supabase
      .from('family_users')
      .select('*')
      .eq('email', testEmail)
      .single()

    if (!familyUser) {
      return Response.json({ error: 'Test user not found' }, { status: 404 })
    }

    const { data: elderlyUser } = await supabase
      .from('elderly_users')
      .select('*')
      .eq('family_user_id', familyUser.id)
      .single()

    if (!elderlyUser) {
      return Response.json({ error: 'Elderly user not found' }, { status: 404 })
    }

    // Get conversation history with enhanced data
    const { data: recentCalls } = await supabase
      .from('call_records')
      .select('*')
      .eq('elderly_user_id', elderlyUser.id)
      .eq('status', 'completed')
      .order('call_date', { ascending: false })
      .limit(5)

    // Get mood history
    const { data: moodHistory } = await supabase
      .from('mood_tracking')
      .select('*')
      .eq('elderly_user_id', elderlyUser.id)
      .order('call_date', { ascending: false })
      .limit(5)

    // Extract dynamic variables
    const extractedVariables = extractDynamicVariables(recentCalls, moodHistory)

    return Response.json({
      success: true,
      user: {
        name: elderlyUser.name,
        phone: elderlyUser.phone,
        first_call_completed: elderlyUser.first_call_completed
      },
      conversation_data: {
        total_calls: recentCalls?.length || 0,
        recent_calls: recentCalls?.map(call => ({
          date: call.call_date,
          summary: call.summary,
          mood: call.mood,
          topics: call.key_topics,
          health_keywords: call.health_keywords,
          hobby_keywords: call.hobby_keywords,
          family_keywords: call.family_keywords
        })) || []
      },
      dynamic_variables: extractedVariables,
      agent_context: generateAgentContext(elderlyUser, extractedVariables)
    })

  } catch (error) {
    console.error('Error testing dynamic variables:', error)
    return Response.json({ 
      error: 'Failed to test dynamic variables: ' + error.message 
    }, { status: 500 })
  }
}

function extractDynamicVariables(calls, moodHistory) {
  // Extract unique hobbies
  const allHobbies = calls?.flatMap(call => call.hobby_keywords || []) || []
  const hobbies = [...new Set(allHobbies)].slice(0, 5)

  // Extract family updates
  const familyMentions = calls?.flatMap(call => call.family_keywords || []) || []
  const familyUpdates = [...new Set(familyMentions)].slice(0, 5)

  // Extract health mentions
  const healthMentions = calls?.filter(call => 
    call.health_keywords && call.health_keywords.length > 0
  ).map(call => ({
    date: call.call_date,
    keywords: call.health_keywords,
    summary: call.summary
  })).slice(0, 3) || []

  // Previous conversation topics
  const previousTopics = calls?.map(call => call.summary).filter(Boolean).slice(0, 3) || []

  // Calculate mood trend
  const avgMood = moodHistory && moodHistory.length > 0 
    ? moodHistory.reduce((sum, mood) => sum + (mood.mood_score || 3), 0) / moodHistory.length
    : 3
    
  const moodTrend = avgMood >= 4 ? 'Positive' : avgMood >= 3 ? 'Stable' : 'Needs Attention'

  return {
    hobbies,
    family_updates: familyUpdates,
    health_mentions: healthMentions,
    previous_topics: previousTopics,
    mood_trend: moodTrend,
    average_mood_score: Math.round(avgMood * 10) / 10,
    recent_topics: calls?.flatMap(call => call.key_topics || []).slice(0, 8) || []
  }
}

function generateAgentContext(user, variables) {
  const context = {
    user_name: user.name,
    is_first_call: !user.first_call_completed,
    dynamic_context: variables,
    agent_guidance: []
  }

  // Generate guidance based on data
  if (!user.first_call_completed) {
    context.agent_guidance.push("Discovery call: Learn about interests, family, hobbies, and daily routine")
  } else {
    context.agent_guidance.push("Follow-up call: Reference previous conversations")
    
    if (variables.hobbies.length > 0) {
      context.agent_guidance.push(`Ask about their hobbies: ${variables.hobbies.join(', ')}`)
    }
    
    if (variables.family_updates.length > 0) {
      context.agent_guidance.push(`Check on family topics: ${variables.family_updates.join(', ')}`)
    }
    
    if (variables.health_mentions.length > 0) {
      context.agent_guidance.push("Health topics mentioned recently - check in gently")
    }
    
    if (variables.mood_trend === 'Needs Attention') {
      context.agent_guidance.push("Recent mood indicators suggest extra support needed")
    }
  }

  return context
}

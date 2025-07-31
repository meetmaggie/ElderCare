import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  console.log('🔗 Outbound call connected');

  try {
    // Get call information from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid');
    const to = formData.get('To'); // The person being called
    const callStatus = formData.get('CallStatus');

    console.log('Call details:', { callSid, to, callStatus });

    // Get your ElevenLabs credentials from environment variables
    const discoveryAgentId = process.env.ELEVENLABS_DISCOVERY_AGENT_ID;
    const dailyAgentId = process.env.ELEVENLABS_DAILY_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    console.log('🔑 Agent IDs loaded:', { 
      discovery: discoveryAgentId?.slice(0, 20) + '...', 
      daily: dailyAgentId?.slice(0, 20) + '...' 
    });

    // Check if credentials exist
    if (!discoveryAgentId || !dailyAgentId || !apiKey) {
      console.error('❌ Missing ElevenLabs credentials!');

      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, the system is not configured properly.</Say>
          <Hangup/>
        </Response>`,
        {
          status: 200,
          headers: { 'Content-Type': 'application/xml' }
        }
      );
    }

    // Find the call record to determine which agent to use
    let agentToUse = discoveryAgentId; // Default
    let agentType = 'Discovery';

    try {
      // Look up the call record by phone number or call SID
      const { data: callRecord, error } = await supabase
        .from('call_records')
        .select('*')
        .or(`twilio_call_sid.eq.${callSid},caller_phone.eq.${to}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('⚠️ Could not find call record, using Discovery agent');
      } else if (callRecord) {
        console.log('📋 Found call record:', callRecord);

        if (callRecord.agent_used === 'Daily Check-in') {
          agentToUse = dailyAgentId;
          agentType = 'Daily Check-in';
        }

        // Update the call status
        await supabase
          .from('call_records')
          .update({ 
            call_status: 'connected',
            twilio_call_sid: callSid 
          })
          .eq('id', callRecord.id);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    console.log(`🤖 Using ${agentType} agent:`, agentToUse);

    // Create the TwiML response to connect to the appropriate ElevenLabs agent
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! This is your AI companion calling to check in with you.</Say>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation">
      <Parameter name="agent_id" value="${agentToUse}" />
      <Parameter name="authorization" value="Bearer ${apiKey}" />
    </Stream>
  </Connect>
</Response>`;

    console.log(`📋 Connecting to ${agentType} agent`);

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Sorry, there was an error connecting the call.</Say>
        <Hangup/>
      </Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'application/xml' }
      }
    );
  }
}
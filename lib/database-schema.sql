
-- Enhanced database schema for automated ElevenLabs calling system

-- Update family_users table to include calling preferences
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS call_frequency TEXT DEFAULT 'Daily';
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS preferred_call_time TIME DEFAULT '09:00:00';
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS first_call_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS next_scheduled_call TIMESTAMP WITH TIME ZONE;

-- Update elderly_users table for calling data
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS call_frequency TEXT DEFAULT 'Daily';
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS preferred_call_time TIME DEFAULT '09:00:00';
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS first_call_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS next_scheduled_call TIMESTAMP WITH TIME ZONE;

-- Call records table (updated with enhanced fields)
CREATE TABLE IF NOT EXISTS call_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    elderly_user_id UUID REFERENCES elderly_users(id) ON DELETE CASCADE,
    agent_used TEXT,
    call_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER, -- in seconds
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, no_answer
    phone_number TEXT,
    elevenlabs_call_id TEXT,
    
    -- Conversation content
    transcript TEXT,
    summary TEXT,
    mood TEXT,
    key_topics TEXT[], -- array of topics
    
    -- Enhanced dynamic variables
    health_keywords TEXT[],
    hobby_keywords TEXT[],
    family_keywords TEXT[],
    social_keywords TEXT[],
    activity_keywords TEXT[],
    specific_mentions JSONB, -- structured mentions like names, places, activities
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table for storing call analysis (legacy support)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_log_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
    summary TEXT,
    transcript TEXT,
    mood_analysis TEXT,
    key_topics TEXT[], -- array of topics
    health_mentions TEXT[],
    ai_insights TEXT,
    conversation_quality TEXT DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_call_records_elderly_user ON call_records(elderly_user_id);
CREATE INDEX IF NOT EXISTS idx_call_records_date ON call_records(call_date);
CREATE INDEX IF NOT EXISTS idx_call_records_status ON call_records(status);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON mood_tracking(elderly_user_id, call_date);

-- Enhanced alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_log_id UUID REFERENCES call_logs(id) ON DELETE CASCADE,
    elderly_user_id UUID REFERENCES elderly_users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- mood, health, emergency, missed_call
    severity TEXT NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    title TEXT NOT NULL,
    description TEXT,
    keywords_detected TEXT[],
    family_notified BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    action_taken TEXT,
    pattern_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood tracking table
CREATE TABLE IF NOT EXISTS mood_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    elderly_user_id UUID REFERENCES elderly_users(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id) ON DELETE CASCADE,
    call_date DATE NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
    mood_description TEXT,
    analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_date ON call_logs(call_date);
CREATE INDEX IF NOT EXISTS idx_alerts_elderly_user_id ON alerts(elderly_user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_id ON mood_tracking(elderly_user_id);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_date ON mood_tracking(call_date);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON call_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

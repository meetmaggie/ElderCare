
-- First, let's add the missing 'plan' column to family_users table
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS plan_price INTEGER;
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS alert_preferences TEXT DEFAULT 'phone';
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS alert_frequency TEXT DEFAULT 'standard';
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS call_frequency TEXT DEFAULT 'daily';

-- Add missing columns to elderly_users table
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS health_conditions TEXT;
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Create tables if they don't exist (run these in Supabase SQL editor)
CREATE TABLE IF NOT EXISTS family_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  subscription_status TEXT DEFAULT 'trial',
  plan TEXT,
  plan_price INTEGER,
  alert_preferences TEXT DEFAULT 'phone',
  alert_frequency TEXT DEFAULT 'standard',
  call_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elderly_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  family_user_id INTEGER REFERENCES family_users(id),
  emergency_contact TEXT,
  emergency_phone TEXT,
  call_schedule TEXT,
  health_conditions TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_records table for conversation tracking
CREATE TABLE IF NOT EXISTS call_records (
  id SERIAL PRIMARY KEY,
  elderly_user_id INTEGER REFERENCES elderly_users(id),
  call_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  call_duration TEXT,
  mood_assessment TEXT,
  conversation_summary TEXT,
  health_concerns TEXT[],
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table for automated monitoring
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  elderly_user_id INTEGER REFERENCES elderly_users(id),
  family_user_id INTEGER REFERENCES family_users(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  triggered_by TEXT,
  message TEXT NOT NULL,
  action_taken TEXT,
  keywords_detected TEXT[],
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_records (
  id SERIAL PRIMARY KEY,
  elderly_user_id INTEGER REFERENCES elderly_users(id),
  call_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  call_duration TEXT,
  mood_assessment TEXT,
  health_concerns TEXT,
  conversation_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  elderly_user_id INTEGER REFERENCES elderly_users(id),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

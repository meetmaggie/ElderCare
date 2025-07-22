-- First, let's add the missing 'plan' column to family_users table
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS plan_price INTEGER;
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS alert_preferences TEXT DEFAULT 'phone';
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS alert_frequency TEXT DEFAULT 'standard';
ALTER TABLE family_users ADD COLUMN IF NOT EXISTS call_frequency TEXT DEFAULT 'daily';

-- Add missing columns to elderly_users table
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS health_conditions TEXT;
ALTER TABLE elderly_users ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Drop existing tables if they have conflicts (only run if needed)
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS call_records CASCADE;
DROP TABLE IF EXISTS elderly_users CASCADE;
DROP TABLE IF EXISTS family_users CASCADE;

-- Create tables with consistent data types
-- Note: Use UUID as primary key for family_users to match Supabase Auth user IDs
CREATE TABLE IF NOT EXISTS family_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Use INTEGER for elderly_users to keep it simple
CREATE TABLE IF NOT EXISTS elderly_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  family_user_id UUID REFERENCES family_users(id) ON DELETE CASCADE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  call_schedule TEXT,
  health_conditions TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_records table with INTEGER foreign key to match elderly_users
CREATE TABLE IF NOT EXISTS call_records (
  id SERIAL PRIMARY KEY,
  elderly_user_id INTEGER REFERENCES elderly_users(id) ON DELETE CASCADE,
  call_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER, -- in seconds
  mood TEXT,
  health_status TEXT,
  summary TEXT,
  transcript TEXT,
  call_duration TEXT,
  mood_assessment TEXT,
  conversation_summary TEXT,
  health_concerns TEXT[],
  ai_analysis TEXT,
  conversation_id TEXT,
  call_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table with INTEGER foreign key to match elderly_users
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  elderly_user_id INTEGER REFERENCES elderly_users(id) ON DELETE CASCADE,
  family_user_id UUID REFERENCES family_users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  triggered_by TEXT,
  action_taken TEXT,
  keywords_detected TEXT[],
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
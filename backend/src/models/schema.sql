-- ============================================================================
-- AI Government Scheme Recommender - Production SQL Schema for Supabase PostgreSQL
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Authentication Credentials)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles Table (Demographics & Socio-Economic Indicators)
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INT,
    state VARCHAR(100),
    occupation VARCHAR(100),
    annual_income NUMERIC,
    education_level VARCHAR(100),
    employment_status VARCHAR(100),
    marital_status VARCHAR(100),
    special_category VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Schemes Table (Verified Government Schemes)
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    benefits TEXT,
    eligibility_criteria JSONB, -- Structured rules: min_age, max_age, max_income, target_occupations, states, etc.
    required_documents JSONB, -- Array of string document names
    applicable_state VARCHAR(100) DEFAULT 'ALL', -- 'ALL' or specific state name
    official_application_url TEXT,
    official_source_url TEXT,
    category VARCHAR(100), -- Education, Social Welfare, Healthcare, Agriculture, Legal Aid, Employment, Housing
    target_group VARCHAR(100), -- Students, Farmers, Women, Minorities, Senior Citizens, Unemployed, Low-Income Families
    is_live_discovered BOOLEAN DEFAULT FALSE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idempotent schema migrations
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS is_live_discovered BOOLEAN DEFAULT FALSE;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. User Schemes (Tracker / Saved Applications)
CREATE TABLE IF NOT EXISTS user_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Saved', -- Saved, Planning to Apply, Documents Ready, Applied, Completed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, scheme_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_applicable_state ON schemes(applicable_state);
CREATE INDEX IF NOT EXISTS idx_schemes_target_group ON schemes(target_group);
CREATE INDEX IF NOT EXISTS idx_user_schemes_user ON user_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_schemes_scheme ON user_schemes(scheme_id);

-- ============================================================================
-- Row Level Security (RLS) Policies (For Direct Supabase Client Integration)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view or modify their own profile
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- User Schemes (Tracker): Users can manage their own tracked applications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own tracked schemes') THEN
        CREATE POLICY "Users can manage own tracked schemes" ON user_schemes FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Schemes: Read-only access for everyone, no unauthorized modification
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Schemes are readable by all') THEN
        CREATE POLICY "Schemes are readable by all" ON schemes FOR SELECT USING (true);
    END IF;
END $$;

-- Create custom types
CREATE TYPE case_type AS ENUM ('personal', 'workplace', 'agreement');
CREATE TYPE case_status AS ENUM ('draft', 'active', 'resolved', 'cancelled');
CREATE TYPE sender_type AS ENUM ('user', 'ai', 'system');
CREATE TYPE message_type AS ENUM ('plain', 'ai_suggestion', 'system');
CREATE TYPE agreement_status AS ENUM ('none', 'draft', 'finalized');
CREATE TYPE sensitivity_level AS ENUM ('low', 'normal', 'high');
CREATE TYPE role_in_case AS ENUM ('initiator', 'invited_party');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id),
    title TEXT,
    type case_type,
    status case_status,
    ai_summary TEXT,
    invite_email TEXT,
    invite_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create case_participants table
CREATE TABLE case_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    user_id UUID REFERENCES profiles(id),
    role_in_case role_in_case,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    has_signed_agreement BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP WITH TIME ZONE
);

-- Create case_context table
CREATE TABLE case_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    user_id UUID REFERENCES profiles(id),
    background_text TEXT,
    goals_text TEXT,
    acceptable_outcome_text TEXT,
    constraints_text TEXT,
    sensitivity_level sensitivity_level,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    sender_user_id UUID REFERENCES profiles(id),
    sender_type sender_type,
    content TEXT,
    message_type message_type,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agreements table
CREATE TABLE agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    draft_text TEXT,
    finalized_text TEXT,
    status agreement_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finalized_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for cases
CREATE POLICY "Users can view cases they created or participate in" ON cases
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = cases.id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert cases they create" ON cases
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update cases they created or participate in" ON cases
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = cases.id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete cases they created" ON cases
    FOR DELETE USING (created_by = auth.uid());

-- Policies for case_context
CREATE POLICY "Users can view context in cases they participate in" ON case_context
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_context.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert context in cases they participate in" ON case_context
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_context.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update context in cases they participate in" ON case_context
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_context.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete context in cases they participate in" ON case_context
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_context.case_id AND user_id = auth.uid())
    );

-- Policies for messages
CREATE POLICY "Users can view messages in cases they participate in" ON messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = messages.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert messages in cases they participate in" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = messages.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update messages in cases they participate in" ON messages
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = messages.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete messages in cases they participate in" ON messages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = messages.case_id AND user_id = auth.uid())
    );

-- Policies for agreements
CREATE POLICY "Users can view agreements in cases they participate in" ON agreements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = agreements.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert agreements in cases they participate in" ON agreements
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = agreements.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update agreements in cases they participate in" ON agreements
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = agreements.case_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete agreements in cases they participate in" ON agreements
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = agreements.case_id AND user_id = auth.uid())
    );
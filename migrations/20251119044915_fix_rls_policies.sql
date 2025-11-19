-- Fix RLS policy issues causing 500 and 401 errors
-- Enable RLS on case_participants table and add comprehensive policies
-- Update profiles table policies to allow viewing profiles of case participants

-- Enable RLS on case_participants table
ALTER TABLE IF EXISTS case_participants ENABLE ROW LEVEL SECURITY;

-- Policies for case_participants
DROP POLICY IF EXISTS "Users can view participants in cases they participate in" ON case_participants;
CREATE POLICY "Users can view participants in cases they participate in" ON case_participants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM case_participants cp WHERE cp.case_id = case_participants.case_id AND cp.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert participants in cases they participate in" ON case_participants;
CREATE POLICY "Users can insert participants in cases they participate in" ON case_participants
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM case_participants cp WHERE cp.case_id = case_participants.case_id AND cp.user_id = auth.uid()) OR
        case_participants.user_id = auth.uid()  -- Allow users to join cases
    );

DROP POLICY IF EXISTS "Users can update participants in cases they participate in" ON case_participants;
CREATE POLICY "Users can update participants in cases they participate in" ON case_participants
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM case_participants cp WHERE cp.case_id = case_participants.case_id AND cp.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete participants in cases they participate in" ON case_participants;
CREATE POLICY "Users can delete participants in cases they participate in" ON case_participants
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM case_participants cp WHERE cp.case_id = case_participants.case_id AND cp.user_id = auth.uid())
    );

-- Update profiles policies to allow viewing profiles of case participants
DROP POLICY IF EXISTS "Users can view profiles of case participants" ON profiles;
CREATE POLICY "Users can view profiles of case participants" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR  -- Users can view their own profile
        EXISTS (
            SELECT 1 FROM case_participants cp1
            JOIN case_participants cp2 ON cp1.case_id = cp2.case_id
            WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.id
        )
    );
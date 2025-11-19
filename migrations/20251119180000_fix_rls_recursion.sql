-- Fix infinite recursion in RLS policies
-- Update case_participants SELECT policy to avoid recursion
-- Update profiles SELECT policy to use cases instead of self-joining case_participants

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view participants in cases they participate in" ON case_participants;

-- Create new policy
CREATE POLICY "Users can view participants in cases they participate in" ON case_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM cases WHERE id = case_participants.case_id AND created_by = auth.uid())
    );

-- Drop the problematic profiles policy
DROP POLICY IF EXISTS "Users can view profiles of case participants" ON profiles;

-- Create new profiles policy
CREATE POLICY "Users can view profiles of case participants" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM cases c
            JOIN case_participants cp ON c.id = cp.case_id
            WHERE (c.created_by = auth.uid() OR cp.user_id = auth.uid()) AND cp.user_id = profiles.id
        )
    );
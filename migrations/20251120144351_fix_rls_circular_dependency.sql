-- Fix circular dependency in RLS policies
-- Remove reference to cases from case_participants policy
-- Simplify profiles policy to allow viewing all profiles for authenticated users

-- Update case_participants SELECT policy to avoid recursion
DROP POLICY IF EXISTS "Users can view participants in cases they participate in" ON case_participants;
CREATE POLICY "Users can view participants in cases they participate in" ON case_participants
    FOR SELECT USING (user_id = auth.uid());

-- Simplify profiles SELECT policy to allow all authenticated users to view all profiles
-- This avoids complex joins that could cause performance issues
DROP POLICY IF EXISTS "Users can view profiles of case participants" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);
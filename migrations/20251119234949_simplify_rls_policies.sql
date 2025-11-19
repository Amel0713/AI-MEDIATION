-- Simplify RLS policies to improve performance
-- Allow all users to view profiles (since they contain public info like names)
-- Add indexes on columns used in RLS policies

-- Drop the complex profiles SELECT policy
DROP POLICY IF EXISTS "Users can view profiles of case participants" ON profiles;

-- Create simplified profiles SELECT policy allowing all users to view all profiles
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

-- Ensure other profiles policies remain secure
-- INSERT and UPDATE are already restricted to own profile

-- Add indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_case_participants_case_id ON case_participants(case_id);
CREATE INDEX IF NOT EXISTS idx_case_participants_user_id ON case_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
-- sql-lint-disable
-- language: postgresql
-- Fix profiles RLS policy to protect user privacy
-- Only allow users to view their own profile and profiles of case participants

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view their own profile and case participants" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM case_participants cp
            WHERE cp.user_id = auth.uid() AND
            EXISTS (
                SELECT 1 FROM case_participants cp2
                WHERE cp2.case_id = cp.case_id AND cp2.user_id = profiles.id
            )
        )
    );
-- sql-lint-disable
-- language: postgresql
-- Fix RLS policy for profiles to allow users to access their own profile
-- This resolves the loading issue by ensuring users can view their own profile

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
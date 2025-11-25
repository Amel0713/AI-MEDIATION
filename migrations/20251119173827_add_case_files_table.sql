-- sql-lint-disable
-- language: postgresql
-- Add case_files table for storing file references associated with cases

CREATE TABLE IF NOT EXISTS case_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase storage
    file_size BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on case_files table
ALTER TABLE IF EXISTS case_files ENABLE ROW LEVEL SECURITY;

-- Policies for case_files
DROP POLICY IF EXISTS "Users can view files in cases they participate in" ON case_files;
CREATE POLICY "Users can view files in cases they participate in" ON case_files
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_files.case_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert files in cases they participate in" ON case_files;
CREATE POLICY "Users can insert files in cases they participate in" ON case_files
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_files.case_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update files in cases they participate in" ON case_files;
CREATE POLICY "Users can update files in cases they participate in" ON case_files
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_files.case_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete files in cases they participate in" ON case_files;
CREATE POLICY "Users can delete files in cases they participate in" ON case_files
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM case_participants WHERE case_id = case_files.case_id AND user_id = auth.uid())
    );
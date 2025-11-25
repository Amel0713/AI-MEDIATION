-- sql-lint-disable
-- language: postgresql
-- Add index on cases.created_at for better query performance
-- This index supports the ORDER BY created_at DESC LIMIT 50 query in fetchCases
CREATE INDEX idx_cases_created_at_desc ON cases (created_at DESC);
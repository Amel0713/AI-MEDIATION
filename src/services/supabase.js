import { createClient } from '@supabase/supabase-js';

// Load Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase service: Initializing...');
console.log('Supabase service: URL present:', !!supabaseUrl);
console.log('Supabase service: Anon key present:', !!supabaseAnonKey);

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  console.error('Supabase service: Initialization failed:', error.message);
  throw error;
}

console.log('Supabase service: Creating client with URL:', supabaseUrl);

// Create and export Supabase client instance for database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase service: Client created successfully');
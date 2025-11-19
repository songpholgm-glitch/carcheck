import { createClient } from '@supabase/supabase-js';

// Use placeholders to prevent synchronous crash during module initialization
// if environment variables are missing in Vercel
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn("⚠️ Supabase URL or Key is missing! Database operations will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
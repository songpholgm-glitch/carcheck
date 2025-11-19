import { createClient } from '@supabase/supabase-js';

// Use placeholders to prevent synchronous crash during module initialization
// if environment variables are missing.
// Vite exposes env variables prefixed with VITE_ on import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
  console.warn("⚠️ Supabase URL or Key is missing! Database operations will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
import { createClient } from '@supabase/supabase-js';

// ใช้ process.env ตามที่เราตั้งค่า polyfill ไว้ใน vite.config.ts
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
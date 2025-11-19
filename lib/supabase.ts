import { createClient } from '@supabase/supabase-js';

// ใช้ process.env ตามที่เราตั้งค่า polyfill ไว้ใน vite.config.ts
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// ตรวจสอบว่ามีการตั้งค่า Environment Variables หรือไม่
// ถ้าเป็นค่าว่าง หรือเป็นค่า Default ที่เราตั้งไว้ใน vite config (ถ้ามี) หรือเป็น placeholder
export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' && 
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('your-project-url');

// สร้าง Client เสมอ แต่ถ้า Config ไม่ครบ มันจะ Connect ไม่ได้ (เราจะใช้ flag isSupabaseConfigured คุมการเรียกใช้แทน)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
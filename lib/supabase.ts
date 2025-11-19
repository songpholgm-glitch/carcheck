import { createClient } from '@supabase/supabase-js';

// ใช้ค่า Placeholder เพื่อป้องกันแอปพัง (Crash) ขณะโหลดครั้งแรกหากยังไม่ได้ตั้งค่า Env
// การทำงานจริงจะยังคง Error หากเชื่อมต่อไม่ได้ แต่หน้าจอจะไม่ขาว (White Screen)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
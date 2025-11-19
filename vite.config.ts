import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Shim process.env.API_KEY for Google GenAI SDK compatibility
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Note: VITE_SUPABASE_URL and VITE_SUPABASE_KEY are automatically 
      // exposed to import.meta.env by Vite because of the VITE_ prefix.
    }
  }
})
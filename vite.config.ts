import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Cast process to any to avoid TS error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the GenAI SDK to work on client-side
      // Note: This exposes the key to the browser. For production with high security needs,
      // calls should be proxied through a backend. For this demo/Vercel deployment, this works.
      // Fix: Ensure a string is passed to JSON.stringify even if API_KEY is undefined
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    server: {
      host: true // Expose to network
    }
  }
})
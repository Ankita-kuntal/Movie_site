import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🚨 FORCE REBUILD: Resume Project Fix 2026
  // This comment ensures Vercel rebuilds the app from scratch.
  server: {
    host: true,
  }
})
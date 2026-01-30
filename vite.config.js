import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🚨 FORCE DEPLOY: January 31, 2026 - FINAL FIX
  server: {
    host: true,
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🚨 FORCE REBUILD TIMESTAMP: 2026-02-01 (Update this if keys change)
  server: {
    host: true,
  }
})
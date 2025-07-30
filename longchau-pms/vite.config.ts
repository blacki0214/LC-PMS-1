import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180
  },
  // Ensure environment variables are properly loaded
  define: {
    // This helps with environment variable loading
  }
})

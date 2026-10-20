import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const api = process.env.API_TARGET ?? 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': api },
    watch: { ignored: ['**/shots/**'] },
  },
})

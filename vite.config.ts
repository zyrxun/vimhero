import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the built site works from any path (GitHub Pages, file servers)
export default defineConfig({
  plugins: [react()],
  base: './',
})

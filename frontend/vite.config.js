import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    // Raise warning threshold — chunks contain game assets
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      // navbar.js is a plain IIFE loaded separately — don't bundle it
      external: []
    }
  }
})


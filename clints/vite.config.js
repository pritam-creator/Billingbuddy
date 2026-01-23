import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ye line Vercel ke liye bilkul zaroori hai
  base: "/",
})
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',          // <-- Add this line for Netlify
  server: { port: 5173 },
  build: { outDir: 'dist' }
});

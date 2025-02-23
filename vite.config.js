import { defineConfig } from 'vite';
import { config } from 'dotenv';
import react from '@vitejs/plugin-react'

// Load environment variables from .env file
config();

export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],
});
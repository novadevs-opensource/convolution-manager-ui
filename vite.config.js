import { defineConfig } from 'vite';
import { config } from 'dotenv';
import react from '@vitejs/plugin-react'
import { version } from './package.json';

// Load environment variables from .env file
config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Provide browser implementations for Node.js modules
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      url: 'url',
    },
  },
  define: {
    // Required for Solana to work
    'process.env': process.env,
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(version)
  },
  optimizeDeps: {
    esbuildOptions: {
      // Solana requires Node.js to be available as a global
      define: {
        global: 'globalThis',
      },
    },
  },
});
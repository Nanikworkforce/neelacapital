import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for Vercel deployment
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/portal/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/media': {
            target: process.env.VITE_API_URL || 'http://127.0.0.1:8000',
            // target: process.env.VITE_API_URL || 'https://neela-backend-96ia.onrender.com',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/recharts')) return 'recharts';
              if (id.includes('node_modules/@google/genai')) return 'genai';
              if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'react-vendor';
              if (id.includes('node_modules/react/')) return 'react-vendor';
              if (id.includes('node_modules/lucide-react')) return 'icons';
            },
          },
        },
      },
    };
});

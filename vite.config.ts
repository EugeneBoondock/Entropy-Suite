import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env': {
        VITE_GEMINI_API_KEY: JSON.stringify(env.VITE_GEMINI_API_KEY),
        VITE_PEXELS_API_KEY: JSON.stringify(env.VITE_PEXELS_API_KEY)
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        overlay: false
      }
    },
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            vendor: ['@google/generative-ai']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['@google/generative-ai']
    }
  };
});

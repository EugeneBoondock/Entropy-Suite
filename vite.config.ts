import { fileURLToPath, URL } from 'url';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'onnxruntime-web': fileURLToPath(new URL('./src/empty-module.js', import.meta.url)),
        'onnxruntime-web/webgpu': fileURLToPath(new URL('./src/empty-module.js', import.meta.url)),
        'process': 'process/browser'
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        overlay: false
      },
      proxy: {
        '/api': 'http://localhost:4001',
      },
    },
    build: {
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        external: ['onnxruntime-web', 'onnxruntime-web/webgpu'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'react';
              if (id.includes('@google/generative-ai')) return 'google-genai';
              return 'vendor';
            }
          }
        }
      }
    },
    preview: {
      port: 5173,
      host: true
    },
    optimizeDeps: {
      include: [
        '@google/generative-ai',
        '@ffmpeg/ffmpeg',
        '@ffmpeg/core',
        'html-to-image'
      ],
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/core', 'onnxruntime-web', 'onnxruntime-web/webgpu', '@imgly/background-removal']
    },
    worker: {
      format: 'es'
    }
  };
});

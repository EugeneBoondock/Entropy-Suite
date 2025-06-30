import path from 'path';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

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
        'onnxruntime-web': path.resolve(__dirname, 'src/empty-module.js'),
        'onnxruntime-web/webgpu': path.resolve(__dirname, 'src/empty-module.js'),
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
      rollupOptions: {
        external: ['onnxruntime-web', 'onnxruntime-web/webgpu'],
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            vendor: ['@google/generative-ai']
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
      format: 'es',
      plugins: [
        nodePolyfills({
          protocolImports: true,
        }),
      ] as PluginOption[],
    }
  };
});

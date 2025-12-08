import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 12001,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: true,
    cors: true,
    hmr: {
      clientPort: 12001,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

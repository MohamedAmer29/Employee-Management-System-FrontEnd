import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('react-router-dom')) {
              return 'vendor-routing';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('@tanstack/react-query')) {
              return 'vendor-state';
            }
            if (id.includes('lucide-react') || id.includes('react-hook-form') || id.includes('react-toastify') || id.includes('react-otp-input')) {
              return 'vendor-ui';
            }
            if (id.includes('chart.js')) {
              return 'vendor-charts';
            }
            if (id.includes('axios') || id.includes('js-cookie') || id.includes('jwt-decode')) {
              return 'vendor-utils';
            }
            return 'vendor-misc';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
    ],
  },
});

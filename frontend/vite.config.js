import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': 'http://localhost:3000',
      '/batches': 'http://localhost:3000',
      '/audit-logs': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Todas as chamadas para /api serão redirecionadas
      '/api': {
        target: 'http://localhost:3000', // endereço do backend
        changeOrigin: true,
      },
    },
  },
});
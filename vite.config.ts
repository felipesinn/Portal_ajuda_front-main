// frontend/vite.config.ts - VERSÃO CORRIGIDA
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8085,
    // REMOVER configuração de proxy - deixar Nginx fazer o proxy
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     changeOrigin: true
    //   }
    // }
  },
  preview: {
    host: '0.0.0.0',
    port: 80
  }
})
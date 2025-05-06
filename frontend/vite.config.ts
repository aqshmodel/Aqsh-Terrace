// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5174, // または 5173
    proxy: {
      // シンプルな設定に戻す
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum/csrf-cookie': {
         target: 'http://localhost',
         changeOrigin: true,
         secure: false,
         // configure や selfHandleResponse は削除またはコメントアウト
      }
    }
  }
})
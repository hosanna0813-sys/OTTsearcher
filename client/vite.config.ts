import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 開發模式下把 /api 轉發給本機 Express（:3001），
// 前端程式碼永遠只呼叫相對路徑 /api，不直接接觸 TMDB。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});

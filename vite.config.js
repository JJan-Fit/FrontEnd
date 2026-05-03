import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정 — React 플러그인만 사용한 단순 SPA 구성
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 빌드 최적화 설정
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화 (선택사항)
    minify: 'esbuild', // 기본값, 더 빠른 빌드
  },
  // 환경 변수 접두사 (VITE_로 시작하는 변수만 클라이언트에 노출)
  envPrefix: 'VITE_',
})


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pand-erp-feedback/', // 這裡要跟您的 repo 名稱一樣
})
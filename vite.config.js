import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5000,
    host: true,
    proxy: {
      '/api': {
        // 2026-06-15 修复: vite 代理默认指向 3001（历史旧后端），但开发修改在 3002 跑
        // 用户浏览器 → vite dev(5002) → 此处 → 后端。如果此处写 3001，所有 /api 请求
        // 会被代理到**未修改的旧后端**，导致所有修复（schema/fieldMap/审批联动）看不到
        // 修复方法：与 V2.0 server/package.json dev 脚本一致，使用 3002
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  build: {
    // P1 #8 修复：主 chunk 1.5MB 超 500kB 警告。manualChunks 按业务域拆分，
    // 减小单个 chunk 体积并提升缓存命中率。V1.1 时期未做此优化是历史遗留。
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element-plus': ['element-plus', '@element-plus/icons-vue'],
          'vendor-echarts': ['echarts'],
          'vendor-utils': ['axios', 'dayjs']
        }
      }
    }
  }
})

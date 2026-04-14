import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    proxy: {
      '/wf-api': {
        target: 'http://119.36.242.222:8902',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wf-api/, ''),
      },
      '/tg-api': {
        target: 'http://119.36.242.222:19020',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tg-api/, ''),
      },
      '/demo-api': {
        target: 'http://127.0.0.1:38071',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/demo-api/, ''),
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    // 代码分包：将大型依赖拆分为独立 chunk，按需加载
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心（所有页面都需要，缓存后终身受益）
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Ant Design（大部分页面用到）
          'vendor-antd': ['antd', '@ant-design/icons'],
          // ECharts（图表页面才需要）
          'vendor-echarts': ['echarts', 'echarts-for-react'],
          // G6（仅产业图谱页需要）
          'vendor-g6': ['@antv/g6'],
          // MUI（仅大屏旧版3页需要）
          'vendor-mui': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
          // dayjs（轻量，但单独拆出利于缓存）
        },
      },
    },
    // 跳过 gzip 大小计算（加速 build）
    reportCompressedSize: false,
    // 提高警告阈值（分包后单个 chunk 不会超过）
    chunkSizeWarningLimit: 1500,
  },
})

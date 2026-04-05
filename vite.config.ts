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
})

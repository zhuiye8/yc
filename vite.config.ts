import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/wf-api': {
        target: 'http://119.36.242.222:8902',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wf-api/, ''),
      },
    },
  },
})

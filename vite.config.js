import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://10.10.50.2:6160',
        changeOrigin: true,
        ws: true, // 支持websocket
        configure: (proxy, options) => {
          // 配置SSE支持
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Connection', 'keep-alive')
          })
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 针对低配置设备优化
    minify: 'esbuild', // 使用esbuild压缩，更快
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts': ['echarts', 'vue-echarts']
        }
      }
    }
  }
})

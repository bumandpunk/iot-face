import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['chrome >= 49', 'android >= 5'], // 支持Android 5+
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://10.10.30.249:30345',
        changeOrigin: true,
        ws: true, // 支持websocket
        configure: (proxy, options) => {
          // 配置SSE支持
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Connection', 'keep-alive')
          })
        }
      },
      '/zt': {
        target: 'http://10.10.30.249:32547',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 针对老版本Android优化
    target: 'es2015', // 降低到ES2015，兼容老WebView
    minify: 'esbuild',
    cssTarget: 'chrome49', // 兼容Android 5.x WebView
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts': ['echarts', 'vue-echarts']
        }
      }
    }
  }
})

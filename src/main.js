import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 性能优化：禁用开发工具提示（生产环境）
if (import.meta.env.PROD) {
  app.config.performance = false
  app.config.devtools = false
}

app.mount('#app')

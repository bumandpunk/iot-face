import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 全局错误处理 - 防止闪退
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
  event.preventDefault() // 阻止默认错误处理
  return true
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  event.preventDefault()
})

const app = createApp(App)

// 全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  // 不让错误导致应用崩溃
}

// 性能优化：禁用开发工具提示（生产环境）
if (import.meta.env.PROD) {
  app.config.performance = false
  app.config.devtools = false
  app.config.warnHandler = () => {} // 禁用警告
}

app.mount('#app')

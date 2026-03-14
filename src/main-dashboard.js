import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
  event.preventDefault()
  return true
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  event.preventDefault()
})

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
}

if (import.meta.env.PROD) {
  app.config.performance = false
  app.config.devtools = false
  app.config.warnHandler = () => {}
}

app.mount('#app')

/**
 * 应用配置
 */
export const config = {
  // 后端API地址
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // SSE连接地址
  sseUrl: import.meta.env.VITE_SSE_URL || 'http://localhost:8080/api/sse/events',
  
  // 弹窗显示时长（毫秒）
  popupDuration: 3000,
  
  // 异常记录最大数量
  maxAlertCount: 10,
  
  // SSE重连间隔（毫秒）
  sseReconnectInterval: 5000
}

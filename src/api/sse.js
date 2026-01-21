/**
 * SSE连接管理器
 */
export class SSEManager {
  constructor(url) {
    this.url = url
    this.eventSource = null
    this.reconnectInterval = 5000
    this.listeners = new Map()
    this.isConnected = false
  }

  /**
   * 建立SSE连接
   */
  connect() {
    try {
      this.eventSource = new EventSource(this.url)
      
      this.eventSource.onopen = () => {
        console.log('SSE连接已建立')
        this.isConnected = true
        this.emit('connected', { status: 'connected' })
      }
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (err) {
          console.error('SSE消息解析失败:', err)
        }
      }
      
      this.eventSource.onerror = (error) => {
        console.error('SSE连接错误:', error)
        this.isConnected = false
        this.emit('error', { error })
        
        // 自动重连
        setTimeout(() => {
          console.log('尝试重新连接...')
          this.connect()
        }, this.reconnectInterval)
      }
    } catch (err) {
      console.error('创建SSE连接失败:', err)
    }
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(data) {
    const { type, payload } = data
    this.emit(type, payload)
    this.emit('message', data)
  }

  /**
   * 注册事件监听器
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return
    
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return
    
    const callbacks = this.listeners.get(event)
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (err) {
        console.error('事件回调执行失败:', err)
      }
    })
  }

  /**
   * 关闭连接
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      this.isConnected = false
      console.log('SSE连接已关闭')
    }
  }
}

/**
 * 创建SSE管理器实例
 */
export function createSSEManager(url) {
  return new SSEManager(url)
}

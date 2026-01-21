<template>
  <div class="dashboard-container">
    <!-- 头部标题栏 -->
    <header class="dashboard-header">
      <div class="network-status">
        <span class="status-dot" :class="{ active: isConnected }"></span>
        <span>捷租生态网络已覆盖</span>
      </div>
      <h1 class="title">3017门神域空间分析</h1>
      <div class="datetime">{{ currentTime }}</div>
    </header>

    <!-- 主内容区 -->
    <div class="dashboard-content">
      <!-- 左侧统计区域 -->
      <section class="stats-section">
        <h2 class="section-title">空间实时数据</h2>
        <div class="stats-grid">
          <!-- 出勤统计 -->
          <div class="stat-card">
            <div class="stat-label">今日 应到岗/实到岗 人数</div>
            <div class="stat-value-large">{{ stats.expectedCount }} / {{ stats.actualCount }}</div>
            <div class="stat-meta">
              到岗率 <span class="highlight">{{ stats.attendanceRate }}%</span> | 缺勤 <span class="warning">{{ stats.absent }}</span>人
            </div>
          </div>

          <!-- 空间使用率 -->
          <div class="stat-card">
            <div class="stat-label">今日空间使用率</div>
            <div class="stat-value-large highlight">{{ stats.spaceUsageRate }}%</div>
            <div class="stat-meta">
              较昨日 <span class="positive">+{{ stats.rateChange }}%</span> | 峰值 <span>{{ stats.peakRate }}%</span>
            </div>
            <div class="stat-note">PS：根据到岗人数/工位数计算</div>
          </div>

          <!-- 在域内人员 -->
          <div class="stat-card">
            <div class="stat-label">今日域内人员</div>
            <div class="stat-value-medium">{{ stats.currentInside }}</div>
            <div class="stat-chart-mini">
              <span class="chart-bar" v-for="(val, idx) in stats.insideHistory" :key="idx" :style="{ height: val + '%' }"></span>
            </div>
            <div class="stat-note">PS：域内人员：职工、拜访者、面试者等</div>
          </div>

          <!-- 进出总次数 -->
          <div class="stat-card">
            <div class="stat-label">今日进出总人次</div>
            <div class="stat-value-large">{{ stats.totalInOut }}</div>
            <div class="stat-meta">
              进入 <span class="positive">{{ stats.enterCount }}</span> | 离开 <span>{{ stats.exitCount }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧异常记录 -->
      <aside class="alert-section">
        <h2 class="section-title">异常警告记录</h2>
        <div class="alert-display">
          <div class="alert-item" v-for="alert in alerts" :key="alert.id">
            <span class="alert-time">{{ alert.time }}</span>
            <span class="alert-message" :class="alert.type">{{ alert.message }}</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- 底部流量图表 -->
    <section class="chart-section">
      <h2 class="section-title">全天域内流量分析</h2>
      <div class="chart-legend">
        <span class="legend-item"><i class="legend-dot orange"></i>在域人员</span>
        <span class="legend-item"><i class="legend-dot blue"></i>进入人员</span>
        <span class="legend-item"><i class="legend-dot green"></i>出去人员</span>
      </div>
      <FlowChart :chartData="flowData" />
    </section>

    <!-- 人员进出弹窗 -->
    <transition name="popup">
      <div class="person-popup" v-if="showPopup">
        <div class="popup-content" :class="popupData.type">
          <div class="popup-icon">
            <svg v-if="popupData.type === 'enter'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v18h-6M10 17l5-5-5-5M3 12h12"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H3V3h6M14 17l-5-5 5-5M21 12H9"/>
            </svg>
          </div>
          <h2 class="popup-title">{{ popupData.title }}</h2>
          <div class="popup-avatar">
            <img :src="popupData.avatar" alt="avatar" />
          </div>
          <p class="popup-name">{{ popupData.name }}</p>
          <p class="popup-info">{{ popupData.department }} · {{ popupData.position }}</p>
          <p class="popup-time">{{ popupData.time }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FlowChart from './components/FlowChart.vue'

// 时间显示
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

// 连接状态
const isConnected = ref(false)

// 统计数据
const stats = ref({
  expectedCount: 256,
  actualCount: 243,
  attendanceRate: 94.9,
  absent: 13,
  spaceUsageRate: 78.5,
  rateChange: 3.2,
  peakRate: 92,
  currentInside: 42,
  insideHistory: [60, 45, 55, 70, 50, 65, 48],
  totalInOut: 1842,
  enterCount: 923,
  exitCount: 919
})

// 异常记录
const alerts = ref([
  { id: 1, time: '18:26:25', message: '陈雯雅！违规警报！', type: 'danger' },
  { id: 2, time: '16:25:55', message: '张志鹏！验证警报！', type: 'warning' },
  { id: 3, time: '16:18:25', message: '陈雯雅！违规警报！', type: 'danger' },
  { id: 4, time: '15:23:52', message: '李志明！违规警报！', type: 'danger' },
  { id: 5, time: '14:56:25', message: '张三丰！验证警报！', type: 'warning' },
  { id: 6, time: '14:26:25', message: '李家明！违规警报！', type: 'danger' }
])

// 流量数据
const flowData = ref({
  times: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
  inside: [25, 35, 42, 38, 45, 40, 28],
  enter: [20, 25, 30, 28, 32, 30, 22],
  exit: [15, 18, 22, 25, 28, 35, 40]
})

// 弹窗数据
const showPopup = ref(false)
const popupData = ref({
  type: 'enter',
  title: '欢迎进入',
  avatar: '',
  name: '',
  department: '',
  position: '',
  time: ''
})

// SSE连接
let eventSource = null

const connectSSE = () => {
  // 开发环境使用代理，生产环境使用完整URL
  const sseUrl = import.meta.env.MODE === 'development' 
    ? '/api/sse/connect' 
    : import.meta.env.VITE_SSE_URL || 'http://10.10.50.2:6160/api/sse/connect'
  
  eventSource = new EventSource(sseUrl)
  
  eventSource.onopen = () => {
    console.log('SSE连接成功')
    isConnected.value = true
  }
  
  // 监听默认消息（没有指定事件类型的消息）
  eventSource.onmessage = (event) => {
    console.log('收到SSE消息（默认）:', event.data)
    try {
      const data = JSON.parse(event.data)
      handleSSEMessage(data)
    } catch (err) {
      console.error('SSE消息解析失败:', err)
    }
  }
  
  // 监听特定事件类型: dashboard-data
  eventSource.addEventListener('dashboard-data', (event) => {
    console.log('收到dashboard-data消息:', event.data)
    try {
      const data = JSON.parse(event.data)
      handleDashboardData(data)
    } catch (err) {
      console.error('dashboard-data消息解析失败:', err)
    }
  })
  
  eventSource.onerror = (error) => {
    console.error('SSE连接错误:', error)
    isConnected.value = false
    // 5秒后重连
    setTimeout(connectSSE, 5000)
  }
}

// 处理SSE消息
const handleSSEMessage = (data) => {
  switch (data.type) {
    case 'stats':
      // 更新统计数据
      Object.assign(stats.value, data.payload)
      break
    
    case 'person_enter':
    case 'person_exit':
      // 显示人员进出弹窗
      showPersonPopup(data)
      break
    
    case 'alert':
      // 添加异常警告
      alerts.value.unshift({
        id: Date.now(),
        time: data.payload.time,
        message: data.payload.message,
        type: data.payload.level
      })
      // 保持最多10条记录
      if (alerts.value.length > 10) {
        alerts.value.pop()
      }
      break
    
    case 'flow_data':
      // 更新流量数据
      flowData.value = data.payload
      break
  }
}

// 处理dashboard-data消息
const handleDashboardData = (data) => {
  console.log('处理dashboard数据:', data)
  
  // 更新统计数据
  if (data.metrics) {
    const metrics = data.metrics
    stats.value = {
      expectedCount: metrics.totalUsers || 256,
      actualCount: metrics.activeUsers || 243,
      attendanceRate: metrics.activeUsers && metrics.totalUsers 
        ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) 
        : 94.9,
      absent: (metrics.totalUsers || 256) - (metrics.activeUsers || 243),
      spaceUsageRate: 78.5,
      rateChange: 3.2,
      peakRate: 92,
      currentInside: metrics.onlineUsers || 42,
      insideHistory: stats.value.insideHistory,
      totalInOut: 1842,
      enterCount: 923,
      exitCount: 919
    }
  }
  
  // 如果有时间戳，可以用来更新其他显示
  if (data.timestamp) {
    console.log('数据时间戳:', new Date(data.timestamp))
  }
}

// 显示人员进出弹窗
const showPersonPopup = (data) => {
  popupData.value = {
    type: data.type === 'person_enter' ? 'enter' : 'exit',
    title: data.type === 'person_enter' ? '欢迎进入' : '再见',
    avatar: data.payload.avatar || 'https://via.placeholder.com/120',
    name: data.payload.name,
    department: data.payload.department,
    position: data.payload.position,
    time: data.payload.time
  }
  
  showPopup.value = true
  
  // 3秒后自动关闭
  setTimeout(() => {
    showPopup.value = false
  }, 3000)
}

// 生命周期
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  connectSSE()
  
  // 阻止屏幕休眠（适用于电视）
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen').then(() => {
      console.log('屏幕保持常亮')
    }).catch(err => {
      console.warn('无法保持屏幕常亮:', err)
    })
  }
  
  // 禁用右键菜单（电视环境）
  document.addEventListener('contextmenu', (e) => e.preventDefault())
  
  // 性能监控（仅开发环境）
  if (import.meta.env.DEV) {
    console.log('应用已启动，当前环境：', import.meta.env.MODE)
  }
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.network-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  position: relative;
}

.status-dot.active {
  background: #52c41a;
}

.status-dot.active::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #52c41a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0;
    transform: scale(1.8);
  }
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 2px;
}

.datetime {
  font-size: 14px;
  color: #666;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

/* 主内容区 */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

/* 统计区域 */
.stats-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-card {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 10px;
  border: 2px solid #e1e8ed;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value-large {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 10px 0;
}

.stat-value-medium {
  font-size: 48px;
  font-weight: 700;
  color: #667eea;
  margin: 15px 0;
  text-align: center;
}

.stat-meta {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
}

.stat-note {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.highlight {
  color: #667eea;
  font-weight: 600;
}

.warning {
  color: #ff4d4f;
  font-weight: 600;
}

.positive {
  color: #52c41a;
  font-weight: 600;
}

/* 迷你图表 */
.stat-chart-mini {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 40px;
  margin: 15px 0;
  gap: 4px;
}

.chart-bar {
  flex: 1;
  background: #667eea;
  border-radius: 2px;
  min-height: 5px;
}

/* 异常记录 */
.alert-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.alert-display {
  flex: 1;
  background: #1a1a2e;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  margin-bottom: 5px;
}

.alert-time {
  color: #52c41a;
  white-space: nowrap;
}

.alert-message {
  color: #fff;
}

.alert-message.danger {
  color: #ff4d4f;
}

.alert-message.warning {
  color: #faad14;
}

/* 图表区域 */
.chart-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 300px;
}

.chart-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  font-size: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.orange {
  background: #ff7f50;
}

.legend-dot.blue {
  background: #4a90e2;
}

.legend-dot.green {
  background: #52c41a;
}

/* 弹窗 */
.person-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  min-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.popup-content.enter {
  border-top: 5px solid #52c41a;
}

.popup-content.exit {
  border-top: 5px solid #1890ff;
}

.popup-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  color: #667eea;
}

.popup-icon svg {
  width: 100%;
  height: 100%;
}

.popup-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.popup-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #667eea;
}

.popup-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-name {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.popup-info {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.popup-time {
  font-size: 14px;
  color: #999;
}

/* 弹窗动画 */
.popup-enter-active, .popup-leave-active {
  transition: all 0.3s ease;
}

.popup-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.popup-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}
</style>

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
  // 检查浏览器是否支持 EventSource
  if (typeof EventSource === 'undefined') {
    console.warn('浏览器不支持 EventSource，将使用模拟数据')
    isConnected.value = false
    // 使用定时器模拟数据更新
    startMockDataUpdate()
    return
  }

  try {
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
  } catch (err) {
    console.error('EventSource 初始化失败:', err)
    isConnected.value = false
    startMockDataUpdate()
  }
}

// 模拟数据更新（用于不支持 EventSource 的浏览器）
const startMockDataUpdate = () => {
  setInterval(() => {
    // 随机更新一些数据，模拟实时效果
    stats.value.currentInside = Math.floor(Math.random() * 20) + 30
    stats.value.todayIn = Math.floor(Math.random() * 10) + stats.value.todayIn
    stats.value.todayOut = Math.floor(Math.random() * 10) + stats.value.todayOut
  }, 10000) // 每10秒更新一次
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
  width: 100vw;
  height: 100vh;
  padding: 1vh 1vw;
  display: flex;
  flex-direction: column;
  gap: 1vh;
  overflow: hidden;
  box-sizing: border-box;
}

/* 头部 - 固定高度 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 1.5vw;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.5vh;
  box-shadow: 0 0.2vh 0.8vh rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  height: 6vh;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 0.5vw;
  font-size: 1.2vh;
  color: #666;
}

.status-dot {
  width: 0.8vh;
  height: 0.8vh;
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
  font-size: 2.2vh;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.1vw;
}

.datetime {
  font-size: 1.2vh;
  color: #666;
  padding: 0.6vh 1vw;
  background: #f5f5f5;
  border-radius: 0.4vh;
}

/* 主内容区 - 占据剩余空间 */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1vw;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  max-height: calc(100vh - 32vh); /* 头部6vh + 图表24vh + 间距2vh */
}

.section-title {
  font-size: 1.6vh;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1vh;
  padding-bottom: 0.6vh;
  border-bottom: 0.2vh solid #667eea;
  flex-shrink: 0;
}

/* 统计区域 */
.stats-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5vh 1vw;
  border-radius: 0.8vh;
  box-shadow: 0 0.2vh 0.8vh rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1vw;
  flex: 1;
}

.stat-card {
  padding: 1.2vh 1vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 0.8vh;
  border: 0.2vh solid #e1e8ed;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 1.2vh;
  color: #666;
  margin-bottom: 0.6vh;
  flex-shrink: 0;
}

.stat-value-large {
  font-size: 2.8vh;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0.6vh 0;
  flex-shrink: 0;
}

.stat-value-medium {
  font-size: 3.6vh;
  font-weight: 700;
  color: #667eea;
  margin: 1vh 0;
  text-align: center;
  flex-shrink: 0;
}

.stat-meta {
  font-size: 1.1vh;
  color: #666;
  margin-top: 0.6vh;
  flex-shrink: 0;
}

.stat-note {
  font-size: 1vh;
  color: #999;
  margin-top: 0.4vh;
  flex-shrink: 0;
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
  height: 3vh;
  margin: 1vh 0;
  gap: 0.2vw;
  flex-shrink: 0;
}

.chart-bar {
  flex: 1;
  background: #667eea;
  border-radius: 0.2vh;
  min-height: 0.5vh;
}

/* 异常记录 */
.alert-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5vh 1vw;
  border-radius: 0.8vh;
  box-shadow: 0 0.2vh 0.8vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.alert-display {
  flex: 1;
  background: #1a1a2e;
  border-radius: 0.6vh;
  padding: 1vh;
  overflow-y: auto;
  min-height: 0;
}

.alert-item {
  display: flex;
  gap: 0.8vw;
  padding: 0.6vh;
  font-size: 1.2vh;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.4vh;
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

/* 图表区域 - 固定高度 */
.chart-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5vh 1vw;
  border-radius: 0.8vh;
  box-shadow: 0 0.2vh 0.8vh rgba(0, 0, 0, 0.1);
  height: 22vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-legend {
  display: flex;
  gap: 1.5vw;
  margin-bottom: 0.8vh;
  font-size: 1.2vh;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5vw;
}

.legend-dot {
  width: 1vh;
  height: 1vh;
  border-radius: 50%;
  flex-shrink: 0;
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
  padding: 3.5vh 3vw;
  border-radius: 1.5vh;
  text-align: center;
  min-width: 30vw;
  box-shadow: 0 0.8vh 3vh rgba(0, 0, 0, 0.3);
  position: relative;
}

.popup-content.enter {
  border-top: 0.4vh solid #52c41a;
}

.popup-content.exit {
  border-top: 0.4vh solid #1890ff;
}

.popup-icon {
  width: 5vh;
  height: 5vh;
  margin: 0 auto 1.5vh;
  color: #667eea;
}

.popup-icon svg {
  width: 100%;
  height: 100%;
}

.popup-title {
  font-size: 2.4vh;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5vh;
}

.popup-avatar {
  width: 10vh;
  height: 10vh;
  margin: 0 auto 1.5vh;
  border-radius: 50%;
  overflow: hidden;
  border: 0.3vh solid #667eea;
}

.popup-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-name {
  font-size: 2vh;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.8vh;
}

.popup-info {
  font-size: 1.4vh;
  color: #666;
  margin-bottom: 1.2vh;
}

.popup-time {
  font-size: 1.2vh;
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
  width: 0.4vw;
  height: 0.4vh;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.2vw;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 0.2vw;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}
</style>

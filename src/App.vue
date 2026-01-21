<template>
  <div class="dashboard-container">
    <!-- 头部标题栏 -->
    <header class="dashboard-header">
      <div class="network-status">
        <span class="status-dot" :class="{ active: isConnected }"></span>
        <span>捷租生态网络已覆盖</span>
      </div>
      <div class="title-wrapper">
        <div class="title-decoration left"></div>
        <h1 class="title">3107门神域空间分析</h1>
        <div class="title-decoration right"></div>
      </div>
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

      <!-- 右侧异常告警记录 -->
      <aside class="alert-section">
        <h2 class="section-title">异常告警记录</h2>
        <div class="alert-table">
          <div class="alert-table-header">
            <div class="alert-col col-index">排序</div>
            <div class="alert-col col-time">告警时间</div>
            <div class="alert-col col-level">信息等级</div>
            <div class="alert-col col-detail">信息详情</div>
          </div>
          <div class="alert-table-body">
            <div class="alert-table-row" v-for="(alert, index) in alerts" :key="alert.id">
              <div class="alert-col col-index">{{ index + 1 }}</div>
              <div class="alert-col col-time">{{ alert.time }}</div>
              <div class="alert-col col-level">
                <span class="level-badge" :class="alert.type">{{ alert.level }}</span>
              </div>
              <div class="alert-col col-detail">{{ alert.message }}</div>
            </div>
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
        <!-- 装饰角 -->
        <div class="popup-corner corner-top-left"></div>
        <div class="popup-corner corner-top-right"></div>
        <div class="popup-corner corner-bottom-left"></div>
        <div class="popup-corner corner-bottom-right"></div>
        
        <div class="popup-content" :class="popupData.type">
          <!-- 头像区域 -->
          <div class="popup-avatar-wrapper">
            <div class="popup-avatar-border"></div>
            <div class="popup-avatar">
              <img :src="popupData.avatar" alt="avatar" />
            </div>
          </div>
          
          <!-- 欢迎信息 -->
          <div class="popup-welcome">
            <span class="popup-name">{{ popupData.name }}，</span>
            <span class="popup-action">{{ popupData.type === 'enter' ? '欢迎进入' : '再见' }}</span>
            <span class="popup-location">{{ popupData.location || '策维3107神域' }}</span>
          </div>
          
          <!-- 底部信息 -->
          <div class="popup-footer">
            <div class="popup-footer-item">
              <span class="popup-footer-label">签到时间：</span>
              <span class="popup-footer-value">{{ popupData.time }}</span>
            </div>
            <div class="popup-footer-item">
              <span class="popup-footer-label">今日进出次数：</span>
              <span class="popup-footer-value">{{ popupData.todayCount || 30 }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FlowChart from './components/FlowChart.vue'

// 常量配置
const MAX_ALERTS = 15 // 最大异常记录数
const MAX_FLOW_POINTS = 24 // 最大流量数据点数（24小时）
const MAX_HISTORY_BARS = 10 // 最大历史柱状图数量
const POPUP_AUTO_CLOSE_TIME = 3000 // 弹窗自动关闭时间(ms)

// 定时器引用（用于清理）
let timeUpdateTimer = null
let popupTimer = null

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
  { id: 1, time: '2026-01-21 14:02:43', level: '1/2/3', message: '门口监控1', type: 'warning' },
  { id: 2, time: '2026-01-21 14:02:43', level: '1/2/3', message: '门口监控1', type: 'warning' },
  { id: 3, time: '2026-01-21 14:02:43', level: '1/2/3', message: '门口监控1', type: 'warning' },
  { id: 4, time: '2026-01-21 14:02:43', level: '1/2/3', message: '门口监控1', type: 'warning' },
  { id: 5, time: '2026-01-21 14:02:43', level: '1/2/3', message: '门口监控1', type: 'warning' }
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
  avatar: '',
  name: '',
  location: '策维3107神域',
  time: '',
  todayCount: 0
})

// SSE连接
let eventSource = null
let reconnectTimer = null

const connectSSE = () => {
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
    
    // 监听服务端推送的数据（10秒心跳 + 完整数据）
    // 服务端应该每10秒推送一次，包含 dashboard 和 popup 的完整数据
    eventSource.addEventListener('dashboard-data-popup', (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('收到数据推送:', data.type || 'heartbeat')
        
        // 处理心跳消息
        if (data.type === 'heartbeat') {
          isConnected.value = true
          return
        }
        
        // 处理完整数据推送
        if (data.type === 'data') {
          // 一次性处理 dashboard 和 popup 数据
          if (data.dashboard) {
            handleDashboardData(data.dashboard)
          }
          if (data.popup ) {
            showPersonPopup(data.popup)
          }
        }
      } catch (err) {
        console.error('SSE消息解析失败:', err)
      }
    })
    
    eventSource.onerror = (error) => {
      console.error('SSE连接错误:', error)
      isConnected.value = false
      
      // 清理旧的重连定时器
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      
      // 5秒后重连
      reconnectTimer = setTimeout(() => {
        console.log('尝试重新连接SSE...')
        connectSSE()
      }, 5000)
    }
  } catch (err) {
    console.error('EventSource 初始化失败:', err)
    isConnected.value = false
  }
}

// 处理看板数据更新
const handleDashboardData = (dashboard) => {
  console.log('更新看板数据')
  
  // 更新统计数据（直接替换，不累积）
  if (dashboard.stats) {
    // 限制 insideHistory 数组大小
    if (dashboard.stats.insideHistory && dashboard.stats.insideHistory.length > MAX_HISTORY_BARS) {
      dashboard.stats.insideHistory = dashboard.stats.insideHistory.slice(-MAX_HISTORY_BARS)
    }
    Object.assign(stats.value, dashboard.stats)
  }
  
  // 更新异常告警（严格限制数组大小）
  if (dashboard.alerts && Array.isArray(dashboard.alerts)) {
    // 只保留最新的 MAX_ALERTS 条记录
    const newAlerts = dashboard.alerts.slice(0, MAX_ALERTS).map((alert, index) => ({
      id: alert.id || Date.now() + index,
      time: alert.time || new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      }).replace(/\//g, '-'),
      level: alert.level || '1/2/3',
      message: alert.message || alert.detail || '',
      type: alert.type || 'warning'
    }))
    alerts.value = newAlerts
  }
  
  // 更新流量数据（限制数据点数量）
  if (dashboard.flowData) {
    const flowDataCopy = { ...dashboard.flowData }
    
    // 限制每个数组的长度
    if (flowDataCopy.times && flowDataCopy.times.length > MAX_FLOW_POINTS) {
      flowDataCopy.times = flowDataCopy.times.slice(-MAX_FLOW_POINTS)
    }
    if (flowDataCopy.inside && flowDataCopy.inside.length > MAX_FLOW_POINTS) {
      flowDataCopy.inside = flowDataCopy.inside.slice(-MAX_FLOW_POINTS)
    }
    if (flowDataCopy.enter && flowDataCopy.enter.length > MAX_FLOW_POINTS) {
      flowDataCopy.enter = flowDataCopy.enter.slice(-MAX_FLOW_POINTS)
    }
    if (flowDataCopy.exit && flowDataCopy.exit.length > MAX_FLOW_POINTS) {
      flowDataCopy.exit = flowDataCopy.exit.slice(-MAX_FLOW_POINTS)
    }
    
    flowData.value = flowDataCopy
  }
}

// 显示人员进出弹窗
const showPersonPopup = (popup) => {
  // 清理之前的定时器
  if (popupTimer) {
    clearTimeout(popupTimer)
    popupTimer = null
  }
  
  const actionType = popup.action || 'enter'
  
  popupData.value = {
    type: actionType === 'enter' ? 'enter' : 'exit',
    avatar: popup.avatar || 'https://via.placeholder.com/240',
    name: popup.name || '访客',
    location: popup.location || '策维3107神域',
    time: popup.time || new Date().toLocaleTimeString(),
    todayCount: popup.todayCount || 0
  }
  
  showPopup.value = true
  
  // 自动关闭弹窗
  popupTimer = setTimeout(() => {
    showPopup.value = false
    popupTimer = null
  }, POPUP_AUTO_CLOSE_TIME)
}

// 生命周期
onMounted(() => {
  // 启动时间更新定时器
  updateTime()
  timeUpdateTimer = setInterval(updateTime, 1000)
  
  // 连接SSE
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
  
  // 内存监控（开发环境）
  if (import.meta.env.DEV && performance.memory) {
    const logMemory = () => {
      console.log('内存使用:', {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB',
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + 'MB'
      })
    }
    
    // 立即输出一次
    logMemory()
    
    // 每5分钟输出一次内存使用情况
    setInterval(logMemory, 5 * 60 * 1000)
  }
  
  console.log('应用已启动，当前环境：', import.meta.env.MODE)
})

onUnmounted(() => {
  // 清理时间定时器
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer)
    timeUpdateTimer = null
  }
  
  // 清理弹窗定时器
  if (popupTimer) {
    clearTimeout(popupTimer)
    popupTimer = null
  }
  
  // 清理重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  
  // 关闭SSE连接
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  
  console.log('应用已清理所有资源')
})
</script>

<style scoped>
.dashboard-container {
  width: 100vw;
  height: 100vh;
  padding: 1.5vh 1.5vw;
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  overflow: hidden;
  box-sizing: border-box;
}

/* 头部 - 固定高度 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5vh 2vw;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1vh;
  box-shadow: 0 0.3vh 1vh rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  height: 7vh;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 0.8vw;
  font-size: 1.8vh;
  color: #666;
}

.status-dot {
  width: 1.2vh;
  height: 1.2vh;
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

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 2vw;
  flex: 1;
  justify-content: center;
}

.title-decoration {
  width: 15vw;
  height: 0.3vh;
  background: linear-gradient(90deg, transparent, #4a90e2, transparent);
  position: relative;
}

.title-decoration::before,
.title-decoration::after {
  content: '';
  position: absolute;
  width: 1vh;
  height: 1vh;
  background: #4a90e2;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.title-decoration.left::before {
  left: 0;
}

.title-decoration.left::after {
  right: 0;
}

.title-decoration.right::before {
  left: 0;
}

.title-decoration.right::after {
  right: 0;
}

.title {
  font-size: 3vh;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.3vw;
  white-space: nowrap;
  text-shadow: 0 0.2vh 0.5vh rgba(74, 144, 226, 0.3);
}

.datetime {
  font-size: 1.8vh;
  color: #666;
  padding: 0.8vh 1.2vw;
  background: #f5f5f5;
  border-radius: 0.6vh;
}

/* 主内容区 - 占据剩余空间 */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5vw;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  max-height: calc(100vh - 36vh); /* 头部7vh + 图表27vh + 间距2vh */
}

.section-title {
  font-size: 2.2vh;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5vh;
  padding-bottom: 0.8vh;
  border-bottom: 0.3vh solid #667eea;
  flex-shrink: 0;
}

/* 统计区域 */
.stats-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 2vh 1.5vw;
  border-radius: 1.2vh;
  box-shadow: 0 0.3vh 1vh rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5vw 1.2vw;
  flex: 1;
}

.stat-card {
  padding: 2vh 1.5vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 1.2vh;
  border: 0.3vh solid #e1e8ed;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 1.8vh;
  color: #666;
  margin-bottom: 1vh;
  flex-shrink: 0;
}

.stat-value-large {
  font-size: 4.5vh;
  font-weight: 700;
  color: #1a1a1a;
  margin: 1vh 0;
  flex-shrink: 0;
  line-height: 1.2;
}

.stat-value-medium {
  font-size: 6vh;
  font-weight: 700;
  color: #667eea;
  margin: 1.5vh 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.stat-meta {
  font-size: 1.6vh;
  color: #666;
  margin-top: 1vh;
  flex-shrink: 0;
}

.stat-note {
  font-size: 1.4vh;
  color: #999;
  margin-top: 0.6vh;
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
  height: 4vh;
  margin: 1.2vh 0;
  gap: 0.3vw;
  flex-shrink: 0;
}

.chart-bar {
  flex: 1;
  background: #667eea;
  border-radius: 0.3vh;
  min-height: 0.6vh;
}

/* 异常记录 */
.alert-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 2vh 1.5vw;
  border-radius: 1.2vh;
  box-shadow: 0 0.3vh 1vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 异常告警表格 */
.alert-table {
  flex: 1;
  background: #fff;
  border-radius: 1vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 0.1vh solid #e8e8e8;
}

.alert-table-header {
  display: flex;
  background: #f5f7fa;
  padding: 1.2vh 0;
  font-size: 1.6vh;
  font-weight: 600;
  color: #666;
  border-bottom: 0.2vh solid #e8e8e8;
}

.alert-table-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.alert-table-row {
  display: flex;
  padding: 1vh 0;
  font-size: 1.5vh;
  color: #333;
  border-bottom: 0.1vh solid #f0f0f0;
  transition: background 0.2s;
}

.alert-table-row:hover {
  background: #f9f9f9;
}

.alert-table-row:last-child {
  border-bottom: none;
}

.alert-col {
  padding: 0 1vw;
  display: flex;
  align-items: center;
}

.col-index {
  width: 10%;
  justify-content: center;
  color: #999;
}

.col-time {
  width: 35%;
  color: #666;
}

.col-level {
  width: 20%;
  justify-content: center;
}

.col-detail {
  width: 35%;
  color: #333;
}

.level-badge {
  padding: 0.4vh 1vw;
  border-radius: 0.4vh;
  font-size: 1.4vh;
  font-weight: 500;
}

.level-badge.warning {
  background: #fff7e6;
  color: #fa8c16;
  border: 0.1vh solid #ffd591;
}

.level-badge.danger {
  background: #fff1f0;
  color: #ff4d4f;
  border: 0.1vh solid #ffccc7;
}

.level-badge.info {
  background: #e6f7ff;
  color: #1890ff;
  border: 0.1vh solid #91d5ff;
}

/* 图表区域 - 固定高度 */
.chart-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 2vh 1.5vw;
  border-radius: 1.2vh;
  box-shadow: 0 0.3vh 1vh rgba(0, 0, 0, 0.1);
  height: 27vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-legend {
  display: flex;
  gap: 2vw;
  margin-bottom: 1.2vh;
  font-size: 1.8vh;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.8vw;
}

.legend-dot {
  width: 1.4vh;
  height: 1.4vh;
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
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 装饰角 */
.popup-corner {
  position: absolute;
  width: 8vh;
  height: 8vh;
  border: 0.5vh solid #4a90e2;
  z-index: 1001;
}

.corner-top-left {
  top: 15vh;
  left: 25vw;
  border-right: none;
  border-bottom: none;
}

.corner-top-right {
  top: 15vh;
  right: 25vw;
  border-left: none;
  border-bottom: none;
}

.corner-bottom-left {
  bottom: 15vh;
  left: 25vw;
  border-right: none;
  border-top: none;
}

.corner-bottom-right {
  bottom: 15vh;
  right: 25vw;
  border-left: none;
  border-top: none;
}

.popup-content {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  padding: 5vh 6vw;
  border-radius: 1.5vh;
  text-align: center;
  min-width: 45vw;
  max-width: 50vw;
  box-shadow: 0 2vh 6vh rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 1002;
}

/* 头像区域 */
.popup-avatar-wrapper {
  position: relative;
  width: 24vh;
  height: 24vh;
  margin: 0 auto 3vh;
}

.popup-avatar-border {
  position: absolute;
  top: -1vh;
  left: -1vh;
  right: -1vh;
  bottom: -1vh;
  border: 0.5vh solid #4a90e2;
  border-radius: 0.8vh;
  animation: borderPulse 2s infinite;
}

@keyframes borderPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

.popup-avatar {
  width: 100%;
  height: 100%;
  border-radius: 0.6vh;
  overflow: hidden;
  background: #000;
  box-shadow: 0 0.5vh 2vh rgba(0, 0, 0, 0.3);
}

.popup-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 欢迎信息 */
.popup-welcome {
  font-size: 3.5vh;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 3vh;
  line-height: 1.6;
}

.popup-name {
  color: #1a1a1a;
}

.popup-action {
  color: #1a1a1a;
}

.popup-location {
  color: #4a90e2;
  font-weight: 700;
}

/* 底部信息 */
.popup-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2vh;
  border-top: 0.2vh solid rgba(0, 0, 0, 0.1);
}

.popup-footer-item {
  display: flex;
  align-items: center;
  gap: 1vw;
}

.popup-footer-label {
  font-size: 1.8vh;
  color: #999;
}

.popup-footer-value {
  font-size: 2.2vh;
  font-weight: 600;
  color: #4a90e2;
}

/* 进入和退出的不同样式 */
.popup-content.enter .popup-avatar-border {
  border-color: #4a90e2;
}

.popup-content.exit .popup-avatar-border {
  border-color: #ff6b6b;
}

.popup-content.exit .popup-location {
  color: #ff6b6b;
}

.popup-content.exit .popup-footer-value {
  color: #ff6b6b;
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
  width: 0.6vw;
  height: 0.6vh;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.3vw;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 0.3vw;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}
</style>

<template>
  <div class="kitchen-board">
    <!-- 头部 -->
    <header class="board-header">
      <div class="header-left">
        <img src="./assets/images/logo-network.png" alt="logo" class="logo" />
        <span class="status-dot" :class="{ active: isConnected }"></span>
        <span class="network-text">捷租生态网络已覆盖</span>
      </div>
    
      <div class="header-right">{{ currentTime }}</div>
    </header>

    <!-- 统计卡片区 -->
    <section class="stats-section">
      <!-- 应到岗/实到岗 -->
      <div class="stat-card">
        <div class="card-icon">
          <img src="./assets/images/icon-attendance.png" alt="" />
        </div>
        <div class="card-body">
          <div class="card-label">今日 应到岗/实到岗 人数</div>
          <div class="card-value">
            {{ stats.scheduledCount }} / <span class="value-green">{{ stats.actualCount }}</span>
          </div>
          <div class="card-meta">迟到人数：<span class="text-red">{{ stats.absentCount }}</span></div>
        </div>
      </div>

      <!-- 出勤率 -->
      <div class="stat-card">
        <div class="card-icon">
          <img src="./assets/images/icon-space.png" alt="" />
        </div>
        <div class="card-body">
          <div class="card-label">今日出勤率</div>
          <div class="card-note">说明:根据实到岗人数/应到岗人数计算</div>
          <div class="card-value">{{ stats.attendanceRate }}<span class="unit">%</span></div>
          <div class="card-meta">
            较昨日：<span class="text-gold">{{ stats.yesterdayChange }}%</span>
            <span class="meta-right">缺勤：<span class="text-red">{{ stats.absentCount }}</span></span>
          </div>
        </div>
      </div>

      <!-- 最新签到人员 -->
      <div class="welcome-card">
        <div class="welcome-avatar">
          <img
            :src="latestPerson.avatar || '/default-avatar.png'"
            alt="avatar"
            @error="(e) => e.target.src = '/default-avatar.png'"
          />
        </div>
        <div class="welcome-body">
          <div class="welcome-name">
            {{ latestPerson.name || 'XXX' }}，欢迎进入<span class="text-gold">{{ latestPerson.location || '锦绣华城厨房神域' }}</span>
          </div>
          <div class="welcome-time">签到时间：{{ latestPerson.time || '--:--:--' }}</div>
        </div>
      </div>
    </section>

    <!-- 任务展示区 -->
    <section class="task-section">
      <h2 class="section-title">
        <span class="title-arrow">▶</span> 今日任务展示
      </h2>

      <div class="task-board">
        <!-- 已完成 -->
        <div class="task-column">
          <div class="column-header completed">
            <span class="col-icon">✓</span> 已完成
          </div>
          <div class="task-list">
            <div class="task-item" v-for="task in completedTasks" :key="task.id">
              <div class="task-top">
                <span class="task-name">{{ task.taskName }}</span>
                <span class="task-time">{{ task.timeRange }}</span>
              </div>
              <div class="task-desc">{{ task.description }}</div>
            </div>
            <div class="task-empty" v-if="completedTasks.length === 0">暂无已完成任务</div>
          </div>
        </div>

        <!-- 进行中 -->
        <div class="task-column">
          <div class="column-header in-progress">
            <span class="col-icon">◉</span> 进行中
          </div>
          <div class="task-list">
            <div class="task-item" v-for="task in inProgressTasks" :key="task.id">
              <div class="task-top">
                <span class="task-name">{{ task.taskName }}</span>
                <span class="task-time">{{ task.timeRange }}</span>
              </div>
              <div class="task-desc">{{ task.description }}</div>
            </div>
            <div class="task-empty" v-if="inProgressTasks.length === 0">暂无进行中任务</div>
          </div>
        </div>

        <!-- 待开始 -->
        <div class="task-column">
          <div class="column-header pending">
            <span class="col-icon">○</span> 待开始
          </div>
          <div class="task-list">
            <div class="task-item" v-for="task in pendingTasks" :key="task.id">
              <div class="task-top">
                <span class="task-name">{{ task.taskName }}</span>
                <span class="task-time">{{ task.timeRange }}</span>
              </div>
              <div class="task-desc">{{ task.description }}</div>
            </div>
            <div class="task-empty" v-if="pendingTasks.length === 0">暂无待开始任务</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// 常量（与 App.vue 保持一致）
const MAX_RECONNECT_ATTEMPTS = 10
const INITIAL_RECONNECT_DELAY = 5000
const MAX_RECONNECT_DELAY = 60000
const HEARTBEAT_TIMEOUT = 9000
const POPUP_AUTO_CLOSE_TIME = 10000 // 签到信息展示10秒

const log = console.log.bind(console)
const warn = console.warn.bind(console)
const error = console.error.bind(console)

// 定时器
let timeUpdateTimer = null
let wakeLock = null
let reconnectAttempts = 0
let reconnectDelay = INITIAL_RECONNECT_DELAY
let heartbeatTimer = null
let eventSource = null
let reconnectTimer = null

// 时间
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

// 连接状态
const isConnected = ref(false)

// 统计数据（字段与后端返回一致）
const stats = ref({
  scheduledCount: 0,
  actualCount: 0,
  attendanceRate: 0,
  absentCount: 0,
  yesterdayChange: 0
})

// 最新签到人员（来自 popup 数据）
const latestPerson = ref({
  avatar: '',
  name: '',
  location: '锦绣华城厨房神域',
  time: ''
})

// 任务列表（来自 popup.task 数据，按 status 分类）
const allTasks = ref([])

// 按状态分类任务
// status: 0=待开始 1=进行中 2=已完成（根据实际后端调整）
const completedTasks = computed(() => allTasks.value.filter(t => t.status === 2 || t.status === 'done'))
const inProgressTasks = computed(() => allTasks.value.filter(t => t.status === 1 || t.status === 'doing'))
const pendingTasks = computed(() => allTasks.value.filter(t => t.status === 0 || t.status === 'todo'))

// 格式化时间
const dateFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
const formatDateTime = (timestamp) => {
  const date = timestamp ? new Date(timestamp * 1000) : new Date()
  return date.toLocaleString('zh-CN', dateFormatOptions).replace(/\//g, '-')
}

// 解析 popup.task（与 App.vue 逻辑一致）
const parseTaskData = (taskRaw) => {
  if (!taskRaw) return []
  try {
    let taskJsonString = taskRaw
    if (typeof taskJsonString === 'string') {
      taskJsonString = taskJsonString.replace(/'/g, '"')
    }
    const taskData = typeof taskJsonString === 'string' ? JSON.parse(taskJsonString) : taskJsonString
    const taskList = taskData.taskInfoVos || []
    return taskList.map(task => ({
      id: task.id,
      taskName: task.name || '-',
      description: task.name || '-',
      timeRange: task.deadline ? task.deadline.substring(5, 10) : '-',
      status: task.status ?? 0
    }))
  } catch (err) {
    error('❌ 解析任务数据失败:', err)
    return []
  }
}

// 处理 popup 数据（签到人员 + 任务列表）
const handlePopup = (popup) => {
  if (!popup || typeof popup !== 'object') return

  latestPerson.value = {
    avatar: popup.image || popup.avatar || '',
    name: popup.name || '访客',
    location: popup.dev_name || popup.location || '锦绣华城厨房神域',
    time: formatDateTime(popup.time)
  }

  // 解析任务并更新列表
  const tasks = parseTaskData(popup.task)
  if (tasks.length > 0) {
    allTasks.value = tasks
  }
}

// 处理看板统计数据（与 App.vue 一致）
const handleDashboardData = (dashboard) => {
  const fields = ['scheduledCount', 'actualCount', 'attendanceRate', 'absentCount', 'yesterdayChange']
  const newStats = {}
  fields.forEach(f => { if (dashboard[f] !== undefined) newStats[f] = dashboard[f] })
  Object.assign(stats.value, newStats)
}

// 心跳管理
const resetHeartbeatTimer = () => {
  if (heartbeatTimer) { clearTimeout(heartbeatTimer); heartbeatTimer = null }
  heartbeatTimer = setTimeout(() => {
    warn('⚠️ 心跳超时，主动断开并重连')
    isConnected.value = false
    stopHeartbeatTimer()
    if (eventSource) { eventSource.close(); eventSource = null }
    triggerReconnect('心跳超时')
  }, HEARTBEAT_TIMEOUT)
}
const stopHeartbeatTimer = () => {
  if (heartbeatTimer) { clearTimeout(heartbeatTimer); heartbeatTimer = null }
}

// 重连
const triggerReconnect = (reason) => {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  reconnectAttempts += 1
  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) { error('SSE重连次数已达上限'); return }
  log(`🔄 ${reason}，第 ${reconnectAttempts} 次重连 (延迟 ${reconnectDelay}ms)`)
  reconnectTimer = setTimeout(() => {
    connectSSE()
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY)
  }, reconnectDelay)
}

// SSE 连接（与 App.vue 完全一致的接口和事件名）
const connectSSE = () => {
  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) { isConnected.value = false; stopHeartbeatTimer(); return }
  try {
    if (eventSource) { eventSource.close(); eventSource = null }
    stopHeartbeatTimer()

    const sseUrl = import.meta.env.MODE === 'development'
      ? '/api/sse/connect'
      : import.meta.env.VITE_SSE_URL || 'http://10.10.30.249:30345/api/sse/connect'

    eventSource = new EventSource(sseUrl)

    eventSource.onopen = () => {
      log('✅ 厨房看板 SSE 连接成功')
      isConnected.value = true
      reconnectAttempts = 0
      reconnectDelay = INITIAL_RECONNECT_DELAY
      resetHeartbeatTimer()
    }

    // 监听与 App.vue 完全相同的事件名
    eventSource.addEventListener('dashboard-data-popup', (event) => {
      try {
        // 修复服务端 popup.task 字段未转义问题（与 App.vue 一致）
        let eventData = event.data
        const taskStartPattern = /"task":\s*"/
        const taskStartMatch = eventData.match(taskStartPattern)
        if (taskStartMatch) {
          const taskStartIndex = eventData.indexOf(taskStartMatch[0]) + taskStartMatch[0].length
          const taskEndPattern = /}"\s*}/
          const afterTaskStart = eventData.substring(taskStartIndex)
          const taskEndMatch = afterTaskStart.match(taskEndPattern)
          if (taskEndMatch) {
            const taskEndIndex = afterTaskStart.indexOf(taskEndMatch[0])
            const taskJsonString = afterTaskStart.substring(0, taskEndIndex + 1)
            const fixedTaskJson = taskJsonString.replace(/"/g, "'")
            eventData = eventData.substring(0, taskStartIndex) + fixedTaskJson + afterTaskStart.substring(taskEndIndex + 1)
          }
        }

        const data = JSON.parse(eventData)

        if (data.type === 'heartbeat') {
          isConnected.value = true
          resetHeartbeatTimer()
          return
        }

        if (data.type === 'data') {
          if (data.data) handleDashboardData(data.data)
          if (data.popup) handlePopup(data.popup)
        }
      } catch (err) {
        error('❌ SSE消息解析失败:', err)
      }
    })

    eventSource.onerror = (err) => {
      error('❌ SSE连接错误:', err)
      isConnected.value = false
      stopHeartbeatTimer()
      if (eventSource) { eventSource.close(); eventSource = null }
      triggerReconnect('SSE连接错误')
    }
  } catch (err) {
    error('EventSource 初始化失败:', err)
    isConnected.value = false
    stopHeartbeatTimer()
  }
}

// Wake Lock
const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => log('屏幕锁已释放'))
    } catch (err) { warn('无法保持屏幕常亮:', err) }
  }
}
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && wakeLock === null) requestWakeLock()
}

onMounted(() => {
  updateTime()
  timeUpdateTimer = setInterval(updateTime, 1000)
  connectSSE()
  requestWakeLock()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  document.addEventListener('contextmenu', e => e.preventDefault())
})

onUnmounted(() => {
  if (timeUpdateTimer) { clearInterval(timeUpdateTimer); timeUpdateTimer = null }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  stopHeartbeatTimer()
  if (eventSource) { eventSource.close(); eventSource = null }
  if (wakeLock) wakeLock.release().catch(() => {})
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
* {
  box-sizing: border-box;
  -webkit-text-size-adjust: none !important;
  text-size-adjust: none !important;
}

.kitchen-board {
  width: 100vw;
  height: 100vh;
  background-image: url('./assets/images/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 1vw;
  color: #fff;
}

/* 头部 */
.board-header {
  height: 12vh;
  background-image: url('./assets/images/header-banner2.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3vw;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.8vw;
  font-size: 1.1vw;
  color: #fff;
}

.logo {
  width: 2.2vw;
  height: 2.2vw;
  object-fit: contain;
}

.status-dot {
  width: 0.8vw;
  height: 0.8vw;
  border-radius: 50%;
  background: #ccc;
}
.status-dot.active {
  background: #52c41a;
  box-shadow: 0 0 6px #52c41a;
}

.header-title {
  font-size: 2.2vw;
  font-weight: 600;
  color: rgba(209, 166, 102, 1);
  letter-spacing: 0.3vw;
  text-shadow: 0 0 20px rgba(209, 166, 102, 0.5);
}

.header-right {
  font-size: 1vw;
  color: #fff;
}

/* 统计卡片区 */
.stats-section {
  display: flex;
  gap: 2vw;
  padding: 2vh 3vw;
  flex-shrink: 0;
}

.stat-card {
  flex: 1;
  background: linear-gradient(180deg, rgba(74, 57, 29, 0.3) 0%, rgba(36, 22, 4, 0.8) 100%);
  border: 1px solid rgba(105, 81, 37, 1);
  padding: 2vh 1.5vw;
  display: flex;
  align-items: center;
  gap: 1.5vw;
  box-shadow: 0 0 20px rgba(209, 166, 102, 0.1);
}

.card-icon {
  width: 8vw;
  height: 8vw;
  flex-shrink: 0;
}
.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-body {
  flex: 1;
}

.card-label {
  font-size: 1.1vw;
  color: #fff;
  margin-bottom: 0.5vh;
}

.card-note {
  font-size: 0.7vw;
  color: rgba(209, 166, 102, 0.6);
  margin-bottom: 0.5vh;
}

.card-value {
  font-size: 3.2vw;
  font-weight: 700;
  color: rgba(209, 166, 102, 1);
  line-height: 1.1;
  font-family: 'DINAlternate-Bold', Arial, sans-serif;
  margin-bottom: 0.5vh;
}

.unit {
  font-size: 2vw;
}

.card-meta {
  font-size: 0.9vw;
  color: rgba(209, 166, 102, 0.8);
}

.meta-right {
  margin-left: 1.5vw;
}

.value-green { color: #14cc5e; font-weight: 700; }
.text-red { color: #D43030; font-weight: 600; }
.text-gold { color: rgba(209, 166, 102, 1); font-weight: 600; }

/* 欢迎卡片 */
.welcome-card {
  flex: 1.6;
  background: linear-gradient(180deg, rgba(74, 57, 29, 0.3) 0%, rgba(36, 22, 4, 0.8) 100%);
  border: 1px solid rgba(105, 81, 37, 1);
  padding: 2vh 1.5vw;
  display: flex;
  align-items: center;
  gap: 1.5vw;
  box-shadow: 0 0 20px rgba(209, 166, 102, 0.1);
}

.welcome-avatar {
  width: 9vh;
  height: 9vh;
  border: 2px solid rgba(209, 166, 102, 0.6);
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}
.welcome-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.welcome-body {
  flex: 1;
}

.welcome-name {
  font-size: 1.6vw;
  color: #fff;
  margin-bottom: 1vh;
  line-height: 1.4;
}

.welcome-time {
  font-size: 1vw;
  color: rgba(209, 166, 102, 0.8);
}

/* 任务区 */
.task-section {
  flex: 1;
  padding: 0 3vw 2vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  font-size: 1.4vw;
  color: rgba(209, 166, 102, 1);
  margin-bottom: 1.5vh;
  font-weight: 500;
}

.title-arrow {
  color: rgba(209, 166, 102, 1);
  margin-right: 0.5vw;
}

.task-board {
  flex: 1;
  display: flex;
  gap: 2vw;
  overflow: hidden;
}

.task-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-header {
  font-size: 1.1vw;
  font-weight: 600;
  padding: 1vh 1.5vw;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: center;
  gap: 0.5vw;
  flex-shrink: 0;
}

.column-header.completed {
  background: rgba(0, 189, 75, 0.15);
  border: 1px solid rgba(0, 189, 75, 0.4);
  color: #00BD4B;
}

.column-header.in-progress {
  background: rgba(255, 165, 0, 0.15);
  border: 1px solid rgba(255, 165, 0, 0.4);
  color: #FFA500;
}

.column-header.pending {
  background: rgba(150, 150, 150, 0.15);
  border: 1px solid rgba(150, 150, 150, 0.4);
  color: #aaa;
}

.col-icon {
  font-size: 1.2vw;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(74, 57, 29, 0.1) 0%, rgba(36, 22, 4, 0.5) 100%);
  border: 1px solid rgba(105, 81, 37, 0.5);
  border-top: none;
  padding: 0.5vh 0;
}

.task-item {
  padding: 1.2vh 1.5vw;
  border-bottom: 1px solid rgba(209, 166, 102, 0.1);
  transition: background 0.2s;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background: rgba(209, 166, 102, 0.05);
}

.task-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4vh;
}

.task-name {
  font-size: 1vw;
  font-weight: 600;
  color: rgba(209, 166, 102, 1);
}

.task-time {
  font-size: 0.85vw;
  color: rgba(209, 166, 102, 0.7);
  white-space: nowrap;
  margin-left: 1vw;
}

.task-desc {
  font-size: 0.85vw;
  color: rgba(209, 166, 102, 0.6);
  line-height: 1.4;
}

.task-empty {
  padding: 3vh 1.5vw;
  text-align: center;
  color: rgba(209, 166, 102, 0.3);
  font-size: 0.9vw;
}

/* 滚动条 */
.task-list::-webkit-scrollbar { width: 0.4vw; }
.task-list::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
.task-list::-webkit-scrollbar-thumb { background: rgba(209, 166, 102, 0.3); border-radius: 2px; }
.task-list::-webkit-scrollbar-thumb:hover { background: rgba(209, 166, 102, 0.5); }
</style>

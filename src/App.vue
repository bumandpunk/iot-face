<template>
  <div class="dashboard-container">
    <!-- 头部标题栏 -->
    <header class="dashboard-header">
      <div class="network-status">
        <img src="./assets/images/logo-network.png" alt="logo" class="network-logo" />
        <span class="status-dot" :class="{ active: isConnected }"></span>
        <span>捷租生态网络已覆盖</span>
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
          <div class="stat-card card-attendance">
            <div class="stat-label">今日 应到岗/实到岗 人数</div>
            <div class="stat-value-large">
              {{ stats.scheduledCount }} / <span class="positive">{{ stats.actualCount }}</span>
            </div>
            <div class="stat-meta">
              到岗率：<span class="highlight">{{ stats.attendanceRate }}%</span> <span class="meta-item-right">缺勤人数：<span class="warning">{{ stats.absentCount }}</span></span>
            </div>
          </div>

          <!-- 空间使用率 -->
          <div class="stat-card card-space">
            <div class="stat-label">今日空间使用率</div>
            <div class="stat-note-top">根据到岗人数/工位数计算</div>
            <div class="stat-value-large">{{ stats.spaceUsageRate }}%</div>
            <div class="stat-meta">
              较昨日：<span class="positive">+{{ stats.yesterdayChange }}%</span> 
            </div>
          </div>

          <!-- 在域内人员 -->
          <div class="stat-card card-inside">
            <div class="stat-label">今日域内人员</div>
           
            <div class="stat-value-medium">{{ stats.todayTotalPeople }}</div>
            <div class="stat-meta-bottom">
              已离开：<span class="warning">{{ stats.leftCount }}</span> <span class="meta-item-right">在域：<span class="highlight">{{ stats.inDomainCount }}</span></span>
            </div>
          </div>

          <!-- 进出总次数 -->
          <div class="stat-card card-inout">
            <div class="stat-label">今日进出总人次</div>
            <div class="stat-value-large">{{ stats.totalEntryExit.toLocaleString() }}</div>
            <div class="stat-meta">
              进入：<span class="positive">{{ stats.entryCount }}</span> <span class="meta-item-right">离开：<span class="warning">{{ stats.exitCount }}</span></span>
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
            <!-- <div class="alert-col col-level">信息等级</div> -->
            <div class="alert-col col-detail">信息详情</div>
          </div>
          <div class="alert-table-body">
            <div class="alert-table-row" v-for="(alert, index) in alerts" :key="alert.id">
              <div class="alert-col col-index">{{ index + 1 }}</div>
              <div class="alert-col col-time">{{ alert.time }}</div>
              
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
        <div class="popup-content" :class="popupData.type">
          <!-- 头像区域 -->
          <div class="popup-avatar-wrapper">
            <div class="popup-avatar">
              <img :src="popupData.avatar" alt="avatar" />
            </div>
          </div>
          
          <!-- 欢迎信息 -->
          <div class="popup-welcome">
            <span class="popup-name">{{ popupData.name }}，</span>
            <span class="popup-action">欢迎进入</span>
            <span class="popup-location">{{ popupData.location || '策维3107神域' }}</span>
          </div>
          
          <!-- 底部信息 -->
          <div class="popup-footer">
            <div class="popup-footer-item">
              <span class="popup-footer-label">时间：</span>
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
  scheduledCount: 256,      // 今日应到岗人数(原expectedCount)
  actualCount: 243,          // 今日实到岗人数
  attendanceRate: 94.9,      // 到岗率
  absentCount: 13,           // 缺勤人数(原absent)
  spaceUsageRate: 78.5,      // 今日空间使用率
  yesterdayChange: 3.2,      // 较昨日变化(原rateChange)
  todayTotalPeople: 42,      // 今日域内人员(原currentInside)
  leftCount: 28,             // 已离开
  inDomainCount: 14,         // 在域
  totalEntryExit: 1842,      // 今日进出总人次(原totalInOut)
  entryCount: 923,           // 进入(原enterCount)
  exitCount: 919             // 离开
})

// 异常记录
const alerts = ref([
  { id: 1, time: '2026-01-21 14:02:43',  message: '门口监控1', type: 'warning' },
  { id: 2, time: '2026-01-21 14:02:43',  message: '门口监控1', type: 'warning' },
  { id: 3, time: '2026-01-21 14:02:43',  message: '门口监控1', type: 'warning' },
  { id: 4, time: '2026-01-21 14:02:43',  message: '门口监控1', type: 'warning' },
  { id: 5, time: '2026-01-21 14:02:43',  message: '门口监控1', type: 'warning' }
])

// 流量数据
const flowData = ref({
  times: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  inside: [25, 35, 42, 38, 45, 40, 28, 50, 55, 48, 52],
  enter: [20, 25, 30, 28, 32, 30, 22, 35, 38, 33, 36],
  exit: [15, 18, 22, 25, 28, 35, 40, 30, 28, 32, 35]
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
    eventSource.addEventListener('dashboard-data-popup', (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('收到数据推送:', data.type || 'heartbeat', data)
        
        // 处理心跳消息
        if (data.type === 'heartbeat') {
          isConnected.value = true
          return
        }
        
        // 处理完整数据推送
        if (data.type === 'data') {
          // 处理看板数据（metrics）
          if (data.data) {
            handleDashboardData(data.data)
          }
          // 处理人员进出弹窗（popup）
          if (data.popup) {
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
  console.log('更新看板数据', dashboard)
  
  // 更新统计数据
  if (dashboard.stats) {
    Object.assign(stats.value, dashboard.stats)
  }
  
  // 更新异常告警
  if (dashboard.alerts?.length) {
    alerts.value = dashboard.alerts.slice(0, MAX_ALERTS).map((alert, index) => ({
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
      message: alert.message || alert.detail || '',
      type: alert.type || 'warning'
    }))
  }
  
  // 更新流量数据
  if (dashboard.flowData) {
    flowData.value = {
      times: dashboard.flowData.times?.slice(-MAX_FLOW_POINTS) || [],
      inside: dashboard.flowData.inside?.slice(-MAX_FLOW_POINTS) || [],
      enter: dashboard.flowData.enter?.slice(-MAX_FLOW_POINTS) || [],
      exit: dashboard.flowData.exit?.slice(-MAX_FLOW_POINTS) || []
    }
  }
}

// 显示人员进出弹窗
const showPersonPopup = (popup) => {
  // 清理之前的定时器
  if (popupTimer) {
    clearTimeout(popupTimer)
    popupTimer = null
  }
  
  console.log('显示弹窗', popup)
  

  
  // 直接使用图片URL（不再转换Base64）
  const avatarUrl = popup.image 
  
  // 格式化时间
  const formattedTime = popup.time 
    ? new Date(popup.time * 1000).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : new Date().toLocaleString('zh-CN')
  
  popupData.value = {
    type: actionType,
    avatar: avatarUrl,
    name: popup.name || '访客',
    location: popup.dev_name || '策维3107神域',
    time: formattedTime,
    todayCount: popup.count || 0
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
})
  // 禁用右键菜单（电视环境）
  document.addEventListener('contextmenu', (e) => e.preventDefault())
  

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

* {
  -webkit-text-size-adjust: none !important;
  -ms-text-size-adjust: none !important;
  text-size-adjust: none !important;
  box-sizing: border-box;
}

.dashboard-container {
  width: 100vw;
  height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  box-sizing: border-box;
  background-image: url('./assets/images/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  /* 使用固定像素而不是vw */
  font-size: 1vw;
}


.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3vw;
  background-image: url('./assets/images/header-banner.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 0;
  box-shadow: none;
  flex-shrink: 0;
  height: 12vh;
  position: relative;
}

.dashboard-header::before,
.dashboard-header::after {
  display: none;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 1vw;
  font-size: 1.1vw;
  color: #FFFFFF;
  font-weight: 500;
}

.network-logo {
  width: 2.2vw;
  height: 2.2vw;
  object-fit: contain;
  margin-right: 3px;
}

.status-dot {
  width: 0.8vw;
  height: 0.8vw;
  border-radius: 50%;
  background: #ccc;
  position: relative;
  margin-right: 5px;
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

.title-decoration {
  display: none;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 1.2vw;
  flex: 1;
  justify-content: center;
  margin-top: 0;
}

.title-image {
  height: 6vh;
  width: auto;
  object-fit: contain;
}

.title {
  font-size: 2vw;
  font-weight: 500;
  color: #000000;
  letter-spacing: 0.4vw;
  white-space: nowrap;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.datetime {
  font-size: 1vw;
  color: #FFFFFF;
  font-weight: 500;
  padding: 0.6vh 1.2vw;
  background: transparent;
  border-radius: 0.5vh;
}

/* 主内容区 - 增加gap，让卡片和表格有间距 */
.dashboard-content {
  display: flex;
  gap: 2vw;
  flex: 0 1 auto;
  overflow: hidden;
  min-height: 0;
  padding: 1.5vh 3vw 1vh 3vw;
  max-height: 60vh;
}

.section-title {
  font-size: 1.2vw;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 1.5vh;
  padding-bottom: 0;
  padding-left: 2vw;
  border-bottom: none;
  flex-shrink: 0;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5vw;
  height: 1.5vw;
  background-image: url('./assets/images/title-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* 统计区域 - 保持65% */
.stats-section {
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 65%;
  flex-shrink: 0;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.8vh 1.5vw;
  justify-content: space-between;
  align-content: flex-start;
}

.stats-grid > .stat-card {
  width: calc(50% - 0.75vw);
  flex-shrink: 0;
}

.stat-card {
  height: 18vh;
  /* min-height: 140px; */
  position: relative;
  background: linear-gradient(180deg, rgba(74, 57, 29, 0.3) 0%, rgba(36, 22, 4, 0.8) 100%);
  border: 1px solid rgba(105, 81, 37, 1);
  /* border-radius: 1vh; */
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 
    0 0 20px rgba(209, 166, 102, 0.15),
    inset 0 0 30px rgba(209, 166, 102, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}



.stat-card::before {
  content: '';
  position: absolute;
  left: 5.3%;  /* 24/450 ≈ 5.3% */
  top: 12.5%;  /* 24/192 ≈ 12.5% */
  width: 32%;  /* 144/450 = 32% */
  height: 75%; /* 144/192 = 75% */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.stat-card.card-attendance::before {
  background-image: url('./assets/images/icon-attendance.png');
}

.stat-card.card-space::before {
  background-image: url('./assets/images/icon-space.png');
}

.stat-card.card-inside::before {
  background-image: url('./assets/images/icon-inside.png');
}

.stat-card.card-inout::before {
  background-image: url('./assets/images/icon-inout.png');
}

/* 特殊卡片：今日域内人员（居中布局，保留图标） */
.stat-card.card-inside .stat-label {
  left: 50%;
  top: 12%;
  transform: translateX(-50%);
}

.stat-card.card-inside .stat-value-medium {
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
}

.stat-label {
  position: absolute;
  left: 40.9%;
  top: 12%;
  font-size: 1.1vw;
  color: #FFFFFF;
  font-weight: 400;
  white-space: nowrap;
}

/* 标题下方的提示文字 */
.stat-note-top {
  position: absolute;
  left: 40.9%;
  top: 26%;
  font-size: 0.7vw;
  color: rgba(209, 166, 102, 0.7);
  white-space: nowrap;
  font-weight: 300;
}

/* 居中卡片的标题下提示 - 紧贴标题下方 */
.stat-card.card-inside .stat-note-top {
  left: 50%;
  top: 24%;
  transform: translateX(-50%);
  text-align: center;
  font-size: 0.65vw;
}

.stat-value-large {
  position: absolute;
  left: 40.9%;
  top: 40%;
  font-size: 3vw;
  font-weight: 700;
  color: rgba(209, 166, 102, 1);
  line-height: 1.2;
  font-family: 'DINAlternate-Bold', 'YouSheBiaoTiYuan', -apple-system, sans-serif;
}

.stat-value-medium {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 4vw;
  font-weight: 700;
  color: rgba(209, 166, 102, 1);
  line-height: 1.2;
  font-family: 'DINAlternate-Bold', 'YouSheBiaoTiYuan', -apple-system, sans-serif;
}

.stat-meta {
  position: absolute;
  left: 40.9%;
  top: 72%;
  font-size: 0.85vw;
  color: rgba(209, 166, 102, 0.8);
  white-space: nowrap;
  font-weight: 400;
}

/* 底部元数据（用于居中卡片） */
.stat-meta-bottom {
  position: absolute;
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
  font-size: 0.85vw;
  color: rgba(209, 166, 102, 0.8);
  white-space: nowrap;
  font-weight: 400;
  text-align: center;
}

.highlight {
  color: rgba(209, 166, 102, 1);
  font-weight: 600;
}

.warning {
  color: #D43030;
  font-weight: 600;
}

.positive {
  color: rgba(20, 204, 94, 1);
  font-weight: 700;
}

/* 底部元数据右侧项 - 增加左边距 */
.meta-item-right {
  margin-left: 1.5vw;
}

/* 异常记录 - 调整为35%，固定高度不撑开 */
.alert-section {
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
  width: 31%;
  flex-shrink: 0;
  margin-left: 25px;
  
}

/* 异常告警表格 - 控制高度，只显示5条数据 */
.alert-table {
  flex: 0 1 auto;
  background: transparent;
  /* border-radius: 1vh; */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(105, 81, 37, 1);
  box-shadow: none;
  min-height: 0;
  max-height: fit-content;
  background: linear-gradient(180deg, rgba(74, 57, 29, 0) 0%, rgba(36, 22, 4, 1) 99.65%);

border-width: 1px ;
border-style: solid;
border-color: rgba(105, 81, 37, 1);
}

.alert-table-header {
  display: flex;
  background: transparent;
  padding: 1.2vh 0;
  font-size: 0.9vw;
  font-weight: 400;
  color: #FFFFFF;
  border-bottom: 0.2vh solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.alert-table-body {
  flex: 0 1 auto;
  overflow: visible;
  min-height: 0;
  max-height: fit-content;
}

.alert-table-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.alert-table-row {
  display: flex;
  padding: 1.2vh 0;
  font-size: 0.95vw;
  color: #FFFFFF;
  border-bottom: 0.1vh solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
  flex-shrink: 0;
}

.alert-table-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.alert-table-row:last-child {
  border-bottom: none;
}

.alert-col {
  padding: 0.5vw 1vw;
  display: flex;
  align-items: center;
}

.col-index {
  width: 12%;
  min-width: 60px;
  justify-content: center;
  color: #FFFFFF;
  font-weight: 500;
}

.col-time {
  width: 45%;
  color: #FFFFFF;
  font-weight: 400;
}

.col-level {
  width: 22%;
  min-width: 80px;
  justify-content: center;
  white-space: nowrap;
}

.col-detail {
  width: 36%;
  color: #FFFFFF;
  font-weight: 400;
}

.level-badge {
  padding: 0.5vh 1vw;
  border-radius: 0.5vh;
  font-size: 0.9vw;
  font-weight: 500;
}

.level-badge.warning {
  background: transparent;
  color: #E0B116;
  border: none;
}

.level-badge.danger {
  background: transparent;
  color: #D43030;
  border: none;
}

.level-badge.info {
  background: transparent;
  color: #00BD4B;
  border: none;
}

/* 图表区域 - 扩大高度，占据更多空间 */
.chart-section {
  background: transparent;  /* 完全透明 */
  /* background: rgba(255, 255, 255, 0.3); */ /* 更透明的选项 */
  /* background: none; */ /* 完全去掉背景 */
  /* padding: 1.5vh 2vw; */
  border-radius: 1vh;
  box-shadow: none;  /* 去掉阴影让效果更干净 */
  flex: 1;
  min-height: 20vh;
  max-height: 35vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 3vw 2vh 3vw;
}

.chart-legend {
  display: flex;
  gap: 3vw;
  margin-bottom: 1vh;
  font-size: 0.9vw;
  flex-shrink: 0;
  color: #FFFFFF;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.8vw;
  margin-left: 32px;
}

.legend-dot {
  width: 0.9vw;
  height: 0.9vw;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 4px;
}

.legend-dot.orange {
  background: #FF7F50;
}

.legend-dot.blue {
  background: #1F7FED;
}

.legend-dot.green {
  background: #00BD4B;
}

/* 弹窗 */
.person-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(230, 241, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background: #ffffff;
  padding: 50px 80px 40px;
  border-radius: 12px;
  text-align: center;
  min-width: 600px;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(31, 127, 237, 0.2);
  position: relative;
  border: 2px solid rgba(166, 207, 255, 0.3);
}

/* 头像区域 */
.popup-avatar-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 28px;
}

.popup-avatar {
  width: 100%;
  height: 100%;
  border: 5px solid #efab18;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 4px 12px rgba(31, 127, 237, 0.3);
}

.popup-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 欢迎信息 */
.popup-welcome {
  font-size: 32px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 28px;
  line-height: 1.5;
}

.popup-name {
  color: #000000;
}

.popup-action {
  color: #000000;
}

.popup-location {
  color: rgba(209, 166, 102, 1);
  font-weight: 600;
}

/* 底部信息 */
.popup-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 24px;
  gap: 45px;
}

.popup-footer-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.popup-footer-label {
  font-size: 16px;
  color: #8794A5;
}

.popup-footer-value {
  font-size: 18px;
  font-weight: 600;
  color: rgba(209, 166, 102, 1);
}

/* 进入和退出的不同样式 */
.popup-content.exit .popup-avatar {
  border-color: #D43030;
}

.popup-content.exit .popup-location {
  color: #D43030;
}

.popup-content.exit .popup-footer-value {
  color: #D43030;
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

/* 滚动条样式 - 稍微大一点 */
::-webkit-scrollbar {
  width: 0.5vw;
  height: 0.5vh;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 0.25vw;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 0.25vw;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* 响应式布局 - 平板和小屏幕 */
@media (max-width: 1366px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    gap: 2vh;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-section {
    height: 30vh;
  }
}

@media (max-width: 768px) {
  .network-status span:not(.status-dot) {
    display: none;
  }
  
  .title-image {
    height: clamp(28px, 4vh, 42px);
  }
  
  .title {
    font-size: 18px;
    letter-spacing: 1.9px;
  }
  
  .datetime {
    font-size: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

</style>

# 代码检查报告

## 检查时间
2026-03-13

## 总体评价
✅ 代码质量：良好  
✅ 语法检查：通过  
⚠️ 改进空间：中等

---

## 发现的问题

### 1. SSE 事件监听不一致 (优先级: 高)

**位置**: `src/App.vue` 第 464 行

**问题描述**:
```javascript
eventSource.addEventListener('dashboard-data-popup', (event) => {
```

监听的事件名称 `dashboard-data-popup` 与后端约定不一致，建议确认后端实际发送的事件类型。

**建议修复**:
- 与后端确认事件名称
- 或者同时监听多个事件类型以提高兼容性

---

### 2. 任务数据解析不够健壮 (优先级: 高)

**位置**: `src/App.vue` 第 656-668 行

**问题描述**:
```javascript
let taskJsonString = popup.task
if (typeof taskJsonString === 'string') {
  taskJsonString = taskJsonString.replace(/'/g, '"')
}
```

简单的字符串替换可能导致解析失败，特别是当任务内容本身包含引号时。

**建议修复**:
```javascript
try {
  if (popup.task) {
    // 方案1: 要求后端返回正确的 JSON 格式
    const taskData = typeof popup.task === 'string' 
      ? JSON.parse(popup.task) 
      : popup.task
    
    // 方案2: 如果后端无法修改，使用更安全的解析方式
    // 可以考虑使用 JSON5 或其他容错性更好的解析器
  }
} catch (err) {
  error('❌ 解析任务数据失败:', err, popup.task)
  // 设置默认值，避免应用崩溃
  tasks = []
  taskCount = 0
}
```

---

### 3. 环境变量配置不一致 (优先级: 中)

**位置**: `.env.production`

**问题描述**:
- `VITE_TASK_API_URL` 定义了但未使用
- SSE URL 配置了两个不同的 IP 地址

**建议修复**:
1. 删除未使用的环境变量
2. 统一后端服务地址配置
3. 在代码中使用环境变量而不是硬编码

---

### 4. 计数器溢出风险 (优先级: 低)

**位置**: `src/App.vue` 第 241 行

**问题描述**:
```javascript
let alertIdCounter = 1 // 告警ID计数器
```

长时间运行后可能溢出（虽然 JavaScript 的 Number 类型很大）。

**建议修复**:
```javascript
// 使用循环计数或时间戳
let alertIdCounter = 1
const getAlertId = () => {
  const id = `alert-${Date.now()}-${alertIdCounter}`
  alertIdCounter = (alertIdCounter % 10000) + 1 // 循环使用
  return id
}
```

---

### 5. 代码重复 (优先级: 低)

**位置**: `src/App.vue` 第 565-571 行 和 第 697-712 行

**问题描述**:
`formatDateTime` 和 `formatDateDeadline` 功能相似，可以合并。

**建议修复**:
```javascript
const formatDateTime = (timestamp, format = 'full') => {
  const date = timestamp ? new Date(timestamp * 1000) : new Date()
  
  if (format === 'deadline') {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day} 17:30`
  }
  
  return date.toLocaleString('zh-CN', dateFormatOptions).replace(/\//g, '-')
}
```

---

### 6. 未使用的 SSE 管理器 (优先级: 低)

**位置**: `src/api/sse.js`

**问题描述**:
定义了完整的 `SSEManager` 类，但在 `App.vue` 中没有使用，而是直接使用原生 `EventSource`。

**建议**:
- 如果不需要，可以删除 `sse.js` 文件
- 或者重构 `App.vue` 使用 `SSEManager` 以提高代码复用性

---

## 性能优化建议

### 1. 减少响应式更新频率
当前每次 SSE 推送都会触发多次响应式更新，可以考虑批量更新：

```javascript
// 使用 nextTick 批量更新
import { nextTick } from 'vue'

const handleDashboardData = async (dashboard) => {
  // 收集所有更新
  const updates = { ...dashboard }
  
  // 批量应用
  await nextTick()
  Object.assign(stats.value, updates)
}
```

### 2. 图表更新节流
ECharts 更新可以添加节流，避免频繁重绘：

```javascript
import { debounce } from 'lodash-es' // 或自己实现

const updateChart = debounce(() => {
  if (!chartInstance) return
  // ... 更新逻辑
}, 300)
```

---

## 安全建议

### 1. XSS 防护
虽然使用了 Vue 的模板语法（自动转义），但在处理用户头像 URL 时要注意：

```javascript
// 验证 URL 格式
const isValidImageUrl = (url) => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'data:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

const avatarUrl = isValidImageUrl(popup.image) 
  ? popup.image 
  : '/default-avatar.png'
```

### 2. 敏感信息
`.env.production` 文件包含内网 IP 地址，确保不要提交到公共仓库。

---

## 代码风格建议

1. **一致的日志格式**: 统一使用 emoji 前缀（✅ ❌ ⚠️ 🔄 等）
2. **注释完整性**: 部分复杂逻辑缺少注释（如心跳检测机制）
3. **魔法数字**: 虽然定义了常量，但部分地方仍使用硬编码（如 `3000ms`）

---

## 测试建议

建议添加以下测试场景：

1. **SSE 断线重连测试**: 模拟网络中断
2. **长时间运行测试**: 验证内存泄漏和性能
3. **异常数据测试**: 测试畸形 JSON、缺失字段等
4. **并发弹窗测试**: 快速连续的人员进出事件

---

## 总结

代码整体质量良好，主要问题集中在：
1. 数据解析的健壮性
2. 配置管理的一致性
3. 代码复用性

建议优先修复高优先级问题，其他问题可以在后续迭代中逐步改进。

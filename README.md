# 门禁看板系统

基于 Vue 3 的智能门禁打卡看板，支持 Web 和 Android TV。现已支持双看板模式！

![Build Status](https://github.com/你的用户名/iot-face/workflows/Build%20Dual%20APK/badge.svg)

## 🌟 功能特性

### 📱 门禁看板
- 📊 **实时统计**：出勤率、空间使用率、在域人员数
- 📈 **流量分析**：全天进出人员趋势图表  
- 👋 **人员提示**：刷脸进出实时弹窗提醒
- ⚠️ **异常预警**：违规和验证警报实时显示

### 🍳 厨房考勤看板（新增）
- 📊 **考勤统计**：应到岗/实到岗人数、出勤率
- 📋 **任务管理**：已完成、进行中、待开始任务分类展示
- 👤 **人员签到**：实时显示签到人员信息
- 🎯 **任务追踪**：任务时间、描述详细展示

### 🔌 通用特性
- 🔌 **SSE长连接**：与后端实时通讯
- 📱 **跨平台**：支持Web浏览器和Android TV
- 🎨 **独立打包**：两个看板独立 APK，互不干扰

## 🚀 快速开始

### Web 开发环境

```bash
# 安装依赖
npm install

# 启动门禁看板开发服务器
npm run dev

# 启动厨房看板开发服务器（访问 /kitchen.html）
npm run dev:kitchen

# 浏览器访问
http://localhost:3000          # 门禁看板
http://localhost:3000/kitchen.html  # 厨房看板
```

### 📱 获取Android APK

本项目支持构建两个独立的 APK：
- **dashboard-debug.apk** - 门禁看板
- **kitchen-debug.apk** - 厨房考勤看板

#### 方法1：GitHub Actions自动构建（推荐）

1. **Fork或上传项目到GitHub**

2. **配置后端地址**  
   编辑 `.env.production`：
   ```env
   # 门禁看板
   VITE_SSE_URL=http://你的后端IP:端口/api/sse/connect
   
   # 厨房看板
   VITE_KITCHEN_SSE_URL=http://你的后端IP:端口/api/sse/kitchen
   ```

3. **推送代码触发构建**
   ```bash
   git add .
   git commit -m "配置后端地址"
   git push
   ```

4. **下载APK**
   - 访问你的GitHub仓库
   - 点击 `Actions` 标签
   - 找到最新的workflow运行
   - 下载 `dashboard-apk` 和 `kitchen-apk` artifacts
   - 或从 `Releases` 页面下载

#### 方法2：本地命令行构建

需要Java 17+：
```bash
# 构建门禁看板
npm run build:dashboard
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk

# 构建厨房看板
npm run build:kitchen
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

详细构建说明见 [BUILD_GUIDE.md](BUILD_GUIDE.md)

## ⚙️ 配置说明

### 开发环境配置
开发时使用Vite代理，无需配置。后端地址在 `vite.config.js` 中修改。

### 生产环境配置（APK打包）
编辑 `.env.production`：
```env
# 门禁看板
VITE_API_BASE_URL=http://10.10.50.2:6160/api
VITE_SSE_URL=http://10.10.30.249:30345/api/sse/connect

# 厨房看板
VITE_KITCHEN_SSE_URL=http://10.10.30.249:30345/api/sse/kitchen
VITE_KITCHEN_API_URL=http://10.10.30.249:30345/api/kitchen
```

## 🔌 后端接口规范

### 门禁看板 SSE 连接
**接口**：`GET /api/sse/connect`  
**事件类型**：`event: dashboard-data-popup`

**消息格式**：
```javascript
{
  "type": "data",
  "data": {
    "scheduledCount": 256,
    "actualCount": 243,
    "attendanceRate": 97.5
  },
  "popup": {
    "name": "张三",
    "image": "http://...",
    "time": 1234567890
  }
}
```

### 厨房看板 SSE 连接
**接口**：`GET /api/sse/kitchen`  
**事件类型**：`event: kitchen-data`

**消息格式**：
```javascript
{
  "stats": {
    "scheduledCount": 256,
    "actualCount": 243,
    "attendanceRate": 97.5
  },
  "welcome": {
    "name": "张三",
    "avatar": "http://...",
    "time": "07:59:43"
  },
  "tasks": {
    "completed": [...],
    "inProgress": [...],
    "pending": [...]
  }
}
```

详细接口文档见代码注释。

## 📱 电视安装

### U盘安装（推荐）
1. 将对应的 APK 复制到U盘
   - `dashboard-debug.apk` - 门禁看板
   - `kitchen-debug.apk` - 厨房看板
2. U盘插入电视
3. 使用文件管理器安装

### ADB安装
```bash
adb connect 电视IP:5555

# 安装门禁看板
adb install -r dashboard-debug.apk

# 安装厨房看板
adb install -r kitchen-debug.apk
```

### 首次运行
1. 开启"未知来源"安装权限
2. 确保电视和后端在同一局域网
3. 两个 APK 可以同时安装，互不冲突
3. 启动应用即可自动连接

## 🎨 界面说明

### 门禁看板
- **左侧**：统计数据卡片（出勤、空间使用率等）
- **右侧**：异常警告记录（实时滚动）
- **底部**：流量趋势图表（ECharts）
- **弹窗**：人员进出提醒（3秒自动关闭）

### 厨房考勤看板
- **顶部**：考勤统计卡片、人员签到信息
- **中部**：任务状态标签（已完成、进行中、待开始）
- **底部**：三列任务列表，实时更新

## 🔧 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite 5
- **图表库**：ECharts 5 + vue-echarts
- **跨平台**：Capacitor 8
- **实时通讯**：Server-Sent Events (SSE)
- **CI/CD**：GitHub Actions

## 📦 项目结构

```
iot-face/
├── .github/
│   └── workflows/
│       └── build-dual-apk.yml      # 双APK构建工作流
├── src/
│   ├── App.vue                     # 门禁看板组件
│   ├── KitchenBoard.vue            # 厨房看板组件
│   ├── main-dashboard.js           # 门禁看板入口
│   ├── main-kitchen.js             # 厨房看板入口
│   ├── style.css                   # 全局样式
│   ├── components/
│   │   └── FlowChart.vue           # 流量图表组件
│   ├── api/
│   │   └── sse.js                  # SSE管理器
│   └── config/
│       └── index.js                # 配置文件
├── android/                        # Android项目
├── dist/                           # 构建输出
├── dist-dashboard/                 # 门禁看板构建输出
├── dist-kitchen/                   # 厨房看板构建输出
├── index.html                      # 门禁看板HTML
├── kitchen.html                    # 厨房看板HTML
├── .env.production                 # 生产环境配置
├── capacitor.config.dashboard.json # 门禁看板配置
├── capacitor.config.kitchen.json   # 厨房看板配置
├── build-dashboard.js              # 门禁看板构建脚本
├── build-kitchen.js                # 厨房看板构建脚本
├── vite.config.js                  # Vite配置
└── BUILD_GUIDE.md                  # 详细构建指南
```

## 🐛 常见问题

### 1. GitHub Actions构建失败
- 检查 `.env.production` 文件是否存在
- 确保所有依赖都在 `package.json` 中

### 2. APK安装到电视失败
- 确保开启"未知来源"安装权限
- 检查电视系统版本（需要Android 5.0+）

### 3. 应用无法连接后端
- 检查 `.env.production` 中的IP地址
- 确保电视和后端在同一网络
- 检查后端防火墙设置

### 4. 如何修改后端地址后重新构建
```bash
# 1. 修改 .env.production
# 2. 提交并推送
git add .env.production
git commit -m "更新后端地址"
git push

# 3. GitHub Actions会自动构建新的APK
```

### 5. 两个APK可以同时安装吗？
可以！两个APK使用不同的包名：
- 门禁看板: `com.iotface.dashboard`
- 厨房看板: `com.iotface.kitchen`

### 6. 如何只构建其中一个看板？
```bash
# 只构建门禁看板
npm run build:dashboard

# 只构建厨房看板
npm run build:kitchen
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

- **详细构建指南**：查看 [BUILD_GUIDE.md](BUILD_GUIDE.md)
- **下载APK**：访问本项目的 [Releases](../../releases) 页面
- **查看构建**：访问 [Actions](../../actions) 标签页
- **报告问题**：提交 [Issue](../../issues)
- **代码检查报告**：查看 [CODE_REVIEW.md](CODE_REVIEW.md)

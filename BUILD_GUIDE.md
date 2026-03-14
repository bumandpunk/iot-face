# 双看板构建指南

本项目支持构建两个独立的 APK，每个 APK 包含一个独立的看板界面。

## 📱 两个看板

### 1. 门禁看板 (Dashboard)
- **文件**: `src/App.vue`
- **入口**: `src/main-dashboard.js`
- **HTML**: `index.html`
- **功能**: 门禁打卡、空间分析、流量统计、人员进出提醒

### 2. 厨房考勤看板 (Kitchen)
- **文件**: `src/KitchenBoard.vue`
- **入口**: `src/main-kitchen.js`
- **HTML**: `kitchen.html`
- **功能**: 厨房考勤、任务管理、人员签到

---

## 🚀 本地开发

### 开发门禁看板
```bash
npm run dev
# 访问 http://localhost:3000
```

### 开发厨房看板
```bash
npm run dev:kitchen
# 访问 http://localhost:3000/kitchen.html
```

---

## 📦 本地构建 APK

### 前置要求
- Node.js 18+
- Java 17+
- Android SDK

### 构建门禁看板 APK
```bash
# 1. 安装依赖
npm install

# 2. 构建门禁看板
npm run build:dashboard

# 3. 打开 Android Studio 构建 APK
cd android
./gradlew assembleDebug

# APK 位置: android/app/build/outputs/apk/debug/app-debug.apk
# 重命名为: dashboard-debug.apk
```

### 构建厨房看板 APK
```bash
# 1. 构建厨房看板
npm run build:kitchen

# 2. 打开 Android Studio 构建 APK
cd android
./gradlew assembleDebug

# APK 位置: android/app/build/outputs/apk/debug/app-debug.apk
# 重命名为: kitchen-debug.apk
```

### 一键构建两个看板
```bash
npm run build:both
```

---

## 🤖 GitHub Actions 自动构建

### 触发方式

#### 1. 推送代码自动构建
```bash
git add .
git commit -m "更新看板"
git push
```

推送到 `main` 或 `master` 分支后，GitHub Actions 会自动：
1. 构建门禁看板 APK
2. 构建厨房看板 APK
3. 创建 Release 并上传两个 APK

#### 2. 手动触发构建
1. 访问 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择 `Build Dual APK` workflow
4. 点击 `Run workflow` 按钮

### 下载 APK

#### 方法 1: 从 Artifacts 下载（推送后立即可用）
1. 访问 `Actions` 标签
2. 点击最新的 workflow 运行
3. 在 `Artifacts` 区域下载：
   - `dashboard-apk` - 门禁看板
   - `kitchen-apk` - 厨房考勤看板

#### 方法 2: 从 Releases 下载（推送到主分支后）
1. 访问 `Releases` 页面
2. 下载最新版本的 APK：
   - `dashboard-debug.apk` - 门禁看板
   - `kitchen-debug.apk` - 厨房考勤看板

---

## ⚙️ 配置说明

### 环境变量配置

编辑 `.env.production` 文件：

```env
# 门禁看板配置
VITE_API_BASE_URL=http://你的后端IP:端口/api
VITE_SSE_URL=http://你的后端IP:端口/api/sse/connect

# 厨房看板配置
VITE_KITCHEN_SSE_URL=http://你的后端IP:端口/api/sse/kitchen
VITE_KITCHEN_API_URL=http://你的后端IP:端口/api/kitchen
```

### Capacitor 配置

两个看板使用不同的配置文件：

- **门禁看板**: `capacitor.config.dashboard.json`
  - App ID: `com.iotface.dashboard`
  - App Name: `门神域`
  
- **厨房看板**: `capacitor.config.kitchen.json`
  - App ID: `com.iotface.kitchen`
  - App Name: `厨房考勤看板`

---

## 📂 项目结构

```
iot-face/
├── src/
│   ├── App.vue                    # 门禁看板组件
│   ├── KitchenBoard.vue           # 厨房看板组件
│   ├── main-dashboard.js          # 门禁看板入口
│   ├── main-kitchen.js            # 厨房看板入口
│   └── components/
│       └── FlowChart.vue          # 流量图表组件
├── index.html                     # 门禁看板 HTML
├── kitchen.html                   # 厨房看板 HTML
├── capacitor.config.dashboard.json # 门禁看板配置
├── capacitor.config.kitchen.json   # 厨房看板配置
├── build-dashboard.js             # 门禁看板构建脚本
├── build-kitchen.js               # 厨房看板构建脚本
├── .github/workflows/
│   └── build-dual-apk.yml         # 双APK构建工作流
└── android/                       # Android 项目
```

---

## 🔧 构建脚本说明

### package.json 脚本

```json
{
  "scripts": {
    "dev": "vite",                          // 开发门禁看板
    "dev:kitchen": "vite",                  // 开发厨房看板
    "build": "vite build",                  // 构建所有页面
    "build:dashboard": "node build-dashboard.js",  // 构建门禁看板
    "build:kitchen": "node build-kitchen.js",      // 构建厨房看板
    "build:both": "npm run build:dashboard && npm run build:kitchen"  // 构建两个看板
  }
}
```

### 构建流程

1. **Vite 构建**: 生成 `dist/` 目录，包含两个 HTML 文件
2. **资源分离**: 
   - 门禁看板 → `dist-dashboard/`
   - 厨房看板 → `dist-kitchen/`
3. **Capacitor 同步**: 将资源同步到 Android 项目
4. **Gradle 构建**: 生成 APK 文件

---

## 🐛 常见问题

### 1. 构建失败：找不到 fs-extra
```bash
npm install fs-extra --save
```

### 2. GitHub Actions 构建失败
- 检查 `.env.production` 文件是否存在
- 确保所有依赖都在 `package.json` 中

### 3. APK 安装后无法连接后端
- 检查 `.env.production` 中的 IP 地址
- 确保设备和后端在同一网络
- 检查后端防火墙设置

### 4. 两个 APK 包名冲突
两个 APK 使用不同的 App ID，可以同时安装：
- 门禁看板: `com.iotface.dashboard`
- 厨房看板: `com.iotface.kitchen`

---

## 📝 修改后端地址

### 方法 1: 修改配置文件
1. 编辑 `.env.production`
2. 修改对应的 URL
3. 提交并推送代码
4. GitHub Actions 自动构建新 APK

### 方法 2: 本地重新构建
1. 修改 `.env.production`
2. 运行 `npm run build:dashboard` 或 `npm run build:kitchen`
3. 手动构建 APK

---

## 🎯 后端接口要求

### 门禁看板接口
- **SSE 连接**: `GET /api/sse/connect`
- **事件类型**: `dashboard-data-popup`

### 厨房看板接口
- **SSE 连接**: `GET /api/sse/kitchen`
- **事件类型**: `kitchen-data`

详细接口格式见代码注释。

---

## 📄 许可证

MIT License

# 门禁看板系统

基于 Vue 3 的智能门禁打卡看板，支持 Web 和 Android TV。

![Build Status](https://github.com/你的用户名/iot-face/workflows/Build%20Android%20APK/badge.svg)

## 🌟 功能特性

- 📊 **实时统计**：出勤率、空间使用率、在域人员数
- 📈 **流量分析**：全天进出人员趋势图表  
- 👋 **人员提示**：刷脸进出实时弹窗提醒
- ⚠️ **异常预警**：违规和验证警报实时显示
- 🔌 **SSE长连接**：与后端实时通讯
- 📱 **跨平台**：支持Web浏览器和Android TV

## 🚀 快速开始

### Web 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 浏览器访问
http://localhost:3000
```

### 📱 获取Android APK

#### 方法1：GitHub Actions自动构建（推荐）

1. **Fork或上传项目到GitHub**

2. **配置后端地址**  
   编辑 `.env.production`：
   ```env
   VITE_SSE_URL=http://你的后端IP:端口/api/sse/connect
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
   - 下载 `app-debug` artifact
   - 解压得到 `app-debug.apk`

5. **或从Releases下载**
   - 访问 `Releases` 页面
   - 下载最新版本的APK

#### 方法2：手动触发构建

1. 访问GitHub仓库的 `Actions` 标签
2. 选择 `Build Android APK` workflow
3. 点击 `Run workflow` 按钮
4. 等待构建完成（约5-10分钟）
5. 下载生成的APK

#### 方法3：本地命令行构建

需要Java 17+：
```bash
npm run build
npx cap sync
cd android
./gradlew assembleDebug
```

## ⚙️ 配置说明

### 开发环境配置
开发时使用Vite代理，无需配置。后端地址在 `vite.config.js` 中修改。

### 生产环境配置（APK打包）
编辑 `.env.production`：
```env
VITE_API_BASE_URL=http://10.10.50.2:6160/api
VITE_SSE_URL=http://10.10.50.2:6160/api/sse/connect
```

## 🔌 后端接口规范

### SSE 连接
**接口**：`GET /api/sse/connect`  
**事件类型**：`event: dashboard-data`

**消息格式**：
```javascript
{
  "timestamp": 1768967159958,
  "metrics": {
    "totalUsers": 1265,      // 总用户数
    "activeUsers": 216,      // 活跃用户数
    "onlineUsers": 42        // 在线用户数
  }
}
```

支持的其他消息类型：
- `person_enter` - 人员进入
- `person_exit` - 人员离开  
- `alert` - 异常警告

详细接口文档见代码注释。

## 📱 电视安装

### U盘安装（推荐）
1. 将APK复制到U盘
2. U盘插入电视
3. 使用文件管理器安装

### ADB安装
```bash
adb connect 电视IP:5555
adb install -r app-debug.apk
```

### 首次运行
1. 开启"未知来源"安装权限
2. 确保电视和后端在同一局域网
3. 启动应用即可自动连接

## 🎨 界面说明

- **左侧**：统计数据卡片（出勤、空间使用率等）
- **右侧**：异常警告记录（实时滚动）
- **底部**：流量趋势图表（ECharts）
- **弹窗**：人员进出提醒（3秒自动关闭）

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
│       └── build-apk.yml       # GitHub Actions配置
├── src/
│   ├── App.vue                 # 主应用组件
│   ├── main.js                 # 入口文件
│   ├── style.css               # 全局样式
│   ├── components/
│   │   └── FlowChart.vue       # 流量图表组件
│   ├── api/
│   │   └── sse.js              # SSE管理器
│   └── config/
│       └── index.js            # 配置文件
├── android/                    # Android项目
├── dist/                       # 构建输出
├── .env.production             # 生产环境配置
├── capacitor.config.json       # Capacitor配置
└── vite.config.js              # Vite配置
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

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

- **下载APK**：访问本项目的 [Releases](../../releases) 页面
- **查看构建**：访问 [Actions](../../actions) 标签页
- **报告问题**：提交 [Issue](../../issues)

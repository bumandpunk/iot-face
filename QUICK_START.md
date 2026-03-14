# 🚀 快速启动指南

## 5分钟上手双看板系统

### 第一步：安装依赖

```bash
npm install
```

### 第二步：配置后端地址

编辑 `.env.production` 文件：

```env
# 门禁看板 - 修改为你的后端地址
VITE_SSE_URL=http://你的IP:端口/api/sse/connect

# 厨房看板 - 修改为你的后端地址
VITE_KITCHEN_SSE_URL=http://你的IP:端口/api/sse/kitchen
```

### 第三步：本地预览

```bash
# 预览门禁看板
npm run dev
# 浏览器打开 http://localhost:3000

# 预览厨房看板
npm run dev
# 浏览器打开 http://localhost:3000/kitchen.html
```

### 第四步：构建 APK

#### 方案A：GitHub Actions 自动构建（推荐）

```bash
# 1. 提交代码
git add .
git commit -m "配置后端地址"
git push

# 2. 等待 5-10 分钟

# 3. 下载 APK
# 访问 GitHub 仓库 → Actions → 下载 artifacts
# 或访问 Releases 页面下载
```

#### 方案B：本地构建

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

### 第五步：安装到设备

```bash
# 通过 ADB 安装
adb install -r dashboard-debug.apk
adb install -r kitchen-debug.apk

# 或通过 U盘安装
# 1. 复制 APK 到 U盘
# 2. U盘插入电视
# 3. 使用文件管理器安装
```

---

## 📱 两个看板的区别

| 特性 | 门禁看板 | 厨房看板 |
|------|---------|---------|
| **包名** | com.iotface.dashboard | com.iotface.kitchen |
| **应用名** | 门神域 | 厨房考勤看板 |
| **主要功能** | 门禁打卡、流量分析 | 考勤统计、任务管理 |
| **SSE接口** | /api/sse/connect | /api/sse/kitchen |
| **UI主题** | 蓝紫色 | 金棕色 |

---

## 🔧 常用命令

```bash
# 开发
npm run dev              # 门禁看板开发
npm run dev:kitchen      # 厨房看板开发

# 构建
npm run build:dashboard  # 构建门禁看板
npm run build:kitchen    # 构建厨房看板
npm run build:both       # 构建两个看板

# 测试
./test-build.sh          # 验证配置

# 预览
npm run preview          # 预览构建结果
```

---

## ⚠️ 注意事项

1. **后端地址配置**
   - 开发环境：自动使用代理，无需配置
   - 生产环境：必须在 `.env.production` 中配置实际 IP

2. **两个 APK 可以同时安装**
   - 使用不同的包名，互不冲突
   - 可以在同一设备上运行

3. **首次运行**
   - 确保设备和后端在同一局域网
   - 检查后端防火墙设置
   - 开启"未知来源"安装权限

4. **GitHub Actions**
   - 推送到 main/master 分支自动构建
   - 也可以手动触发构建
   - 构建时间约 5-10 分钟

---

## 🐛 遇到问题？

### 构建失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 连接不上后端
```bash
# 检查配置
cat .env.production

# 测试后端连接
curl http://你的IP:端口/api/sse/connect
```

### APK 安装失败
- 检查设备系统版本（需要 Android 5.0+）
- 开启"未知来源"安装权限
- 尝试卸载旧版本后重新安装

---

## 📚 更多文档

- [BUILD_GUIDE.md](BUILD_GUIDE.md) - 详细构建指南
- [DUAL_BOARD_SETUP.md](DUAL_BOARD_SETUP.md) - 双看板配置说明
- [CODE_REVIEW.md](CODE_REVIEW.md) - 代码检查报告
- [README.md](README.md) - 完整项目文档

---

## 🎯 下一步

1. ✅ 配置后端地址
2. ✅ 本地测试两个看板
3. ✅ 推送代码到 GitHub
4. ✅ 下载并安装 APK
5. ✅ 在设备上测试

祝你使用愉快！🎉

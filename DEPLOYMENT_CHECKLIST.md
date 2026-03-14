# 📋 部署检查清单

在推送代码到 GitHub 之前，请确认以下事项：

## ✅ 代码完整性

- [x] 门禁看板组件 (`src/App.vue`)
- [x] 厨房看板组件 (`src/KitchenBoard.vue`)
- [x] 门禁看板入口 (`src/main-dashboard.js`)
- [x] 厨房看板入口 (`src/main-kitchen.js`)
- [x] 门禁看板 HTML (`index.html`)
- [x] 厨房看板 HTML (`kitchen.html`)
- [x] 构建脚本 (`build-dashboard.js`, `build-kitchen.js`)
- [x] Capacitor 配置 (`capacitor.config.dashboard.json`, `capacitor.config.kitchen.json`)
- [x] GitHub Actions 工作流 (`.github/workflows/build-dual-apk.yml`)

## ✅ 配置文件

- [x] `package.json` - 已添加新的构建脚本
- [x] `vite.config.js` - 已配置多入口构建
- [x] `.env.production` - 已添加厨房看板配置
- [x] `.env.example` - 已更新示例配置
- [x] `.gitignore` - 已添加新的构建目录

## ✅ 文档

- [x] `README.md` - 已更新双看板说明
- [x] `BUILD_GUIDE.md` - 详细构建指南
- [x] `DUAL_BOARD_SETUP.md` - 双看板配置说明
- [x] `QUICK_START.md` - 快速启动指南
- [x] `CODE_REVIEW.md` - 代码检查报告
- [x] `DEPLOYMENT_CHECKLIST.md` - 本文档

## ⚙️ 环境配置

### 必须配置的环境变量

在 `.env.production` 中：

```env
# 门禁看板（必填）
VITE_SSE_URL=http://你的后端IP:端口/api/sse/connect

# 厨房看板（必填）
VITE_KITCHEN_SSE_URL=http://你的后端IP:端口/api/sse/kitchen
```

- [ ] 已将 IP 地址替换为实际后端地址
- [ ] 已测试后端接口可访问
- [ ] 已确认 SSE 事件类型正确

## 🧪 本地测试

### 开发模式测试

```bash
# 测试门禁看板
npm run dev
# 访问 http://localhost:3000

# 测试厨房看板
npm run dev
# 访问 http://localhost:3000/kitchen.html
```

- [ ] 门禁看板可以正常显示
- [ ] 厨房看板可以正常显示
- [ ] SSE 连接正常
- [ ] 数据更新正常
- [ ] 无控制台错误

### 构建测试

```bash
# 运行配置检查
./test-build.sh

# 测试构建（可选）
npm run build:dashboard
npm run build:kitchen
```

- [ ] 配置检查通过
- [ ] 构建无错误
- [ ] 生成了 dist-dashboard 和 dist-kitchen 目录

## 📦 依赖检查

```bash
npm install
```

- [ ] 所有依赖安装成功
- [ ] `fs-extra` 已安装
- [ ] `echarts` 和 `vue-echarts` 已安装
- [ ] 无依赖冲突警告

## 🔐 安全检查

- [ ] `.env.production` 中没有敏感信息（如密码、密钥）
- [ ] 只包含内网 IP 地址
- [ ] 已确认 `.env` 在 `.gitignore` 中

## 📱 Android 配置

### Capacitor 配置检查

- [x] `capacitor.config.dashboard.json` - App ID: `com.iotface.dashboard`
- [x] `capacitor.config.kitchen.json` - App ID: `com.iotface.kitchen`
- [x] 两个配置使用不同的 App ID
- [x] webDir 指向正确的目录

### Android 项目检查

- [ ] `android/` 目录存在
- [ ] Gradle 配置正常
- [ ] 可以正常构建（如果本地测试）

## 🚀 GitHub Actions 准备

### 工作流文件检查

- [x] `.github/workflows/build-dual-apk.yml` 存在
- [x] 配置了两个独立的构建 job
- [x] 配置了 Release 创建
- [x] 使用正确的 Node.js 和 Java 版本

### GitHub 仓库设置

- [ ] 代码已推送到 GitHub
- [ ] 仓库设置中启用了 Actions
- [ ] 有权限创建 Releases
- [ ] `GITHUB_TOKEN` 权限正常

## 📝 提交前最后检查

```bash
# 查看修改的文件
git status

# 查看具体改动
git diff

# 添加所有文件
git add .

# 提交
git commit -m "feat: 添加厨房考勤看板，支持双APK构建"

# 推送
git push origin main
```

### 提交信息建议

```
feat: 添加厨房考勤看板，支持双APK构建

- 新增厨房考勤看板组件 (KitchenBoard.vue)
- 配置多入口构建系统
- 添加独立的 Capacitor 配置
- 创建 GitHub Actions 双APK构建工作流
- 更新文档和构建指南

两个看板可独立打包为不同的 APK：
- dashboard-debug.apk (门禁看板)
- kitchen-debug.apk (厨房考勤看板)
```

## 🎯 推送后验证

### 1. 检查 GitHub Actions

- [ ] 访问仓库的 Actions 标签
- [ ] 确认工作流已触发
- [ ] 等待构建完成（约 5-10 分钟）
- [ ] 检查构建日志无错误

### 2. 下载 APK

#### 从 Artifacts 下载
- [ ] 点击工作流运行
- [ ] 在 Artifacts 区域找到 `dashboard-apk` 和 `kitchen-apk`
- [ ] 下载并解压

#### 从 Releases 下载（如果推送到主分支）
- [ ] 访问 Releases 页面
- [ ] 找到最新的 Release
- [ ] 下载 `dashboard-debug.apk` 和 `kitchen-debug.apk`

### 3. 安装测试

```bash
# 通过 ADB 安装
adb install -r dashboard-debug.apk
adb install -r kitchen-debug.apk
```

- [ ] 门禁看板 APK 安装成功
- [ ] 厨房看板 APK 安装成功
- [ ] 两个应用可以同时运行
- [ ] 应用图标和名称正确
- [ ] 连接后端正常
- [ ] 数据显示正常

## 🐛 常见问题排查

### 构建失败

1. 检查 `.env.production` 是否存在
2. 检查 `package.json` 中的脚本
3. 检查 GitHub Actions 日志
4. 确认所有依赖都在 `package.json` 中

### APK 无法连接后端

1. 检查 `.env.production` 中的 IP 地址
2. 确认设备和后端在同一网络
3. 检查后端防火墙设置
4. 使用 `curl` 测试后端接口

### 两个 APK 冲突

- 确认使用了不同的 App ID
- 卸载旧版本后重新安装
- 检查 Capacitor 配置文件

## ✨ 部署成功标志

- ✅ 代码成功推送到 GitHub
- ✅ GitHub Actions 构建成功
- ✅ 生成了两个独立的 APK
- ✅ APK 可以正常安装
- ✅ 应用可以连接后端
- ✅ 数据显示正常
- ✅ 无崩溃和错误

---

## 📞 需要帮助？

如果遇到问题，请查看：

1. [QUICK_START.md](QUICK_START.md) - 快速启动指南
2. [BUILD_GUIDE.md](BUILD_GUIDE.md) - 详细构建指南
3. [DUAL_BOARD_SETUP.md](DUAL_BOARD_SETUP.md) - 双看板配置说明
4. [CODE_REVIEW.md](CODE_REVIEW.md) - 代码检查报告

或在 GitHub 仓库提交 Issue。

---

**祝部署顺利！🎉**

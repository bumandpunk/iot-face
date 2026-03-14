# 双看板配置完成总结

## ✅ 已完成的工作

### 1. 创建了新的厨房考勤看板
- **文件**: `src/KitchenBoard.vue`
- **功能**: 
  - 考勤统计（应到岗/实到岗、出勤率）
  - 任务管理（已完成、进行中、待开始）
  - 人员签到实时显示
  - SSE 实时数据推送

### 2. 创建了独立的入口文件
- `src/main-dashboard.js` - 门禁看板入口
- `src/main-kitchen.js` - 厨房看板入口
- `index.html` - 门禁看板 HTML
- `kitchen.html` - 厨房看板 HTML

### 3. 配置了多入口构建
- 修改了 `vite.config.js` 支持多入口
- 创建了独立的 Capacitor 配置：
  - `capacitor.config.dashboard.json` (com.iotface.dashboard)
  - `capacitor.config.kitchen.json` (com.iotface.kitchen)

### 4. 创建了构建脚本
- `build-dashboard.js` - 门禁看板构建脚本
- `build-kitchen.js` - 厨房看板构建脚本
- 更新了 `package.json` 添加新的构建命令

### 5. 配置了 GitHub Actions
- `.github/workflows/build-dual-apk.yml`
- 自动构建两个独立的 APK
- 自动创建 Release 并上传

### 6. 更新了文档
- `README.md` - 添加双看板说明
- `BUILD_GUIDE.md` - 详细构建指南
- `DUAL_BOARD_SETUP.md` - 本文档
- `CODE_REVIEW.md` - 代码检查报告

### 7. 更新了环境变量
- `.env.production` - 添加厨房看板配置
- `.env.example` - 添加示例配置

---

## 📋 新增的 npm 脚本

```json
{
  "dev:kitchen": "vite --mode development",
  "build:dashboard": "node build-dashboard.js",
  "build:kitchen": "node build-kitchen.js",
  "build:both": "npm run build:dashboard && npm run build:kitchen"
}
```

---

## 🎯 使用方法

### 本地开发

```bash
# 开发门禁看板
npm run dev
# 访问 http://localhost:3000

# 开发厨房看板
npm run dev:kitchen
# 访问 http://localhost:3000/kitchen.html
```

### 本地构建

```bash
# 安装依赖（首次）
npm install

# 构建门禁看板
npm run build:dashboard

# 构建厨房看板
npm run build:kitchen

# 一次构建两个
npm run build:both
```

### GitHub Actions 自动构建

1. 推送代码到 GitHub
2. 自动触发构建
3. 从 Actions 下载 artifacts 或从 Releases 下载

---

## 📱 生成的 APK

### 门禁看板 APK
- **文件名**: `dashboard-debug.apk`
- **包名**: `com.iotface.dashboard`
- **应用名**: `门神域`
- **功能**: 门禁打卡、空间分析、流量统计

### 厨房看板 APK
- **文件名**: `kitchen-debug.apk`
- **包名**: `com.iotface.kitchen`
- **应用名**: `厨房考勤看板`
- **功能**: 厨房考勤、任务管理

两个 APK 可以同时安装在同一设备上，互不冲突。

---

## 🔌 后端接口要求

### 门禁看板
```
GET /api/sse/connect
Event: dashboard-data-popup
```

### 厨房看板
```
GET /api/sse/kitchen
Event: kitchen-data
```

详细数据格式见 `README.md` 和代码注释。

---

## ⚙️ 配置文件说明

### .env.production
```env
# 门禁看板
VITE_SSE_URL=http://10.10.30.249:30345/api/sse/connect

# 厨房看板
VITE_KITCHEN_SSE_URL=http://10.10.30.249:30345/api/sse/kitchen
VITE_KITCHEN_API_URL=http://10.10.30.249:30345/api/kitchen
```

### capacitor.config.dashboard.json
```json
{
  "appId": "com.iotface.dashboard",
  "appName": "门神域",
  "webDir": "dist-dashboard"
}
```

### capacitor.config.kitchen.json
```json
{
  "appId": "com.iotface.kitchen",
  "appName": "厨房考勤看板",
  "webDir": "dist-kitchen"
}
```

---

## 🧪 测试配置

运行测试脚本检查配置：

```bash
./test-build.sh
```

这会检查：
- 所有必要文件是否存在
- package.json 脚本是否配置
- 依赖是否安装
- 环境变量是否配置

---

## 📂 构建输出目录

```
iot-face/
├── dist/                    # Vite 构建输出（包含两个 HTML）
├── dist-dashboard/          # 门禁看板 Capacitor 资源
│   ├── index.html
│   └── assets/
└── dist-kitchen/            # 厨房看板 Capacitor 资源
    ├── index.html
    └── assets/
```

---

## 🚀 GitHub Actions 工作流

### 工作流程
1. **build-dashboard** job
   - 安装依赖
   - 构建门禁看板
   - 生成 APK
   - 上传 artifact

2. **build-kitchen** job
   - 安装依赖
   - 构建厨房看板
   - 生成 APK
   - 上传 artifact

3. **create-release** job
   - 下载两个 APK
   - 创建 Release
   - 上传到 Releases

### 触发条件
- Push 到 main/master 分支
- Pull Request
- 手动触发 (workflow_dispatch)

---

## 🎨 UI 设计对比

### 门禁看板
- 深蓝紫色渐变背景
- 左侧统计卡片 + 右侧告警列表
- 底部流量图表
- 人员进出弹窗

### 厨房看板
- 深棕色渐变背景（厨房主题）
- 顶部统计卡片 + 人员签到
- 三列任务列表（已完成/进行中/待开始）
- 金色主题色调

---

## 📝 下一步建议

### 1. 测试
- [ ] 本地测试两个看板的开发模式
- [ ] 本地构建两个 APK
- [ ] 在设备上安装测试

### 2. 后端对接
- [ ] 确认厨房看板 SSE 接口
- [ ] 测试数据格式
- [ ] 调整数据映射

### 3. 优化
- [ ] 根据实际数据调整 UI
- [ ] 添加错误处理
- [ ] 性能优化

### 4. 部署
- [ ] 推送代码到 GitHub
- [ ] 验证 Actions 构建
- [ ] 下载并测试 APK

---

## 🔍 验证清单

在推送代码前，请确认：

- [x] 所有新文件已创建
- [x] package.json 已更新
- [x] vite.config.js 已配置多入口
- [x] .env.production 已添加厨房看板配置
- [x] GitHub Actions 工作流已创建
- [x] 文档已更新
- [ ] 本地测试通过
- [ ] 依赖已安装 (npm install)

---

## 💡 提示

1. **首次构建**: 运行 `npm install` 安装 `fs-extra` 依赖
2. **修改后端地址**: 编辑 `.env.production` 文件
3. **查看构建日志**: 检查 GitHub Actions 输出
4. **测试配置**: 运行 `./test-build.sh`
5. **详细文档**: 查看 `BUILD_GUIDE.md`

---

## 📞 支持

如有问题，请查看：
- `BUILD_GUIDE.md` - 详细构建指南
- `CODE_REVIEW.md` - 代码检查报告
- `README.md` - 项目说明

或提交 Issue 到 GitHub 仓库。

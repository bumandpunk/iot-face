# 📱 部署指南

## 🚀 使用GitHub Actions自动打包APK

### 第一步：上传到GitHub

```bash
# 1. 初始化Git仓库（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit: 门禁看板系统"

# 4. 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/iot-face.git

# 5. 推送到GitHub
git push -u origin main
```

如果推送到 `master` 分支：
```bash
git push -u origin master
```

### 第二步：配置后端地址

编辑 `.env.production` 文件：
```env
VITE_SSE_URL=http://10.10.50.2:6160/api/sse/connect
```

提交并推送：
```bash
git add .env.production
git commit -m "配置后端地址"
git push
```

### 第三步：等待构建完成

1. 访问你的GitHub仓库
2. 点击顶部的 `Actions` 标签
3. 看到 "Build Android APK" 正在运行
4. 等待5-10分钟，直到显示 ✅ 绿色对勾

### 第四步：下载APK

#### 方式1：从Actions下载
1. 点击已完成的workflow
2. 向下滚动到 `Artifacts` 区域
3. 点击下载 `app-debug`
4. 解压zip文件得到 `app-debug.apk`

#### 方式2：从Releases下载（推荐）
1. 点击仓库的 `Releases` 标签
2. 找到最新版本
3. 直接下载 `app-debug.apk`（无需解压）

### 第五步：安装到电视

1. 将 `app-debug.apk` 复制到U盘
2. U盘插入电视
3. 使用文件管理器找到APK
4. 点击安装

---

## 🔄 更新应用

### 修改代码后重新构建

```bash
# 1. 修改代码（如修改后端地址、界面样式等）

# 2. 提交并推送
git add .
git commit -m "更新：描述你的修改"
git push

# 3. GitHub Actions会自动构建新的APK
# 4. 从Releases下载新版本的APK
# 5. 重新安装到电视（会覆盖旧版本）
```

### 手动触发构建

不修改代码，只想重新构建：

1. 访问 `Actions` 标签
2. 选择 `Build Android APK` workflow
3. 点击右侧的 `Run workflow` 按钮
4. 点击绿色的 `Run workflow` 确认
5. 等待构建完成

---

## ⚙️ GitHub Actions 配置说明

### 工作流触发条件

- ✅ 推送到 `main` 或 `master` 分支
- ✅ 提交Pull Request
- ✅ 手动触发（`workflow_dispatch`）

### 构建步骤

1. **Checkout代码**：拉取最新代码
2. **安装Node.js 18**：设置Node环境
3. **安装Java 17**：Android构建需要
4. **安装依赖**：`npm ci`
5. **构建Vue**：`npm run build`
6. **同步Capacitor**：`npx cap sync android`
7. **构建APK**：`./gradlew assembleDebug`
8. **上传Artifact**：保存APK供下载（30天）
9. **创建Release**：自动创建Release（仅main/master分支）

### 构建产物

- **Artifact名称**：`app-debug`
- **保存时间**：30天
- **文件位置**：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🎯 最佳实践

### 开发流程

1. **本地开发**：使用 `npm run dev` 快速测试
2. **修改完成**：提交到GitHub
3. **自动构建**：GitHub Actions自动打包APK
4. **下载测试**：安装到电视测试
5. **发现问题**：继续修改代码
6. **重复流程**：直到满意

### 分支策略

```
main/master  ← 生产版本（自动创建Release）
  ├── dev    ← 开发分支
  └── feature-xxx  ← 功能分支
```

推荐：
- 在 `dev` 分支开发和测试
- 测试通过后合并到 `main`，自动创建Release

### 配置文件管理

**不要**提交到Git的文件：
- ❌ `android/local.properties`（本地配置）
- ❌ `android/build/`（构建产物）
- ❌ `node_modules/`（依赖）
- ❌ `.env`（本地环境变量）

**应该**提交的文件：
- ✅ `.env.production`（生产环境配置）
- ✅ `src/`（源代码）
- ✅ `package.json`（依赖声明）
- ✅ `.github/workflows/`（CI/CD配置）

---

## 📦 构建优化

### 加速构建

1. **使用npm ci替代npm install**（已配置）
2. **启用Gradle缓存**（已配置）
3. **使用Node缓存**（已配置）

### 减小APK体积

在 `vite.config.js` 中已配置：
- 代码分包
- ECharts单独打包
- 代码压缩

当前APK大小：约10-15MB

---

## 🆘 常见问题

### Q: GitHub Actions构建失败，显示Java错误
**A**: 检查 `.github/workflows/build-apk.yml` 中的Java版本配置，应该是17。

### Q: 构建成功但找不到APK
**A**: 
1. 点击workflow的详情页
2. 向下滚动到 `Artifacts` 区域
3. 点击 `app-debug` 下载

### Q: Releases页面没有APK
**A**: Release仅在推送到 `main` 或 `master` 分支时创建。其他分支只会上传到Artifacts。

### Q: 想构建Release版本（签名APK）
**A**: 需要：
1. 生成keystore
2. 将keystore添加到GitHub Secrets
3. 修改workflow配置构建release版本

### Q: 每次构建都要等10分钟太慢
**A**: 
- 第一次构建较慢（下载依赖）
- 后续构建会快很多（有缓存，约3-5分钟）
- 可以在本地开发时使用 `npm run dev` 快速测试

---

## 🎉 完成

现在你可以：
1. ✅ 推送代码到GitHub
2. ✅ 自动构建APK
3. ✅ 从Releases下载
4. ✅ 安装到电视
5. ✅ 享受自动化的便利！

不需要在本地配置Android Studio或Java环境！🎊

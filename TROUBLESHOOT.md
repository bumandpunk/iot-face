# APK 任务列表问题排查指南

## 问题描述
本地开发环境可以正常显示任务列表，但 GitHub Action 打包的 APK 安装到电视后显示"无任务"。

## 可能原因分析

### 1. 环境变量未正确注入 ⭐
**最可能的原因**：`.env.production` 文件中的环境变量没有被 Vite 正确读取。

### 2. 网络请求被阻止
Android WebView 可能阻止了 HTTPS 请求或跨域请求。

### 3. 异步加载问题
任务数据加载太慢，导致界面渲染时数据还未返回。

---

## 排查步骤

### 步骤 1: 本地测试生产构建

```bash
# 运行测试脚本
./test-production-build.sh

# 或手动执行
npm run build:prod
node verify-build.js
npx cap sync android
npx cap open android
```

**预期结果**：
- ✅ 构建成功
- ✅ 验证脚本通过
- ✅ 在 Android Studio 中构建 APK

### 步骤 2: 查看应用启动日志

安装 APK 到电视后，通过以下方式查看日志：

#### 方法 A: Chrome DevTools 远程调试（推荐）
```bash
# 1. 连接电视（USB 或网络 ADB）
adb connect <电视IP>

# 2. 在 Chrome 浏览器访问
chrome://inspect

# 3. 找到你的应用，点击 "inspect"
```

#### 方法 B: Android Studio Logcat
```bash
# 1. 连接电视
adb connect <电视IP>

# 2. 在 Android Studio 中打开 Logcat
# 3. 筛选包名: com.iotface.dashboard
```

### 步骤 3: 检查启动日志

应用启动时会输出环境信息，查找以下内容：

```
========================================
🚀 应用启动 - 环境信息
========================================
📋 MODE: production
📋 DEV: false
📋 PROD: true
📋 VITE_BUILD_ENV: production
📋 VITE_TASK_API_URL: https://tp.cewaycloud.com
========================================
```

**关键检查点**：
- `MODE` 应该是 `production`
- `VITE_BUILD_ENV` 应该是 `production`
- `VITE_TASK_API_URL` 应该有值

### 步骤 4: 检查任务接口请求日志

当有人员进入时，查找以下日志：

```
📋 ===== 任务接口请求开始 =====
📋 当前环境模式: production
📋 是否开发环境: false
📋 VITE_TASK_API_URL 原始值: https://tp.cewaycloud.com
📋 taskApiBase 最终值: https://tp.cewaycloud.com
📋 完整请求URL: https://tp.cewaycloud.com/zt/task/report/pageIndividualTaskReport?pageNum=1&pageSize=5&realName=张三
📋 请求的姓名参数: 张三
```

**关键检查点**：
- `完整请求URL` 应该包含 `https://tp.cewaycloud.com`
- 不应该出现 `undefined` 或空字符串

### 步骤 5: 查看界面调试信息

弹窗底部会显示调试信息（红色小字）：

```
🔍 调试: tasks数量=2, taskCount=2, tasks存在=true, 加载中=false
```

**判断依据**：
- `tasks数量 > 0` 但显示"无任务" → **渲染逻辑问题**
- `tasks数量 = 0` 且 `taskCount > 0` → **数据转换问题**
- `加载中 = true` 持续不变 → **接口请求卡住**
- `taskCount = 0` → **接口返回了空数据**

---

## 常见问题解决方案

### 问题 1: 环境变量为 undefined

**原因**：`.env.production` 未被加载。

**解决方案**：
1. 确认 `.env.production` 文件在项目根目录
2. 确认文件未被 `.gitignore` 排除
3. 使用 `npm run build:prod` 而不是 `npm run build`

### 问题 2: 网络请求失败

**原因**：Android 网络安全策略阻止请求。

**解决方案**：
- 已添加 `network_security_config.xml`
- 已在 `AndroidManifest.xml` 中启用 `usesCleartextTraffic`
- 重新构建 APK 即可

### 问题 3: 任务接口返回空数据

**原因**：接口可能需要认证或有其他限制。

**解决方案**：
1. 在浏览器中访问接口 URL 确认返回
2. 检查是否需要添加请求头（Cookie、Token 等）
3. 检查电视网络是否能访问外网

### 问题 4: 数据有但不渲染

**原因**：Vue 响应式数据更新问题。

**解决方案**：
- 查看 `popupData.tasks` 的实际值
- 确认 `v-if` 条件是否满足
- 检查 `isLoadingTasks` 状态

---

## 验证修复

完成修改后，按以下步骤验证：

1. ✅ 运行 `./test-production-build.sh`
2. ✅ 在 Android Studio 中构建 APK
3. ✅ 安装到电视
4. ✅ 查看启动日志确认环境变量
5. ✅ 触发人员进入，查看任务接口日志
6. ✅ 查看弹窗调试信息
7. ✅ 确认任务列表正常显示

---

## GitHub Action 调试

如果本地构建正常但 GitHub Action 构建有问题，检查 Action 日志：

### 1. 查看环境文件检查步骤
```yaml
- name: Check environment files
  run: |
    echo "=== 检查环境文件 ==="
    ls -la .env* || echo "没有找到 .env 文件"
    if [ -f .env.production ]; then
      echo "=== .env.production 内容 ==="
      cat .env.production
    fi
```

### 2. 查看构建验证步骤
```yaml
- name: Verify build output
  run: node verify-build.js
```

如果验证失败，说明环境变量未被正确注入到构建产物中。

---

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. 应用启动时的完整环境信息日志
2. 任务接口请求的完整日志
3. 界面调试信息截图
4. Chrome DevTools 中的 Network 截图
5. 接口直接访问的返回结果

这样可以更准确地定位问题！

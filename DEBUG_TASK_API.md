# 任务API调试指南

## 问题现象
在本地开发环境下，人员进入时任务弹窗能正常显示任务列表，但打包成APK安装到电视后，无论用户是否有任务都显示"没有任务"提示。

## 可能原因分析

### 1. 网络连接问题 ⚠️ (最常见)
- **症状**: 电视无法访问外网或网络不稳定
- **检查方法**: 
  - 在电视浏览器中尝试访问 `https://tp.cewaycloud.com`
  - 检查电视的网络设置，确认已连接WiFi且能访问外网
- **解决方案**: 确保电视网络正常

### 2. HTTPS证书信任问题 🔒
- **症状**: SSL/TLS握手失败，fetch请求返回 `TypeError: Failed to fetch`
- **原因**: 
  - `tp.cewaycloud.com` 的SSL证书不被Android系统信任
  - 可能是自签名证书或内部CA证书
- **已采取的措施**:
  - 更新了 `network_security_config.xml`，添加了对用户证书的信任
  - 添加了 `debug-overrides` 配置
- **进一步解决方案**:
  - 如果是自签名证书，需要将证书添加到电视的信任列表
  - 或者联系后端团队更换为公共CA签发的证书

### 3. CORS跨域问题 🌐
- **症状**: 浏览器控制台显示CORS错误
- **原因**: 服务器未设置正确的CORS响应头
- **解决方案**: 后端需要添加以下响应头:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: Content-Type
  ```

### 4. 环境变量未正确注入 ⚙️
- **症状**: 请求的URL不正确或为undefined
- **检查方法**: 查看控制台日志中的 "VITE_TASK_API_URL" 值
- **解决方案**: 确保 `.env.production` 文件存在且配置正确

## 调试步骤

### 步骤1: 使用内置诊断工具
1. 在电视上打开APK
2. 点击右上角的 🔍 调试按钮
3. 查看弹出的提示信息
4. **重要**: 通过 Chrome 远程调试查看详细控制台输出

### 步骤2: Chrome 远程调试（推荐）
```bash
# 1. 确保电视和电脑在同一网络
# 2. 电视开启开发者模式和USB调试
# 3. 用USB连接电视和电脑
# 4. 电脑打开Chrome，访问: chrome://inspect
# 5. 在设备列表中找到你的应用，点击 "inspect"
# 6. 查看Console标签页的日志输出
```

### 步骤3: 分析日志输出
查看以下关键日志:
```
📋 ===== 任务接口请求开始 =====
📋 VITE_TASK_API_URL 原始值: https://tp.cewaycloud.com
📋 完整请求URL: https://tp.cewaycloud.com/zt/task/report/pageIndividualTaskReport?...
📋 开始发送 fetch 请求...
```

**成功的情况**:
```
📋 任务接口响应成功
📋 响应状态: 200 OK
```

**失败的情况**:
```
❌ ===== 获取任务列表失败 =====
❌ 错误类型: TypeError
❌ 错误消息: Failed to fetch
```

### 步骤4: 根据错误类型处理

#### 错误: "Failed to fetch"
**最可能的原因**: 网络问题或HTTPS证书问题

**解决方案**:
1. 检查电视网络连接
2. 尝试在电视浏览器访问 API 地址
3. 如果是证书问题，考虑以下方案:
   - 方案A: 将 HTTPS 改为 HTTP (仅测试环境)
   - 方案B: 安装证书到电视系统
   - 方案C: 使用反向代理（如Nginx）转换为本地请求

#### 错误: "Request timeout"
**原因**: 网络延迟过高或服务器无响应

**解决方案**:
1. 检查服务器状态
2. 增加超时时间（当前为10秒）
3. 检查网络速度

#### 错误: HTTP 4xx/5xx
**原因**: 服务器端问题

**解决方案**:
1. 检查API接口是否正常
2. 确认参数格式是否正确
3. 查看服务器日志

## 临时解决方案

### 方案1: 使用HTTP代替HTTPS (仅开发/测试)
修改 `.env.production`:
```env
VITE_TASK_API_URL=http://tp.cewaycloud.com
```
注意: 需要确认服务器支持HTTP访问

### 方案2: 通过本地代理服务器
在同网段部署一个代理服务器，将HTTPS请求转换为本地HTTP请求:
```javascript
// 修改 .env.production
VITE_TASK_API_URL=http://10.10.50.2:6160/task-proxy
```

### 方案3: 禁用证书验证 (不推荐，仅用于诊断)
这需要修改Android WebView的配置，不推荐在生产环境使用。

## 重新打包测试

修改代码后，重新打包:
```bash
# 1. 清理并构建
npm run build:prod

# 2. 验证构建产物
node verify-build.js

# 3. 同步到Android
npx cap sync android

# 4. 在Android Studio中构建APK
npx cap open android
```

## 生产环境清理

确认问题解决后，记得移除调试代码:
1. 删除头部的🔍调试按钮
2. 移除弹窗中的调试信息 (174-177行)
3. 简化控制台日志输出

## 联系支持

如果以上方法都无法解决问题，请提供:
1. Chrome远程调试的完整控制台日志
2. 电视型号和Android版本
3. `.env.production` 文件内容
4. 网络拓扑图（电视如何连接到外网）

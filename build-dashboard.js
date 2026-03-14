import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'

console.log('🚀 开始构建门禁看板...')

try {
  // 1. 构建 Vite 项目
  console.log('📦 构建前端资源...')
  execSync('vite build --mode production', { stdio: 'inherit' })

  // 2. 创建 dist-dashboard 目录
  console.log('📁 准备 Capacitor 资源...')
  if (fs.existsSync('dist-dashboard')) {
    fs.removeSync('dist-dashboard')
  }
  fs.mkdirSync('dist-dashboard')

  // 3. 复制 index.html 和相关资源
  fs.copySync('dist/index.html', 'dist-dashboard/index.html')
  fs.copySync('dist/assets', 'dist-dashboard/assets')
  
  // 复制其他必要文件
  if (fs.existsSync('dist/cordova.js')) {
    fs.copySync('dist/cordova.js', 'dist-dashboard/cordova.js')
  }
  if (fs.existsSync('dist/cordova_plugins.js')) {
    fs.copySync('dist/cordova_plugins.js', 'dist-dashboard/cordova_plugins.js')
  }

  // 4. 同步到 Capacitor
  console.log('🔄 同步到 Capacitor...')
  execSync('npx cap sync android --config capacitor.config.dashboard.json', { stdio: 'inherit' })

  console.log('✅ 门禁看板构建完成！')
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'

console.log('🚀 开始构建厨房看板...')

try {
  // 1. 构建 Vite 项目
  console.log('📦 构建前端资源...')
  execSync('vite build --mode production', { stdio: 'inherit' })

  // 2. 创建 dist-kitchen 目录
  console.log('📁 准备 Capacitor 资源...')
  if (fs.existsSync('dist-kitchen')) {
    fs.removeSync('dist-kitchen')
  }
  fs.mkdirSync('dist-kitchen')

  // 3. 复制 kitchen.html 作为 index.html 和相关资源
  fs.copySync('dist/kitchen.html', 'dist-kitchen/index.html')
  fs.copySync('dist/assets', 'dist-kitchen/assets')
  
  // 复制其他必要文件
  if (fs.existsSync('dist/cordova.js')) {
    fs.copySync('dist/cordova.js', 'dist-kitchen/cordova.js')
  }
  if (fs.existsSync('dist/cordova_plugins.js')) {
    fs.copySync('dist/cordova_plugins.js', 'dist-kitchen/cordova_plugins.js')
  }

  // 4. 同步到 Capacitor
  console.log('🔄 同步到 Capacitor...')
  execSync('npx cap sync android --config capacitor.config.kitchen.json', { stdio: 'inherit' })

  console.log('✅ 厨房看板构建完成！')
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

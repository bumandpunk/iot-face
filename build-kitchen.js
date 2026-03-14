import { execSync } from 'child_process'
import fs from 'fs-extra'

console.log('🚀 开始构建厨房看板...')

try {
  // 1. 构建 Vite 项目
  console.log('📦 构建前端资源...')
  execSync('vite build --mode production', { stdio: 'inherit' })

  // 2. 准备 dist-kitchen 目录（kitchen.html 作为 index.html）
  console.log('📁 准备 Capacitor 资源...')
  fs.removeSync('dist-kitchen')
  fs.mkdirSync('dist-kitchen')
  fs.copySync('dist/kitchen.html', 'dist-kitchen/index.html')
  fs.copySync('dist/assets', 'dist-kitchen/assets')
  if (fs.existsSync('dist/cordova.js')) fs.copySync('dist/cordova.js', 'dist-kitchen/cordova.js')
  if (fs.existsSync('dist/cordova_plugins.js')) fs.copySync('dist/cordova_plugins.js', 'dist-kitchen/cordova_plugins.js')

  // 3. 临时替换 capacitor.config.json，同步后还原
  console.log('🔄 同步到 Capacitor...')
  const originalConfig = fs.readFileSync('capacitor.config.json', 'utf-8')
  fs.copySync('capacitor.config.kitchen.json', 'capacitor.config.json')
  try {
    execSync('npx cap sync android', { stdio: 'inherit' })
  } finally {
    fs.writeFileSync('capacitor.config.json', originalConfig) // 无论成功失败都还原
  }

  console.log('✅ 厨房看板构建完成！')
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

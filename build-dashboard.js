import { execSync } from 'child_process'
import fs from 'fs-extra'

console.log('🚀 开始构建门禁看板...')

try {
  // 1. 构建 Vite 项目
  console.log('📦 构建前端资源...')
  execSync('vite build --mode production', { stdio: 'inherit' })

  // 2. 准备 dist-dashboard 目录
  console.log('📁 准备 Capacitor 资源...')
  fs.removeSync('dist-dashboard')
  fs.mkdirSync('dist-dashboard')
  fs.copySync('dist/index.html', 'dist-dashboard/index.html')
  fs.copySync('dist/assets', 'dist-dashboard/assets')
  if (fs.existsSync('dist/cordova.js')) fs.copySync('dist/cordova.js', 'dist-dashboard/cordova.js')
  if (fs.existsSync('dist/cordova_plugins.js')) fs.copySync('dist/cordova_plugins.js', 'dist-dashboard/cordova_plugins.js')

  // 3. 临时替换 capacitor.config.json，同步后还原
  console.log('🔄 同步到 Capacitor...')
  const originalConfig = fs.readFileSync('capacitor.config.json', 'utf-8')
  fs.copySync('capacitor.config.dashboard.json', 'capacitor.config.json')
  try {
    execSync('npx cap sync android', { stdio: 'inherit' })
  } finally {
    fs.writeFileSync('capacitor.config.json', originalConfig) // 无论成功失败都还原
  }

  console.log('✅ 门禁看板构建完成！')
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

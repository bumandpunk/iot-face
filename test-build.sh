#!/bin/bash
echo "🔨 开始构建测试..."

# 1. 安装依赖 (如果需要)
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 2. 构建项目
echo "🏗️  构建 Vue 项目..."
npm run build

# 3. 同步到 Android
echo "📱 同步到 Android..."
npx cap sync android

# 4. 构建 APK
echo "📦 构建 APK..."
cd android && ./gradlew assembleDebug --no-daemon

echo ""
echo "✅ 构建完成!"
echo "APK 位置: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "安装命令: adb install -r android/app/build/outputs/apk/debug/app-debug.apk"

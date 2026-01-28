#!/bin/bash

# 测试生产构建脚本

echo "🚀 开始测试生产构建流程..."
echo ""

# 1. 清理旧构建
echo "📦 步骤 1: 清理旧的构建产物"
rm -rf dist
echo "✅ 清理完成"
echo ""

# 2. 检查环境文件
echo "📋 步骤 2: 检查环境配置文件"
if [ -f .env.production ]; then
  echo "✅ .env.production 存在"
  echo "内容预览:"
  cat .env.production
else
  echo "⚠️  .env.production 不存在"
fi
echo ""

# 3. 执行构建
echo "🔨 步骤 3: 执行生产构建"
npm run build:prod
if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi
echo "✅ 构建成功"
echo ""

# 4. 验证构建产物
echo "🔍 步骤 4: 验证构建产物"
node verify-build.js
if [ $? -ne 0 ]; then
  echo "❌ 验证失败"
  exit 1
fi
echo ""

# 5. 同步到 Capacitor
echo "📱 步骤 5: 同步到 Capacitor Android"
npx cap sync android
if [ $? -ne 0 ]; then
  echo "❌ 同步失败"
  exit 1
fi
echo "✅ 同步成功"
echo ""

echo "=========================================="
echo "✅ 所有步骤完成！"
echo "=========================================="
echo ""
echo "📌 下一步操作:"
echo "   1. 运行: npx cap open android"
echo "   2. 在 Android Studio 中构建 APK"
echo "   3. 安装到电视后查看调试信息"
echo ""

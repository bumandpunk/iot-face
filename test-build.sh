#!/bin/bash

echo "🧪 测试双看板构建配置..."
echo ""

# 检查必要文件
echo "📋 检查必要文件..."
files=(
  "src/App.vue"
  "src/KitchenBoard.vue"
  "src/main-dashboard.js"
  "src/main-kitchen.js"
  "index.html"
  "kitchen.html"
  "capacitor.config.dashboard.json"
  "capacitor.config.kitchen.json"
  "build-dashboard.js"
  "build-kitchen.js"
  ".env.production"
)

missing_files=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (缺失)"
    missing_files=$((missing_files + 1))
  fi
done

echo ""
if [ $missing_files -eq 0 ]; then
  echo "✅ 所有必要文件都存在"
else
  echo "❌ 缺失 $missing_files 个文件"
  exit 1
fi

# 检查 package.json 脚本
echo ""
echo "📋 检查 package.json 脚本..."
scripts=(
  "build:dashboard"
  "build:kitchen"
  "build:both"
)

for script in "${scripts[@]}"; do
  if grep -q "\"$script\"" package.json; then
    echo "✅ $script"
  else
    echo "❌ $script (缺失)"
  fi
done

# 检查依赖
echo ""
echo "📋 检查依赖..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules 存在"
else
  echo "⚠️  node_modules 不存在，运行 npm install"
fi

if [ -f "node_modules/fs-extra/package.json" ]; then
  echo "✅ fs-extra 已安装"
else
  echo "❌ fs-extra 未安装"
fi

# 检查环境变量
echo ""
echo "📋 检查环境变量..."
if grep -q "VITE_SSE_URL" .env.production; then
  echo "✅ VITE_SSE_URL (门禁看板)"
fi

if grep -q "VITE_KITCHEN_SSE_URL" .env.production; then
  echo "✅ VITE_KITCHEN_SSE_URL (厨房看板)"
fi

echo ""
echo "✅ 配置检查完成！"
echo ""
echo "📝 下一步："
echo "  1. 运行 'npm install' 安装依赖"
echo "  2. 运行 'npm run build:dashboard' 构建门禁看板"
echo "  3. 运行 'npm run build:kitchen' 构建厨房看板"
echo "  4. 或运行 'npm run build:both' 一次构建两个看板"

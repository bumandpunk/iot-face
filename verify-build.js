#!/usr/bin/env node

/**
 * 验证构建产物中是否包含正确的环境变量
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 开始验证构建产物...\n');

// 检查 dist 目录是否存在
const distPath = join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.error('❌ dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 查找主 JS 文件
const indexHtml = join(distPath, 'index.html');
if (!existsSync(indexHtml)) {
  console.error('❌ index.html 不存在');
  process.exit(1);
}

const htmlContent = readFileSync(indexHtml, 'utf-8');
console.log('✅ index.html 已找到\n');

// 提取 JS 文件路径
const jsFileMatch = htmlContent.match(/<script[^>]+src="([^"]+index[^"]*\.js)"/);
if (!jsFileMatch) {
  console.error('❌ 无法在 index.html 中找到主 JS 文件');
  process.exit(1);
}

const jsFilePath = join(distPath, jsFileMatch[1]);
console.log(`📄 主 JS 文件: ${jsFileMatch[1]}\n`);

if (!existsSync(jsFilePath)) {
  console.error('❌ JS 文件不存在:', jsFilePath);
  process.exit(1);
}

const jsContent = readFileSync(jsFilePath, 'utf-8');

// 检查关键配置
console.log('🔍 检查环境变量注入情况:\n');

const checks = [
  { name: 'SSE URL', pattern: /tp\.cewaycloud\.com|10\.10\.30\.249:30345/, desc: 'SSE 连接地址' },
  { name: 'Task API', pattern: /pageIndividualTaskReport/, desc: '任务接口路径' },
  { name: 'API Base', pattern: /https:\/\/tp\.cewaycloud\.com/, desc: '任务 API 基础地址' },
];

let allPassed = true;

checks.forEach(check => {
  const found = check.pattern.test(jsContent);
  if (found) {
    console.log(`✅ ${check.name}: 已找到 (${check.desc})`);
  } else {
    console.log(`❌ ${check.name}: 未找到 (${check.desc})`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('✅ 所有检查通过！构建产物看起来正常。');
  process.exit(0);
} else {
  console.log('❌ 部分检查失败！请检查环境变量配置。');
  process.exit(1);
}

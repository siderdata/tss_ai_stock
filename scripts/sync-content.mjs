#!/usr/bin/env node
/**
 * 同步任务：
 * 1. trading/2026 → docs/journal（VitePress 渲染交易记录 markdown）
 * 2. wiki/四阶段交易法.md → docs/wiki-四阶段交易法.md
 * 3. data/ → docs/public/data（打包进 dist 让生产环境可访问）
 * 4. trading/ JSON 资源 → docs/public/trading（同上）
 *
 * 保留 docs/journal/index.md 不被覆盖。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// 1) trading/2026 → docs/journal
const tradingSrc = path.join(root, 'trading', '2026')
const journalDst = path.join(root, 'docs', 'journal')

// 2) wiki/四阶段交易法.md → docs/
const wikiSrc = path.join(root, 'wiki', '四阶段交易法.md')
const wikiDst = path.join(root, 'docs', 'wiki-四阶段交易法.md')

// 3, 4) data/ + trading/ JSON → docs/public/（生产环境数据源）
const publicData = path.join(root, 'docs', 'public', 'data')
const publicTrading = path.join(root, 'docs', 'public', 'trading')
const dataSrc = path.join(root, 'data')

function copyRecursive(srcDir, dstDir, filter = () => true) {
  if (!fs.existsSync(srcDir)) return
  fs.mkdirSync(dstDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue
    const s = path.join(srcDir, entry.name)
    const d = path.join(dstDir, entry.name)
    if (entry.isDirectory()) {
      copyRecursive(s, d, filter)
    } else if (entry.isFile() && filter(s, entry.name)) {
      fs.copyFileSync(s, d)
    }
  }
}

// === Phase 1: trading/2026 → docs/journal ===
const indexBackup = fs.existsSync(path.join(journalDst, 'index.md'))
  ? fs.readFileSync(path.join(journalDst, 'index.md'), 'utf-8')
  : null
if (fs.existsSync(journalDst)) {
  for (const entry of fs.readdirSync(journalDst, { withFileTypes: true })) {
    if (entry.name === 'index.md') continue
    fs.rmSync(path.join(journalDst, entry.name), { recursive: true, force: true })
  }
}
copyRecursive(tradingSrc, journalDst)
if (indexBackup) fs.writeFileSync(path.join(journalDst, 'index.md'), indexBackup, 'utf-8')

// === Phase 2: wiki/四阶段交易法.md → docs/ ===
if (fs.existsSync(wikiSrc)) fs.copyFileSync(wikiSrc, wikiDst)

// === Phase 3: data/ → docs/public/data ===
fs.rmSync(publicData, { recursive: true, force: true })
copyRecursive(dataSrc, publicData, (_filePath, name) => {
  // 跳过过大或无用的二进制文件
  if (name.endsWith('.db')) return false
  if (name.endsWith('.log')) return false
  return true
})

// === Phase 4: trading 中的 JSON 资源 → docs/public/trading（前端 fetch 用）===
fs.rmSync(publicTrading, { recursive: true, force: true })
copyRecursive(tradingSrc, path.join(publicTrading, '2026'), (_filePath, name) => {
  // 仅复制 JSON 和图片资源给前端 fetch；md 已通过 docs/journal 渲染
  return /\.(json|png|jpg|jpeg|svg)$/i.test(name)
})

console.log('[sync] 已同步 trading/wiki → docs/journal + docs/public/{data,trading}')

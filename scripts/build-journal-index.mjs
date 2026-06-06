#!/usr/bin/env node
/**
 * 扫描 trading/2026 所有日评 + AI 评，提取关键字段汇总成 JSON
 * 输出到 docs/public/journal-index.json，供前端 fetch
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tradingDir = path.join(root, 'trading', '2026')
const outPath = path.join(root, 'docs', 'public', 'journal-index.json')

// 月份元数据
const monthMeta = {
  '2026-01': { result: '+6.62%', amount: 21384, theme: '把握主升浪', desc: '17 连阳 · 3.6 万亿天量 · 跑赢沪深 300 四倍', kind: 'win' },
  '2026-02': { result: '+0.15%', amount: 501, theme: '震荡整固', desc: '高位窄幅震荡 · 情绪退潮 · 仓位 5 成', kind: 'neutral' },
  '2026-03': { result: '-9.26%', amount: -29900, theme: '逆系统教训', desc: '调整杀跌浪 · 融资逆系统加仓 · 月度最大亏损', kind: 'loss' },
  '2026-04': { result: '+10.05%', amount: 31405, theme: '9.44 第二波主升浪', desc: '综合评分突破 9.44 · 满仓+融资 110%', kind: 'big-win' },
  '2026-05': { result: '+4.41%', amount: 15187, theme: '认知觉醒月', desc: '主升浪→牛灾→狼来了→V3.2 框架诞生', kind: 'win' },
  '2026-06': { result: '+0.39%', amount: 1424, theme: '杀跌防守期', desc: '阶段3 调整杀跌浪 · 科技股大退潮 · 保守为主', kind: 'live' },
}

function readSafe(p) {
  try { return fs.readFileSync(p, 'utf-8') } catch { return '' }
}

// 从 md 提取字段
function extractDailyFields(md) {
  const out = { summary: '', composite: null, daily: null, todayProfit: null, riskLevel: '' }

  // 一句话总结
  const sumMatch = md.match(/一句话总结[：:]\s*(.+)/)
  if (sumMatch) out.summary = sumMatch[1].trim().replace(/[*_]/g, '')

  // 综合评分（取第一个）
  const cMatch = md.match(/\*\*综合评分\*\*[：:]\s*([\d.]+)/) || md.match(/综合评分[：:]\s*([\d.]+)/)
  if (cMatch) out.composite = parseFloat(cMatch[1])

  // 日线评分
  const dMatch = md.match(/\*\*日线评分\*\*[：:]\s*([\d.]+)/) || md.match(/日线[：:]\s*([\d.]+)分?/)
  if (dMatch) out.daily = parseFloat(dMatch[1])

  // 今日收益（金额 + 百分比）
  const pMatch = md.match(/今日收益[：:]\s*([+\-]?[\d,]+)\s*元\s*\(?\s*([+\-]?[\d.]+%)?/)
  if (pMatch) {
    out.todayProfit = { amount: parseFloat(pMatch[1].replace(/,/g, '')), rate: pMatch[2] || null }
  }

  // 风险等级
  const rMatch = md.match(/风险等级[：:]\s*([^\n]+)/)
  if (rMatch) out.riskLevel = rMatch[1].trim().slice(0, 6)

  return out
}

function extractAIScore(md) {
  // 多种格式: "评分: 97/100", "得分 100", "总评：100"
  const m1 = md.match(/评分[：:]\s*(\d{1,3})[\/／]100/)
  if (m1) return parseInt(m1[1])
  const m2 = md.match(/总评[：:]\s*\*?\*?(\d{1,3})/)
  if (m2) return parseInt(m2[1])
  const m3 = md.match(/AI评[：:]\s*(\d{1,3})/)
  if (m3) return parseInt(m3[1])
  // h2 形式: "## 一、评分：97/100"
  const m4 = md.match(/^##.*?评分[：:]\s*(\d{1,3})/m)
  if (m4) return parseInt(m4[1])
  return null
}

// 主流程：遍历所有月份
const months = {}
for (const monthName of Object.keys(monthMeta)) {
  const dailyDir = path.join(tradingDir, monthName, 'daily')
  if (!fs.existsSync(dailyDir)) {
    months[monthName] = { ...monthMeta[monthName], days: [] }
    continue
  }

  // 找所有自评文件
  const selfFiles = fs.readdirSync(dailyDir).filter(f => f.endsWith('自评.md'))
  const days = []

  for (const file of selfFiles) {
    const m = file.match(/^(\d{4}-\d{2}-\d{2})自评\.md$/)
    if (!m) continue
    const date = m[1]

    const selfMd = readSafe(path.join(dailyDir, file))
    const aiPath = path.join(dailyDir, `${date}AI评.md`)
    const aiMd = readSafe(aiPath)

    const fields = extractDailyFields(selfMd)
    const aiScore = extractAIScore(aiMd)

    days.push({
      date,
      weekday: ['日','一','二','三','四','五','六'][new Date(date).getDay()],
      slug: `${monthName}/daily/${date}自评`,
      aiSlug: aiMd ? `${monthName}/daily/${date}AI评` : null,
      summary: fields.summary,
      composite: fields.composite,
      daily: fields.daily,
      todayProfit: fields.todayProfit,
      riskLevel: fields.riskLevel,
      aiScore,
    })
  }

  // 按日期排序
  days.sort((a, b) => a.date.localeCompare(b.date))

  months[monthName] = {
    ...monthMeta[monthName],
    month: monthName,
    daysCount: days.length,
    days,
  }
}

// 全局统计
const allDays = Object.values(months).flatMap(m => m.days)
const top5AI = allDays
  .filter(d => d.aiScore != null)
  .sort((a, b) => b.aiScore - a.aiScore)
  .slice(0, 8)

const result = {
  generatedAt: new Date().toISOString(),
  year: 2026,
  yearReturn: '+11.7%',
  totalDays: allDays.length,
  monthCount: Object.keys(months).length,
  months,
  topAIScores: top5AI.map(d => ({
    date: d.date,
    aiScore: d.aiScore,
    summary: d.summary.slice(0, 60),
    slug: d.aiSlug,
  })),
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')
console.log(`[journal-index] 已生成 ${allDays.length} 篇日评索引 → ${path.relative(root, outPath)}`)

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'

interface DailyRecord {
  date: string
  weekday: string
  slug: string
  aiSlug: string | null
  summary: string
  composite: number | null
  daily: number | null
  todayProfit: { amount: number; rate: string | null } | null
  riskLevel: string
  aiScore: number | null
}

interface MonthData {
  month: string
  result: string
  amount: number
  theme: string
  desc: string
  kind: string
  daysCount: number
  days: DailyRecord[]
}

interface IndexData {
  generatedAt: string
  yearReturn: string
  totalDays: number
  monthCount: number
  months: Record<string, MonthData>
  topAIScores: Array<{ date: string; aiScore: number; summary: string; slug: string }>
}

const index = ref<IndexData | null>(null)
const loading = ref(true)
const activeMonth = ref<string>('2026-06')
const sortDesc = ref(true)  // 默认最新在前

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}journal-index.json`)
    index.value = await res.json()
    // 自动激活有数据的最新月份
    if (index.value) {
      const monthsWithData = Object.entries(index.value.months)
        .filter(([_, m]) => m.daysCount > 0)
        .map(([k]) => k)
      if (monthsWithData.length) activeMonth.value = monthsWithData[monthsWithData.length - 1]
    }
  } catch (e) {
    // 静默
  } finally {
    loading.value = false
  }
})

const monthList = computed(() => {
  if (!index.value) return []
  return Object.values(index.value.months).filter(m => m.daysCount > 0 || ['2026-06'].includes(m.month))
})

const currentMonth = computed<MonthData | null>(() => {
  if (!index.value) return null
  return index.value.months[activeMonth.value] || null
})

const sortedDays = computed(() => {
  if (!currentMonth.value) return []
  const days = [...currentMonth.value.days]
  return sortDesc.value ? days.reverse() : days
})

// 按周分组
const weekGroups = computed(() => {
  if (!sortedDays.value.length) return []
  const groups: { weekLabel: string; days: DailyRecord[] }[] = []
  let currentWeekStart = ''
  let currentGroup: DailyRecord[] = []

  for (const d of sortedDays.value) {
    const date = new Date(d.date)
    const day = date.getDay() || 7  // 周日=7
    const monday = new Date(date)
    monday.setDate(date.getDate() - day + 1)
    const weekKey = monday.toISOString().slice(0, 10)

    if (weekKey !== currentWeekStart) {
      if (currentGroup.length) groups.push({ weekLabel: currentWeekStart, days: currentGroup })
      currentWeekStart = weekKey
      currentGroup = [d]
    } else {
      currentGroup.push(d)
    }
  }
  if (currentGroup.length) groups.push({ weekLabel: currentWeekStart, days: currentGroup })
  return groups
})

const scoreClass = (s: number | null): string => {
  if (s == null) return ''
  if (s >= 8.8) return 'score-mega'
  if (s >= 7.5) return 'score-high'
  if (s >= 4) return 'score-mid'
  if (s >= 2) return 'score-low'
  return 'score-extreme-low'
}
const profitClass = (p: number) => p > 0 ? 'profit-up' : p < 0 ? 'profit-down' : 'profit-flat'
const aiClass = (s: number): string => {
  if (s >= 95) return 'ai-excellent'
  if (s >= 85) return 'ai-good'
  if (s >= 70) return 'ai-ok'
  return 'ai-meh'
}

// 月度 spark line data
function monthSparkline(m: MonthData) {
  const points = m.days.filter(d => d.composite != null).map(d => d.composite as number)
  if (points.length < 2) return ''
  const w = 80, h = 24
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = w / (points.length - 1)
  return points.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * h
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}
</script>

<template>
  <div class="journal-view">
    <!-- LOADING -->
    <div v-if="loading" class="loading">
      <span class="tss-dot-live"></span>
      <span class="tss-mono">载入交易记录索引...</span>
    </div>

    <div v-else-if="index">
      <!-- ===== 顶部年度概览 ===== -->
      <section class="overview">
        <div class="overview-stat">
          <div class="stat-key tss-mono">YEAR · 2026</div>
          <div class="stat-val">{{ index.yearReturn }}</div>
          <div class="stat-foot tss-mono">累计收益 · {{ index.totalDays }} 个交易日</div>
        </div>
        <div class="overview-stat">
          <div class="stat-key tss-mono">MONTHS</div>
          <div class="stat-val small">{{ monthList.length }}</div>
          <div class="stat-foot tss-mono">公开月份</div>
        </div>
        <div class="overview-stat">
          <div class="stat-key tss-mono">BEST AI</div>
          <div class="stat-val small ai-excellent">{{ index.topAIScores[0]?.aiScore ?? '-' }}</div>
          <div class="stat-foot tss-mono">{{ index.topAIScores[0]?.date ?? '-' }}</div>
        </div>
        <div class="overview-stat">
          <div class="stat-key tss-mono">≥90 SCORES</div>
          <div class="stat-val small">{{ index.topAIScores.filter(x => x.aiScore >= 90).length }}</div>
          <div class="stat-foot tss-mono">AI 高分次数</div>
        </div>
      </section>

      <!-- ===== 月份 Tab Bar ===== -->
      <section class="month-tabs">
        <button
          v-for="m in monthList"
          :key="m.month"
          :class="['month-tab', `kind-${m.kind}`, { active: m.month === activeMonth }]"
          @click="activeMonth = m.month"
        >
          <span class="tab-month tss-mono">{{ m.month.slice(5) }}月</span>
          <span class="tab-result tss-mono">{{ m.result }}</span>
          <svg v-if="m.daysCount > 1" :width="80" :height="24" class="tab-spark">
            <path :d="monthSparkline(m)" fill="none" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>
      </section>

      <!-- ===== 当前月份内容 ===== -->
      <section v-if="currentMonth" class="month-detail">
        <!-- 月度概览卡 -->
        <div class="month-banner" :data-kind="currentMonth.kind">
          <div class="banner-main">
            <div class="banner-month tss-mono">{{ currentMonth.month }}</div>
            <div class="banner-theme">{{ currentMonth.theme }}</div>
            <div class="banner-desc">{{ currentMonth.desc }}</div>
            <div class="banner-links">
              <a :href="withBase(`/journal/${currentMonth.month}/${currentMonth.month}_Plan`)" class="banner-link">📋 月计划</a>
              <a :href="withBase(`/journal/${currentMonth.month}/${currentMonth.month}_PLan`)" class="banner-link">📋 月计划</a>
              <a :href="withBase(`/journal/${currentMonth.month}/${currentMonth.month}_Summary`)" class="banner-link">📊 月总结</a>
              <a :href="withBase(`/journal/${currentMonth.month}/${currentMonth.month}-月度总结`)" class="banner-link">📊 月度总结</a>
            </div>
          </div>
          <div class="banner-result">
            <div class="result-num tss-mono">{{ currentMonth.result }}</div>
            <div class="result-days tss-mono">{{ currentMonth.daysCount }} 个交易日</div>
          </div>
        </div>

        <!-- 工具栏：排序 / 计数 -->
        <div class="toolbar">
          <div class="toolbar-left tss-mono">
            <span class="tss-dot-live"></span>
            <span>共 {{ sortedDays.length }} 条日记录</span>
          </div>
          <div class="toolbar-right">
            <button class="sort-btn" :class="{ active: sortDesc }" @click="sortDesc = true">⇣ 最新在前</button>
            <button class="sort-btn" :class="{ active: !sortDesc }" @click="sortDesc = false">⇡ 最早在前</button>
          </div>
        </div>

        <!-- 日记录时间流 -->
        <div v-if="sortedDays.length" class="timeline">
          <div v-for="group in weekGroups" :key="group.weekLabel" class="week-group">
            <div class="week-label tss-mono">📅 周一 {{ group.weekLabel }}</div>
            <div class="week-days">
              <a
                v-for="d in group.days"
                :key="d.date"
                :href="withBase(`/journal/${d.slug}`)"
                class="day-card"
              >
                <!-- 左：日期 -->
                <div class="day-date">
                  <div class="date-day tss-mono">{{ d.date.slice(8) }}</div>
                  <div class="date-week tss-mono">周{{ d.weekday }}</div>
                </div>

                <!-- 中：摘要 -->
                <div class="day-body">
                  <div class="day-summary">{{ d.summary || '（无摘要）' }}</div>
                  <div class="day-meta tss-mono">
                    <span v-if="d.composite != null" :class="['chip', 'chip-score', scoreClass(d.composite)]">
                      综合 {{ d.composite.toFixed(2) }}
                    </span>
                    <span v-if="d.daily != null" :class="['chip', 'chip-score-mini', scoreClass(d.daily)]">
                      日线 {{ d.daily.toFixed(1) }}
                    </span>
                    <span v-if="d.todayProfit" :class="['chip', 'chip-profit', profitClass(d.todayProfit.amount)]">
                      {{ d.todayProfit.amount > 0 ? '+' : '' }}{{ d.todayProfit.amount.toLocaleString() }} 元
                    </span>
                    <span v-if="d.riskLevel" class="chip chip-risk">
                      {{ d.riskLevel }}
                    </span>
                  </div>
                </div>

                <!-- 右：AI 评分 -->
                <div class="day-ai">
                  <div v-if="d.aiScore != null" :class="['ai-badge', aiClass(d.aiScore)]">
                    <span class="ai-num tss-mono">{{ d.aiScore }}</span>
                    <span class="ai-lbl tss-mono">AI</span>
                  </div>
                  <div v-else class="ai-badge ai-meh">
                    <span class="ai-num tss-mono">—</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div v-else class="empty-month tss-mono">
          ⓘ 当月暂无日评记录
        </div>
      </section>

      <!-- ===== AI 评分排行 ===== -->
      <section class="ai-leaderboard">
        <div class="lb-header">
          <h3 style="margin:0;">🏆 AI 评分历史排行</h3>
          <span class="tss-mono lb-sub">前 8 个最高分日</span>
        </div>
        <div class="lb-grid">
          <a
            v-for="(t, i) in index.topAIScores"
            :key="t.date"
            :href="withBase(`/journal/${t.slug}`)"
            class="lb-card"
          >
            <div class="lb-rank tss-mono">#{{ i + 1 }}</div>
            <div class="lb-score-block">
              <div :class="['lb-score', 'tss-mono', aiClass(t.aiScore)]">{{ t.aiScore }}</div>
              <div class="lb-of tss-mono">/100</div>
            </div>
            <div class="lb-info">
              <div class="lb-date tss-mono">{{ t.date }}</div>
              <div class="lb-summary">{{ t.summary || '点击查看 AI 评' }}</div>
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.journal-view { width: 100%; }

/* ===== LOADING ===== */
.loading {
  padding: 80px 24px;
  text-align: center;
  color: var(--tss-text-secondary);
}
.loading .tss-mono { margin-left: 12px; }

/* ===== 顶部年度概览 ===== */
.overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.overview-stat {
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.overview-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px;
  height: 100%;
  background: var(--vp-c-brand-1);
  opacity: 0.6;
}
.stat-key {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--tss-text-dim);
  margin-bottom: 8px;
}
.stat-val {
  font-family: 'SF Mono', monospace;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--tss-success);
  text-shadow: 0 0 16px rgba(0, 255, 157, 0.3);
}
.stat-val.small { font-size: 28px; color: var(--vp-c-brand-1); text-shadow: 0 0 12px rgba(0, 217, 255, 0.3); }
.stat-val.ai-excellent { color: #ff006e; text-shadow: 0 0 16px rgba(255, 0, 110, 0.5); }
.stat-foot { font-size: 11px; color: var(--tss-text-secondary); margin-top: 8px; }

/* ===== 月份 Tab ===== */
.month-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px;
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-radius: 12px;
}
.month-tab {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--tss-text-secondary);
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.month-tab:hover { background: rgba(0, 217, 255, 0.05); border-color: var(--tss-border); }
.month-tab.active {
  background: rgba(0, 217, 255, 0.08);
  border-color: var(--tss-border-glow);
  color: var(--tss-text-primary);
  box-shadow: inset 0 -2px 0 var(--vp-c-brand-1);
}
.tab-month { font-size: 11px; letter-spacing: 1px; color: var(--tss-text-dim); }
.month-tab.active .tab-month { color: var(--vp-c-brand-1); }
.tab-result { font-size: 18px; font-weight: 700; }
.month-tab.kind-big-win .tab-result { color: #ff006e; }
.month-tab.kind-win .tab-result { color: #ff4d6d; }
.month-tab.kind-loss .tab-result { color: var(--tss-success); }
.month-tab.kind-neutral .tab-result { color: var(--tss-text-secondary); }
.month-tab.kind-live .tab-result { color: var(--vp-c-brand-1); }
.tab-spark { color: currentColor; opacity: 0.5; }
.month-tab.active .tab-spark { opacity: 1; }

/* ===== 月度 Banner ===== */
.month-banner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, var(--tss-bg-card) 0%, rgba(0, 217, 255, 0.05) 100%);
  border: 1px solid var(--tss-border);
  border-radius: 12px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.month-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--vp-c-brand-1);
}
.month-banner[data-kind="big-win"]::before { background: linear-gradient(90deg, #ff006e, #ff4d6d); }
.month-banner[data-kind="win"]::before { background: linear-gradient(90deg, #ff4d6d, #ffb347); }
.month-banner[data-kind="loss"]::before { background: linear-gradient(90deg, #00ff9d, #00ffcc); }
.month-banner[data-kind="neutral"]::before { background: var(--tss-text-dim); }
.month-banner[data-kind="live"]::before {
  background: linear-gradient(90deg, #00d9ff, #b794f6);
  animation: bar-shimmer 2s ease-in-out infinite;
}
@keyframes bar-shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

.banner-main { min-width: 0; }
.banner-month {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--tss-text-dim);
  margin-bottom: 6px;
}
.banner-theme {
  font-size: 24px;
  font-weight: 700;
  color: var(--tss-text-primary);
  margin-bottom: 6px;
}
.banner-desc {
  font-size: 13px;
  color: var(--tss-text-secondary);
  margin-bottom: 12px;
}
.banner-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.banner-link {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(0, 217, 255, 0.08);
  border: 1px solid var(--tss-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--vp-c-brand-1) !important;
  text-decoration: none !important;
  transition: all 0.2s;
}
.banner-link:hover {
  background: rgba(0, 217, 255, 0.15);
  border-color: var(--tss-border-glow);
}

.banner-result { text-align: right; }
.result-num {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}
.month-banner[data-kind="big-win"] .result-num { color: #ff006e; text-shadow: 0 0 20px rgba(255, 0, 110, 0.4); }
.month-banner[data-kind="win"] .result-num { color: #ff4d6d; }
.month-banner[data-kind="loss"] .result-num { color: var(--tss-success); }
.month-banner[data-kind="neutral"] .result-num { color: var(--tss-text-secondary); }
.month-banner[data-kind="live"] .result-num { color: var(--vp-c-brand-1); }
.result-days {
  font-size: 11px;
  color: var(--tss-text-dim);
  margin-top: 6px;
  letter-spacing: 1px;
}

/* ===== 工具栏 ===== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 12px;
  padding: 0 4px;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-left { font-size: 12px; color: var(--tss-text-secondary); }
.toolbar-right { display: flex; gap: 6px; }
.sort-btn {
  padding: 4px 12px;
  font-size: 11px;
  background: transparent;
  border: 1px solid var(--tss-border);
  border-radius: 6px;
  color: var(--tss-text-secondary);
  cursor: pointer;
  font-family: 'SF Mono', monospace;
  transition: all 0.2s;
}
.sort-btn:hover { color: var(--tss-text-primary); border-color: var(--tss-border-glow); }
.sort-btn.active {
  background: rgba(0, 217, 255, 0.1);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ===== 时间流 ===== */
.timeline { display: flex; flex-direction: column; gap: 24px; }
.week-group { }
.week-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--tss-text-dim);
  margin-bottom: 8px;
  padding-left: 4px;
}
.week-days {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-card {
  display: grid;
  grid-template-columns: 60px 1fr 72px;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 10px;
  color: var(--tss-text-primary) !important;
  text-decoration: none !important;
  transition: all 0.25s ease;
}
.day-card:hover {
  border-color: var(--tss-border-glow);
  border-left-color: var(--vp-c-brand-1);
  background: rgba(0, 217, 255, 0.04);
  transform: translateX(4px);
}

.day-date { text-align: center; }
.date-day {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--tss-text-primary);
}
.date-week {
  font-size: 10px;
  color: var(--tss-text-dim);
  margin-top: 4px;
  letter-spacing: 1px;
}

.day-body { min-width: 0; }
.day-summary {
  font-size: 14px;
  line-height: 1.55;
  color: var(--tss-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}
.day-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* chip 通用 */
.chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 10px;
  border-radius: 4px;
  border: 1px solid currentColor;
  background: rgba(255, 255, 255, 0.02);
  white-space: nowrap;
}
.chip-score { font-weight: 600; }
.chip-score-mini { opacity: 0.7; font-size: 9px; padding: 1px 6px; }
.chip-profit { font-weight: 600; }
.chip-risk { color: var(--tss-warning); opacity: 0.8; }

.score-mega { color: #ff006e; }
.score-high { color: var(--vp-c-brand-1); }
.score-mid { color: var(--tss-warning); }
.score-low { color: var(--tss-success); }
.score-extreme-low { color: var(--tss-success); }

.profit-up { color: var(--tss-danger); }
.profit-down { color: var(--tss-success); }
.profit-flat { color: var(--tss-text-secondary); }

/* AI 徽章 */
.day-ai { text-align: center; }
.ai-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid currentColor;
  position: relative;
}
.ai-badge::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid currentColor;
  opacity: 0.2;
}
.ai-num { font-size: 18px; font-weight: 700; line-height: 1; }
.ai-lbl { font-size: 8px; letter-spacing: 1px; opacity: 0.7; margin-top: 2px; }
.ai-excellent { color: #ff006e; text-shadow: 0 0 8px rgba(255, 0, 110, 0.4); }
.ai-good { color: var(--vp-c-brand-1); }
.ai-ok { color: var(--tss-warning); }
.ai-meh { color: var(--tss-text-dim); }

.empty-month {
  text-align: center;
  padding: 60px 20px;
  color: var(--tss-text-dim);
  background: var(--tss-bg-card);
  border: 1px dashed var(--tss-border);
  border-radius: 12px;
}

/* ===== AI 排行 ===== */
.ai-leaderboard { margin-top: 48px; }
.lb-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.lb-sub { font-size: 11px; color: var(--tss-text-dim); letter-spacing: 1px; }

.lb-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.lb-card {
  display: grid;
  grid-template-columns: 32px 64px 1fr;
  gap: 12px;
  align-items: center;
  padding: 14px;
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-radius: 10px;
  color: var(--tss-text-primary) !important;
  text-decoration: none !important;
  transition: all 0.25s;
}
.lb-card:hover {
  border-color: var(--tss-border-glow);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.lb-rank {
  font-size: 16px;
  font-weight: 700;
  color: var(--tss-text-dim);
  text-align: center;
}
.lb-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px dashed var(--tss-border);
  padding-right: 12px;
}
.lb-score { font-size: 28px; font-weight: 700; line-height: 1; }
.lb-of { font-size: 9px; color: var(--tss-text-dim); margin-top: 4px; }
.lb-info { min-width: 0; }
.lb-date { font-size: 11px; color: var(--tss-text-dim); margin-bottom: 4px; }
.lb-summary {
  font-size: 12px;
  color: var(--tss-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .month-banner { grid-template-columns: 1fr; }
  .banner-result { text-align: left; }
  .result-num { font-size: 36px; }
  .day-card { grid-template-columns: 50px 1fr 56px; gap: 10px; padding: 12px; }
  .date-day { font-size: 20px; }
  .ai-badge { width: 48px; height: 48px; }
  .ai-num { font-size: 16px; }
}
</style>

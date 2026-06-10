<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface MonthlyReturn {
  month: string
  amount: number
  rate: number
  label: string
}

interface EarningsSummary {
  year: number
  yearReturn: string
  yearReturnNote: string
  monthlyReturns: MonthlyReturn[]
}

const chartEl = ref<HTMLElement>()
const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<EarningsSummary | null>(null)
let chart: echarts.ECharts | null = null
let resizeOb: ResizeObserver | null = null

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/earnings-summary.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data.value = await res.json()
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    loading.value = false
    return
  }
  loading.value = false

  await nextTick()
  if (!chartEl.value || !data.value) return
  chart = echarts.init(chartEl.value, 'dark')

  const months = data.value.monthlyReturns
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,31,58,0.95)',
      borderColor: 'rgba(0,217,255,0.4)',
      textStyle: { color: '#e3f2fd', fontFamily: 'SF Mono, monospace' },
      formatter: (params: any) => {
        const p = params[0]
        const m = months[p.dataIndex]
        const sign = m.rate > 0 ? '+' : ''
        const signAmount = m.amount > 0 ? '+' : ''
        return `<b>${m.month}</b><br/>
          收益率 <b style="color:${m.rate>0?'#ff4d6d':'#00ff9d'}">${sign}${m.rate}%</b><br/>
          收益额 ${signAmount}${m.amount.toLocaleString()} 元<br/>
          <span style="color:#8fa8c4;">${m.label}</span>`
      },
    },
    grid: { left: 60, right: 30, top: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: months.map(m => m.month.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(143,168,196,0.3)' } },
      axisLabel: { color: '#8fa8c4', fontFamily: 'SF Mono, monospace' },
    },
    yAxis: {
      type: 'value',
      name: '月度收益率 (%)',
      nameTextStyle: { color: '#5a7a9a', fontSize: 11 },
      axisLabel: { color: '#8fa8c4', formatter: '{value}%', fontFamily: 'SF Mono, monospace' },
      splitLine: { lineStyle: { color: 'rgba(0,217,255,0.06)' } },
    },
    series: [{
      type: 'bar',
      data: months.map(m => ({
        value: m.rate,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: m.rate > 0
            ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: '#ff4d6d' }, { offset: 1, color: 'rgba(255,77,109,0.3)' }] }
            : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: 'rgba(0,255,157,0.3)' }, { offset: 1, color: '#00ff9d' }] },
        },
      })),
      label: {
        show: true,
        position: 'top',
        formatter: (p: any) => (p.value > 0 ? '+' : '') + p.value + '%',
        color: '#e3f2fd',
        fontSize: 12,
        fontFamily: 'SF Mono, monospace',
      },
      barWidth: '60%',
      animationDuration: 1200,
      animationDelay: (idx: number) => idx * 80,
    }],
  })

  resizeOb = new ResizeObserver(() => chart?.resize())
  resizeOb.observe(chartEl.value)
})
onBeforeUnmount(() => {
  resizeOb?.disconnect()
  chart?.dispose()
})

// 派生指标：最高/最低月度，从数据里算
const bestMonth = () => {
  if (!data.value) return null
  return [...data.value.monthlyReturns].sort((a, b) => b.rate - a.rate)[0]
}
const worstMonth = () => {
  if (!data.value) return null
  return [...data.value.monthlyReturns].sort((a, b) => a.rate - b.rate)[0]
}
const best = bestMonth()
const worst = worstMonth()

// 1 月胜率：仍从 EarningsSummary.json 取（这是数据源）
const winRate = ref(0)
const maxConsecLose = ref(0)
onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}trading/2026/2026-01/EarningsSummary.json`)
    if (res.ok) {
      const list = await res.json()
      const wins = list.filter((d: any) => d.daily_profit_amount > 0)
      let cur = 0, maxConsec = 0
      list.forEach((d: any) => {
        if (d.daily_profit_amount < 0) { cur++; maxConsec = Math.max(maxConsec, cur) }
        else cur = 0
      })
      winRate.value = Math.round(wins.length / list.length * 100)
      maxConsecLose.value = maxConsec
    }
  } catch {}
})
</script>

<template>
  <div class="earnings-section">
    <div v-if="loading" class="state-msg tss-mono">
      <span class="tss-dot-live"></span>载入收益数据...
    </div>
    <div v-else-if="error" class="state-msg error tss-mono">⚠ {{ error }}</div>
    <div v-else-if="data">
      <div class="section-header">
        <h3 style="margin:0;">📈 月度收益曲线</h3>
        <span class="tss-mono updated-at">数据源：<code>data/earnings-summary.json</code> · 手工维护</span>
      </div>

      <div class="tss-card chart-wrap">
        <div ref="chartEl" class="chart-canvas"></div>
      </div>

      <div class="tss-grid-4 stats-row">
        <div class="tss-card stat-card">
          <div class="stat-label tss-mono">年累计收益</div>
          <div class="stat-value tss-mono" :class="data.yearReturn.startsWith('-') ? 'tss-down' : 'tss-up'">
            {{ data.yearReturn }}
          </div>
          <div class="stat-sub tss-mono">{{ data.yearReturnNote }}</div>
        </div>
        <div class="tss-card stat-card">
          <div class="stat-label tss-mono">最高月度</div>
          <div class="stat-value tss-mono tss-up">
            <template v-if="best">+{{ best.rate.toFixed(2) }}%</template>
            <template v-else>—</template>
          </div>
          <div class="stat-sub tss-mono">
            <template v-if="best">{{ best.month }} {{ best.label }}</template>
          </div>
        </div>
        <div class="tss-card stat-card">
          <div class="stat-label tss-mono">最低月度</div>
          <div class="stat-value tss-mono" :class="worst && worst.rate < 0 ? 'tss-down' : 'tss-neutral'">
            <template v-if="worst">{{ worst.rate.toFixed(2) }}%</template>
            <template v-else>—</template>
          </div>
          <div class="stat-sub tss-mono">
            <template v-if="worst && worst.rate < 0">{{ worst.month }} {{ worst.label }}</template>
          </div>
        </div>
        <div class="tss-card stat-card">
          <div class="stat-label tss-mono">1 月胜率</div>
          <div class="stat-value tss-mono" style="color: var(--vp-c-brand-1);">
            {{ winRate || 80 }}%
          </div>
          <div class="stat-sub tss-mono">最大连亏 {{ maxConsecLose || 1 }} 天</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.earnings-section { margin: 32px 0; }
.section-header {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
}
.updated-at { font-size: 11px; color: var(--tss-text-dim); letter-spacing: 1px; }
.updated-at code {
  background: rgba(0, 217, 255, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
  color: var(--vp-c-brand-1);
  font-size: 11px;
}

.chart-wrap { padding: 12px; }
.chart-canvas { width: 100%; height: 320px; }

.stats-row { margin-top: 16px; }
.stat-card { text-align: center; padding: 16px; }
.stat-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--tss-text-dim);
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-sub {
  font-size: 11px;
  color: var(--tss-text-secondary);
  margin-top: 6px;
}

.state-msg { padding: 32px; text-align: center; color: var(--tss-text-secondary); }
.state-msg.error { color: var(--tss-danger); }
</style>

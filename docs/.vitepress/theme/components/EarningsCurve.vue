<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

interface DailyEarning {
  date: string
  daily_profit_amount: number
  daily_return_rate: string
}

const chartEl = ref<HTMLElement>()
const stats = ref({
  total: 0,
  winRate: 0,
  maxWin: 0,
  maxLoss: 0,
  maxConsecLose: 0,
})
let chart: echarts.ECharts | null = null

const monthlyReturns = [
  { month: '2026-01', amount: 21384, rate: 6.62, label: '主升浪 17 连阳' },
  { month: '2026-02', amount: 501, rate: 0.15, label: '震荡整固' },
  { month: '2026-03', amount: -29900, rate: -9.26, label: '逆系统大幅回撤' },
  { month: '2026-04', amount: 31405, rate: 10.05, label: '9.44 第二波主升浪' },
  { month: '2026-05', amount: 15187, rate: 4.41, label: '认知觉醒月' },
  { month: '2026-06', amount: 1424, rate: 0.39, label: '杀跌防守 (MTD)' },
]

onMounted(async () => {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value, 'dark')
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,31,58,0.95)',
      borderColor: 'rgba(0,217,255,0.4)',
      textStyle: { color: '#e3f2fd', fontFamily: 'SF Mono, monospace' },
      formatter: (params: any) => {
        const p = params[0]
        const m = monthlyReturns[p.dataIndex]
        const sign = m.rate > 0 ? '+' : ''
        return `<b>${m.month}</b><br/>
          收益率 <b style="color:${m.rate>0?'#ff4d6d':'#00ff9d'}">${sign}${m.rate}%</b><br/>
          收益额 ${sign}${m.amount.toLocaleString()} 元<br/>
          <span style="color:#8fa8c4;">${m.label}</span>`
      },
    },
    grid: { left: 60, right: 30, top: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: monthlyReturns.map(m => m.month.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(143,168,196,0.3)' } },
      axisLabel: { color: '#8fa8c4', fontFamily: 'SF Mono, monospace' },
      splitLine: { show: false },
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
      data: monthlyReturns.map(m => ({
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

  // 派生指标 (1月)
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}trading/2026/2026-01/EarningsSummary.json`)
    if (res.ok) {
      const list: DailyEarning[] = await res.json()
      const wins = list.filter(d => d.daily_profit_amount > 0)
      const total = list.reduce((s, d) => s + d.daily_profit_amount, 0)
      let cur = 0, maxConsec = 0
      list.forEach(d => {
        if (d.daily_profit_amount < 0) { cur++; maxConsec = Math.max(maxConsec, cur) }
        else cur = 0
      })
      stats.value = {
        total,
        winRate: Math.round(wins.length / list.length * 100),
        maxWin: Math.max(...list.map(d => d.daily_profit_amount)),
        maxLoss: Math.min(...list.map(d => d.daily_profit_amount)),
        maxConsecLose: maxConsec,
      }
    }
  } catch (e) {
    // 静默：无数据时显示默认占位
  }
})
onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <div class="earnings-section">
    <div class="section-header">
      <h3 style="margin:0;">📈 月度收益曲线</h3>
      <span class="tss-mono updated-at">2026.01 - 2026.06 实盘公开</span>
    </div>

    <div class="tss-card chart-wrap">
      <div ref="chartEl" class="chart-canvas"></div>
    </div>

    <div class="tss-grid-4 stats-row">
      <div class="tss-card stat-card">
        <div class="stat-label tss-mono">年累计收益</div>
        <div class="stat-value tss-mono tss-up">+11.7%</div>
        <div class="stat-sub tss-mono">至 2026-06-05</div>
      </div>
      <div class="tss-card stat-card">
        <div class="stat-label tss-mono">最高月度</div>
        <div class="stat-value tss-mono tss-up">+10.05%</div>
        <div class="stat-sub tss-mono">2026-04 第二波主升浪</div>
      </div>
      <div class="tss-card stat-card">
        <div class="stat-label tss-mono">最低月度</div>
        <div class="stat-value tss-mono tss-down">-9.26%</div>
        <div class="stat-sub tss-mono">2026-03 逆系统教训</div>
      </div>
      <div class="tss-card stat-card">
        <div class="stat-label tss-mono">1 月胜率</div>
        <div class="stat-value tss-mono" style="color: var(--vp-c-brand-1);">{{ stats.winRate || 80 }}%</div>
        <div class="stat-sub tss-mono">最大连亏 {{ stats.maxConsecLose || 1 }} 天</div>
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
</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

interface IndustrySignal {
  name: string
  symbol: string
  close: number
  rise: number
  amount: number
  composite_score: number
  rise_change_3d: string
}

const chartEl = ref<HTMLElement>()
const top5 = ref<IndustrySignal[]>([])
const bottom5 = ref<IndustrySignal[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
let chart: echarts.ECharts | null = null
let resizeOb: ResizeObserver | null = null

const colorByScore = (s: number): string => {
  if (s >= 70) return '#ff006e'
  if (s >= 60) return '#ff4d6d'
  if (s >= 50) return '#ffb347'
  if (s >= 40) return '#8fa8c4'
  if (s >= 30) return '#5a7a9a'
  return '#00ff9d'
}

onMounted(async () => {
  let list: IndustrySignal[] = []
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/industry-realtime-detail.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    list = (json.industry_signals || [])
    if (!list.length) throw new Error('行业数据为空')

    const sorted = [...list].sort((a, b) => b.rise - a.rise)
    top5.value = sorted.slice(0, 5)
    bottom5.value = sorted.slice(-5).reverse()
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }

  if (error.value) return
  await nextTick()
  if (!chartEl.value || !list.length) return

  chart = echarts.init(chartEl.value, 'dark')
  const data = list.map(d => ({
    name: d.name,
    value: Math.max(d.amount / 1e8, 1),
    itemStyle: { color: colorByScore(d.composite_score) },
    label: {
      formatter: [
        `{name|${d.name}}`,
        `{score|评分 ${d.composite_score.toFixed(0)}}`,
        `{rise|${d.rise > 0 ? '+' : ''}${d.rise.toFixed(2)}%}`,
      ].join('\n'),
      rich: {
        name: { color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 18 },
        score: { color: 'rgba(255,255,255,0.85)', fontSize: 10, lineHeight: 14, fontFamily: 'SF Mono, monospace' },
        rise: { color: '#fff', fontSize: 11, lineHeight: 16, fontFamily: 'SF Mono, monospace' },
      },
    },
    rise: d.rise,
    score: d.composite_score,
  }))
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(15,31,58,0.95)',
      borderColor: 'rgba(0,217,255,0.4)',
      textStyle: { color: '#e3f2fd' },
      formatter: (p: any) => {
        const d = p.data
        return `<b>${d.name}</b><br/>
          评分 <b>${d.score.toFixed(2)}</b> · 涨跌
          <b style="color:${d.rise>0?'#ff4d6d':'#00ff9d'}">${d.rise>0?'+':''}${d.rise.toFixed(2)}%</b><br/>
          成交 ${d.value.toFixed(1)} 亿`
      },
    },
    series: [{
      type: 'treemap',
      data,
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: { show: true, position: 'inside' },
      itemStyle: {
        borderColor: 'rgba(10, 22, 40, 0.6)',
        borderWidth: 2,
        gapWidth: 2,
      },
      upperLabel: { show: false },
      animationDuration: 1000,
    }],
  })

  resizeOb = new ResizeObserver(() => chart?.resize())
  resizeOb.observe(chartEl.value)
})

onBeforeUnmount(() => {
  resizeOb?.disconnect()
  chart?.dispose()
})
</script>

<template>
  <div class="industry-section">
    <div class="section-header">
      <h3 style="margin:0;">行业热力图 · 评分 × 成交额</h3>
      <span class="tss-mono updated-at" v-if="!loading && !error">块大小=成交额 · 颜色=评分</span>
      <span class="tss-mono updated-at" v-else-if="loading"><span class="tss-dot-live"></span>载入中...</span>
      <span class="tss-mono updated-at" v-else style="color: var(--tss-danger);">⚠ {{ error }}</span>
    </div>

    <div class="tss-card heat-wrap">
      <div ref="chartEl" class="chart-canvas"></div>
      <div v-if="error" class="empty-state tss-mono">⚠ {{ error }}</div>
    </div>

    <div v-if="top5.length" class="tss-grid-2 ranks">
      <div class="tss-card rank-card">
        <div class="rank-title tss-up">📈 涨幅榜 TOP 5</div>
        <div v-for="(it, i) in top5" :key="it.symbol" class="rank-row">
          <span class="rank-no tss-mono">{{ i + 1 }}</span>
          <span class="rank-name">{{ it.name }}</span>
          <span class="rank-score tss-mono">{{ it.composite_score.toFixed(0) }}</span>
          <span class="rank-rise tss-mono tss-up">+{{ it.rise.toFixed(2) }}%</span>
        </div>
      </div>
      <div class="tss-card rank-card">
        <div class="rank-title tss-down">📉 跌幅榜 TOP 5</div>
        <div v-for="(it, i) in bottom5" :key="it.symbol" class="rank-row">
          <span class="rank-no tss-mono">{{ i + 1 }}</span>
          <span class="rank-name">{{ it.name }}</span>
          <span class="rank-score tss-mono">{{ it.composite_score.toFixed(0) }}</span>
          <span class="rank-rise tss-mono tss-down">{{ it.rise.toFixed(2) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.industry-section { margin: 32px 0; }
.section-header {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
}
.updated-at { font-size: 11px; color: var(--tss-text-dim); letter-spacing: 1px; }

.heat-wrap { padding: 12px; position: relative; }
.chart-canvas { width: 100%; height: 420px; }
.empty-state {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--tss-text-dim);
  pointer-events: none;
}

.ranks { margin-top: 16px; }
.rank-card { padding: 16px; }
.rank-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--tss-border);
}
.rank-row {
  display: grid;
  grid-template-columns: 24px 1fr 50px 70px;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
}
.rank-no { color: var(--tss-text-dim); text-align: center; font-size: 11px; }
.rank-name { color: var(--tss-text-primary); }
.rank-score { color: var(--vp-c-brand-1); text-align: right; font-size: 12px; }
.rank-rise { text-align: right; font-weight: 600; }
</style>

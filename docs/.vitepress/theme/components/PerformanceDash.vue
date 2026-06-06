<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

interface TodayRecord {
  trade_time: string
  composite_score: string
  daily_score: string
  min30_score: string
  min60_score: string
  min120_score: string
  status_name: string
  operation_suggestion: string
  total_amount: number
  up_ratio: string
}

const chartEl = ref<HTMLElement>()
const records = ref<TodayRecord[]>([])
const loading = ref(true)
let chart: echarts.ECharts | null = null
let resizeOb: ResizeObserver | null = null

onMounted(async () => {
  let list: TodayRecord[] = []
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/today.json`)
    const json = await res.json()
    list = (json.data || []).slice().reverse()
    records.value = list
  } catch (e) {
    // 静默失败，继续走渲染
  }
  loading.value = false

  // 等 v-if 切换、DOM 真正渲染完
  await nextTick()
  if (!chartEl.value || !list.length) return

  chart = echarts.init(chartEl.value, 'dark')

  const times = list.map(r => r.trade_time.slice(11, 16))
  const composite = list.map(r => parseFloat(r.composite_score))
  const min30 = list.map(r => parseFloat(r.min30_score))
  const min60 = list.map(r => parseFloat(r.min60_score))
  const min120 = list.map(r => parseFloat(r.min120_score))
  const daily = list.map(r => parseFloat(r.daily_score))

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,31,58,0.95)',
      borderColor: 'rgba(0,217,255,0.4)',
      textStyle: { color: '#e3f2fd' },
    },
    legend: {
      textStyle: { color: '#8fa8c4', fontFamily: 'SF Mono, monospace', fontSize: 11 },
      bottom: 4,
      itemWidth: 14, itemHeight: 8,
    },
    grid: { left: 50, right: 30, top: 24, bottom: 50 },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { lineStyle: { color: 'rgba(143,168,196,0.3)' } },
      axisLabel: { color: '#8fa8c4', fontFamily: 'SF Mono, monospace', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 0, max: 10,
      axisLabel: { color: '#8fa8c4', fontFamily: 'SF Mono, monospace' },
      splitLine: { lineStyle: { color: 'rgba(0,217,255,0.06)' } },
    },
    series: [
      seriesLine('综合', composite, '#ff006e', 3),
      seriesLine('日线', daily, '#b794f6', 2),
      seriesLine('120分', min120, '#00d9ff', 1.5),
      seriesLine('60分', min60, '#00ff9d', 1.5),
      seriesLine('30分', min30, '#ffb347', 1.5),
    ],
  })

  // 容器尺寸变化时 resize
  resizeOb = new ResizeObserver(() => chart?.resize())
  resizeOb.observe(chartEl.value)
})

onBeforeUnmount(() => {
  resizeOb?.disconnect()
  chart?.dispose()
})

function seriesLine(name: string, data: number[], color: string, width: number) {
  return {
    name,
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 4,
    data,
    lineStyle: { width, color, shadowColor: color, shadowBlur: 8 },
    itemStyle: { color },
    emphasis: { focus: 'series', lineStyle: { width: width + 1 } },
  }
}
</script>

<template>
  <div class="perf-dash">
    <div class="section-header">
      <h3 style="margin:0;">📊 当日评分轨迹 · 多周期</h3>
      <span class="tss-mono updated-at" v-if="records.length">
        {{ records.length }} 个交易点 · {{ records[0].trade_time.slice(0, 10) }}
      </span>
      <span class="tss-mono updated-at" v-else-if="loading">
        <span class="tss-dot-live"></span>载入中...
      </span>
      <span class="tss-mono updated-at" v-else>暂无数据</span>
    </div>
    <div class="tss-card chart-wrap">
      <div ref="chartEl" class="chart-canvas"></div>
      <div v-if="!records.length && !loading" class="empty-state tss-mono">
        ⚠ today.json 数据为空
      </div>
    </div>
  </div>
</template>

<style scoped>
.perf-dash { margin: 24px 0; }
.section-header {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
}
.updated-at { font-size: 11px; color: var(--tss-text-dim); letter-spacing: 1px; }

.chart-wrap { padding: 12px; position: relative; }
.chart-canvas { width: 100%; height: 320px; }
.empty-state {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--tss-text-dim);
  pointer-events: none;
}
</style>


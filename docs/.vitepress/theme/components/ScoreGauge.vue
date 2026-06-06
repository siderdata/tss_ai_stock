<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

interface Props {
  value: number
  label?: string
  max?: number
}
const props = withDefaults(defineProps<Props>(), { label: '评分', max: 10 })

const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const colorByValue = (v: number): [string, string] => {
  if (v >= 8.8) return ['#ff006e', '#ff4d6d']  // 极高
  if (v >= 7.5) return ['#00d9ff', '#00b8e6']  // 高
  if (v >= 4) return ['#ffb347', '#ffd87a']    // 中
  if (v >= 2) return ['#00ff9d', '#00cc7a']    // 低
  return ['#00ff9d', '#00ffff']                  // 极低
}

const render = () => {
  if (!chartEl.value || !chart) return
  const [c1, c2] = colorByValue(props.value)
  chart.setOption({
    series: [{
      type: 'gauge',
      min: 0,
      max: props.max,
      splitNumber: 5,
      radius: '92%',
      progress: { show: true, width: 14, roundCap: true,
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }] } } },
      axisLine: { lineStyle: { width: 14, color: [[1, 'rgba(0,217,255,0.12)']] } },
      pointer: { show: false },
      axisTick: { distance: -22, length: 4,
        lineStyle: { color: 'rgba(143,168,196,0.4)', width: 1 } },
      splitLine: { distance: -28, length: 8,
        lineStyle: { color: 'rgba(143,168,196,0.6)', width: 2 } },
      axisLabel: { distance: 12, fontSize: 10, color: '#5a7a9a',
        fontFamily: 'SF Mono, monospace' },
      anchor: { show: false },
      title: { show: false },
      detail: { valueAnimation: true, fontSize: 28, fontWeight: 700,
        offsetCenter: [0, '8%'], formatter: '{value}',
        fontFamily: 'SF Mono, monospace', color: c1 },
      data: [{ value: Number(props.value.toFixed(2)) }],
    }],
  })
}

onMounted(() => {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value, 'dark')
  render()
})
onBeforeUnmount(() => { chart?.dispose() })
watch(() => props.value, render)
</script>

<template>
  <div class="score-gauge tss-card">
    <div class="gauge-label tss-mono">{{ label }}</div>
    <div ref="chartEl" class="gauge-canvas"></div>
  </div>
</template>

<style scoped>
.score-gauge { padding: 12px 8px; text-align: center; }
.gauge-label { font-size: 11px; color: var(--tss-text-dim); letter-spacing: 2px; }
.gauge-canvas { width: 100%; height: 160px; }
</style>

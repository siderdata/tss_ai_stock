<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface IndexSignal {
  name: string
  symbol: string
  close: number
  open: number
  high: number
  low: number
  rise: number
  amount: number
  composite_score: number
  composite_signal: number
  rise_change_3d: string
  up_count: number
  down_count: number
  time: string
}

const indices = ref<IndexSignal[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const updatedAt = ref<string>('')

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/market-realtime.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    indices.value = (data.core_signals || []).slice(0, 9)
    updatedAt.value = indices.value[0]?.time || ''
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
})

const fmtAmount = (v: number) => {
  if (v >= 1e12) return (v / 1e12).toFixed(2) + '万亿'
  if (v >= 1e8) return (v / 1e8).toFixed(0) + '亿'
  return (v / 1e4).toFixed(0) + '万'
}

const riseClass = (r: number) => r > 0 ? 'tss-up' : r < 0 ? 'tss-down' : 'tss-neutral'
const riseSign = (r: number) => r > 0 ? '+' : ''

const scoreClass = (s: number) => {
  if (s >= 70) return 'tss-score-extreme-high'
  if (s >= 60) return 'tss-score-high'
  if (s >= 40) return 'tss-score-mid'
  if (s >= 20) return 'tss-score-low'
  return 'tss-score-extreme-low'
}
</script>

<template>
  <div class="market-indices">
    <div v-if="loading" class="state-msg tss-mono">
      <span class="tss-dot-live"></span>载入主要指数...
    </div>
    <div v-else-if="error" class="state-msg error tss-mono">⚠ {{ error }}</div>
    <div v-else>
      <div class="section-header">
        <h3 style="margin:0;">主要指数 · 实时行情</h3>
        <span class="tss-mono updated-at">UPDATED · {{ new Date(updatedAt).toLocaleString('zh-CN') }}</span>
      </div>
      <div class="indices-grid">
        <div v-for="idx in indices" :key="idx.symbol" class="tss-card index-card">
          <div class="idx-header">
            <span class="idx-name">{{ idx.name }}</span>
            <span class="tss-mono idx-sym">{{ idx.symbol }}</span>
          </div>
          <div class="idx-price tss-mono">{{ idx.close.toFixed(2) }}</div>
          <div :class="['idx-rise', 'tss-mono', riseClass(idx.rise)]">
            {{ riseSign(idx.rise) }}{{ idx.rise.toFixed(2) }}%
            <span class="rise-3d" :class="riseClass(parseFloat(idx.rise_change_3d))">
              · 3D {{ riseSign(parseFloat(idx.rise_change_3d)) }}{{ parseFloat(idx.rise_change_3d).toFixed(2) }}%
            </span>
          </div>
          <div class="idx-meta tss-mono">
            <span>评分 <b :class="scoreClass(idx.composite_score)">{{ idx.composite_score.toFixed(1) }}</b></span>
            <span>成交 {{ fmtAmount(idx.amount) }}</span>
          </div>
          <div class="idx-hl tss-mono">
            <span class="tss-down">L {{ idx.low.toFixed(2) }}</span>
            <div class="hl-bar">
              <div class="hl-fill" :style="{ width: ((idx.close - idx.low) / (idx.high - idx.low) * 100) + '%' }"></div>
            </div>
            <span class="tss-up">H {{ idx.high.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-indices { margin: 24px 0; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.updated-at { font-size: 11px; color: var(--tss-text-dim); letter-spacing: 1px; }

.indices-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.index-card { padding: 14px 16px; }

.idx-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.idx-name { font-weight: 600; font-size: 14px; }
.idx-sym { font-size: 10px; color: var(--tss-text-dim); }

.idx-price {
  font-size: 28px;
  font-weight: 700;
  color: var(--tss-text-primary);
  line-height: 1.1;
}
.idx-rise { font-size: 14px; font-weight: 600; margin-top: 4px; }
.rise-3d { font-size: 11px; opacity: 0.7; margin-left: 4px; }

.idx-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--tss-text-secondary);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--tss-border);
}

.idx-hl {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 10px;
}
.hl-bar {
  flex: 1;
  height: 4px;
  background: rgba(0, 217, 255, 0.1);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}
.hl-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #00ff9d, #00d9ff, #ff4d6d);
  border-radius: 2px;
  transition: width 0.6s;
}

.state-msg {
  padding: 32px;
  text-align: center;
  color: var(--tss-text-secondary);
}
.state-msg.error { color: var(--tss-danger); }
</style>

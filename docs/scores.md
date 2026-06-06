---
layout: page
title: 量化评分仪表盘
---

<script setup>
import { ref, onMounted } from 'vue'

const scores = ref({ composite: 0, daily: 0, m30: 0, m60: 0, m120: 0 })
const today = ref([])
const loaded = ref(false)

onMounted(async () => {
  try {
    const td = await (await fetch(`${import.meta.env.BASE_URL}data/today.json`)).json()
    const list = td.data || []
    if (list.length) {
      const latest = list[0]
      scores.value = {
        composite: parseFloat(latest.composite_score),
        daily: parseFloat(latest.daily_score),
        m30: parseFloat(latest.min30_score),
        m60: parseFloat(latest.min60_score),
        m120: parseFloat(latest.min120_score),
      }
      today.value = list
    }
  } catch (e) { /* 静默 */ }
  loaded.value = true
})
</script>

<div class="page-container">

<div class="page-header">
  <div class="brand tss-mono">QUANT SCORE TERMINAL</div>
  <h1 class="title">量化评分仪表盘</h1>
  <div class="subtitle">5 个周期实时评分 · 决策核心数据源</div>
</div>

<CurrentPhaseHero />

<div v-if="loaded" class="gauges-grid">
  <ScoreGauge :value="scores.composite" label="综合评分" />
  <ScoreGauge :value="scores.daily" label="日线" />
  <ScoreGauge :value="scores.m120" label="120 分钟" />
  <ScoreGauge :value="scores.m60" label="60 分钟" />
  <ScoreGauge :value="scores.m30" label="30 分钟" />
</div>

<PerformanceDash />

<IndustryHeatmap />

<div class="info-row">
  <div class="tss-card info-card">
    <h3 style="margin:0 0 12px;">🎚️ 评分阈值说明</h3>
    <div class="thresh-row"><span class="tss-chip tss-chip-purple">≥ 8.8</span> 确认期 · 主升浪强势</div>
    <div class="thresh-row"><span class="tss-chip tss-chip-info">≥ 7.5</span> 持仓阈值 · 历史上涨概率 80%</div>
    <div class="thresh-row"><span class="tss-chip tss-chip-warning">4 - 7</span> 震荡区间 · 高抛低吸</div>
    <div class="thresh-row"><span class="tss-chip tss-chip-success">&lt; 3</span> 杀跌期 · 空仓观望</div>
  </div>
  <div class="tss-card info-card">
    <h3 style="margin:0 0 12px;">📡 数据更新机制</h3>
    <ul>
      <li><code>data/today.json</code> — 当日实时评分（12 条记录）</li>
      <li><code>data/phase_decision.json</code> — 量化阶段决策核心</li>
      <li><code>data/market-realtime.json</code> — 主要指数实时</li>
      <li><code>data/industry-realtime-detail.json</code> — 行业评分明细</li>
    </ul>
    <p style="margin:8px 0 0; color: var(--tss-text-dim); font-size: 12px;">
      所有数据由独立的量化系统每日自动写入此仓库。
    </p>
  </div>
</div>

</div>

<style scoped>
.page-container { max-width: 1280px; margin: 0 auto; padding: 32px 24px 80px; }
.page-header { text-align: center; margin-bottom: 32px; padding: 16px 0; }
.brand { font-size: 11px; letter-spacing: 6px; color: var(--tss-text-dim); margin-bottom: 12px; }
.title {
  font-size: clamp(24px, 3.5vw, 40px);
  font-weight: 700;
  line-height: 1.4;
  padding: 0.15em 0;
  background: linear-gradient(90deg, #00d9ff, #b794f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
}
.subtitle { color: var(--tss-text-secondary); font-size: 14px; }

.gauges-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin: 32px 0;
}

.info-row {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  margin-top: 32px;
}
.info-card { padding: 20px; }
.info-card ul { padding-left: 20px; }
.info-card li { margin: 4px 0; font-size: 13px; color: var(--tss-text-secondary); }
.info-card code {
  background: rgba(0, 217, 255, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--vp-c-brand-1);
}
.thresh-row {
  padding: 6px 0;
  font-size: 13px;
  color: var(--tss-text-secondary);
}
.thresh-row .tss-chip { margin-right: 8px; }
</style>

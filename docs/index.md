---
layout: page
title: TSS AI Stock · 实时业绩仪表盘
---

<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const yearReturn = ref('—')
const yearReturnNote = ref('')
const systemHistoryReturn = ref('')
const systemHistoryNote = ref('')
onMounted(async () => {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}data/earnings-summary.json`)
    if (r.ok) {
      const d = await r.json()
      yearReturn.value = d.yearReturn || '—'
      yearReturnNote.value = d.yearReturnNote || ''
      systemHistoryReturn.value = d.systemHistoryReturn || ''
      systemHistoryNote.value = d.systemHistoryReturnNote || ''
    }
  } catch {}
})
</script>

<div class="dashboard-page">

<div class="hero-banner">
  <div class="banner-bg"></div>
  <div class="banner-content">
    <div class="brand tss-mono">TSS AI STOCK ＿ QUANT TRADING TERMINAL</div>
    <h1 class="title">用系统对抗人性 · 用纪律对抗情绪</h1>
    <div class="subtitle">
      <strong>2026 年至今：</strong>累计 <span class="hl">{{ yearReturn }}</span>（{{ yearReturnNote }}）
      &nbsp;·&nbsp;
      <strong>系统历史：</strong>{{ systemHistoryReturn }}（{{ systemHistoryNote }}）
      &nbsp;·&nbsp;最大回撤 <span class="hl">< 7%</span>
      &nbsp;·&nbsp;AI 评分 5 次 ≥ 90
    </div>
  </div>
</div>

<CurrentPhaseHero />

<EarningsCurve />

<MarketIndices />

<PerformanceDash />

<IndustryHeatmap />

<div class="cta-section">
  <a :href="withBase('/timeline')" class="cta-card">
    <div class="cta-icon">🚀</div>
    <div class="cta-title">主升浪时间线</div>
    <div class="cta-desc">两次主升浪预判完整路径</div>
  </a>
  <a :href="withBase('/phases')" class="cta-card">
    <div class="cta-icon">🎯</div>
    <div class="cta-title">四阶段交易法</div>
    <div class="cta-desc">自创理论 + 实战节点表</div>
  </a>
  <a :href="withBase('/scores')" class="cta-card">
    <div class="cta-icon">📊</div>
    <div class="cta-title">量化评分仪表盘</div>
    <div class="cta-desc">5 周期评分实时监控</div>
  </a>
  <a :href="withBase('/journal/')" class="cta-card">
    <div class="cta-icon">📅</div>
    <div class="cta-title">交易记录博客</div>
    <div class="cta-desc">每日自评 + AI 评 + 月度复盘</div>
  </a>
</div>

</div>

<style>
.dashboard-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.hero-banner {
  position: relative;
  padding: 64px 0 48px;
  margin-bottom: 32px;
  text-align: center;
  overflow: hidden;
}
.banner-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 50%, rgba(0, 217, 255, 0.18), transparent 50%),
    radial-gradient(circle at 70% 50%, rgba(183, 148, 246, 0.14), transparent 50%);
  pointer-events: none;
}
.banner-content { position: relative; z-index: 1; }
.brand {
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--tss-text-dim);
  margin-bottom: 16px;
}
.title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 700;
  line-height: 1.4;
  padding: 0.15em 0;
  background: linear-gradient(90deg, #00d9ff 0%, #b794f6 50%, #ff006e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px;
  filter: drop-shadow(0 0 32px rgba(0, 217, 255, 0.3));
}
.subtitle {
  font-size: 14px;
  color: var(--tss-text-secondary);
  font-family: 'SF Mono', monospace;
}
.hl {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  text-shadow: 0 0 12px rgba(0, 217, 255, 0.5);
}

.cta-section {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-top: 48px;
}
.cta-card {
  display: block;
  padding: 24px;
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-radius: 12px;
  text-align: center;
  text-decoration: none !important;
  color: var(--tss-text-primary) !important;
  transition: all 0.3s;
}
.cta-card:hover {
  border-color: var(--tss-border-glow);
  transform: translateY(-4px);
  box-shadow: 0 0 24px rgba(0, 217, 255, 0.3), 0 12px 32px rgba(0, 0, 0, 0.4);
}
.cta-icon { font-size: 32px; margin-bottom: 12px; }
.cta-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.cta-desc { font-size: 12px; color: var(--tss-text-secondary); }
</style>

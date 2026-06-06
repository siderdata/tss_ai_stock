---
layout: page
title: 主升浪时间线 · 完整预判路径
---

<script setup>
import { withBase } from 'vitepress'
</script>

<div class="page-container">

<div class="page-header">
  <div class="brand tss-mono">MAIN WAVE TIMELINE</div>
  <h1 class="title">两次主升浪预判 · 完整路径</h1>
  <div class="subtitle">从 2025.12 量化系统上线，到 2026.06 当前阶段 · 每个节点可验证</div>
</div>

<MainWaveTimeline />

<div class="page-footer">
  <div class="tss-card insight-card">
    <h3 style="margin:0 0 12px;">📊 时间线背后的方法论</h3>
    <p>主升浪不是猜出来的，是<b>量化阈值触发的</b>：</p>
    <ul>
      <li>9.0 分阈值：历史验证突破即主升浪启动信号</li>
      <li>多周期共振：30min / 60min / 120min / 日线全部突破 7.5</li>
      <li>量价配合：天量爆发（3.6 万亿历史最高）伴随评分突破</li>
      <li>修复力度决定后续强度（如 7/7 从 5.9 修复到 9.5 = 主升浪加速）</li>
    </ul>
    <p style="margin-bottom:0;">详细方法论见 <a :href="withBase('/phases')">🎯 四阶段交易法</a></p>
  </div>
</div>

</div>

<style scoped>
.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}
.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px 0;
}
.brand {
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--tss-text-dim);
  margin-bottom: 12px;
}
.title {
  font-size: clamp(24px, 3.5vw, 40px);
  font-weight: 700;
  line-height: 1.4;
  padding: 0.15em 0;
  background: linear-gradient(90deg, #00d9ff 0%, #b794f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
}
.subtitle { color: var(--tss-text-secondary); font-size: 14px; }

.page-footer { margin-top: 48px; }
.insight-card { padding: 24px; }
.insight-card ul { padding-left: 20px; }
.insight-card li { margin: 4px 0; color: var(--tss-text-secondary); }
.insight-card a { color: var(--vp-c-brand-1); }
</style>

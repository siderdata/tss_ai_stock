---
layout: page
title: 四阶段交易法
---

<script setup>
import { withBase } from 'vitepress'
</script>

<div class="page-container">

<div class="page-header">
  <div class="brand tss-mono">FOUR-PHASE TRADING SYSTEM</div>
  <h1 class="title">四阶段交易法</h1>
  <div class="subtitle">自创理论 · A 股市场状态分类 + 仓位策略 + 操作纪律</div>
</div>

<!-- 当前阶段高亮 -->
<CurrentPhaseHero />

<!-- 四阶段卡片 -->
<div class="phases-grid">
  <div class="tss-card phase-card" data-phase="up">
    <div class="phase-num tss-mono">PHASE 1</div>
    <div class="phase-name">🟢 主升上涨浪</div>
    <div class="phase-time tss-mono">时间占比 20%</div>
    <div class="phase-meta">
      <div><span class="lbl tss-mono">评分</span> 7.5 - 9.5 分</div>
      <div><span class="lbl tss-mono">仓位</span> 70-80% 重仓</div>
      <div><span class="lbl tss-mono">纪律</span> 坚定持有</div>
    </div>
    <div class="phase-quote">"20% 的时间创造绝大部分收益"</div>
  </div>

  <div class="tss-card phase-card" data-phase="high">
    <div class="phase-num tss-mono">PHASE 2</div>
    <div class="phase-name">🟡 高位震荡浪</div>
    <div class="phase-time tss-mono">时间占比 35%</div>
    <div class="phase-meta">
      <div><span class="lbl tss-mono">评分</span> 4 - 7 分</div>
      <div><span class="lbl tss-mono">仓位</span> 30-50%</div>
      <div><span class="lbl tss-mono">纪律</span> 高抛低吸</div>
    </div>
    <div class="phase-quote">"箱体运行，不预测"</div>
  </div>

  <div class="tss-card phase-card" data-phase="down">
    <div class="phase-num tss-mono">PHASE 3 ⚠</div>
    <div class="phase-name">🔴 调整杀跌浪</div>
    <div class="phase-time tss-mono">时间占比 10%（最关键）</div>
    <div class="phase-meta">
      <div><span class="lbl tss-mono">评分</span> < 3 分</div>
      <div><span class="lbl tss-mono">仓位</span> 0-10% 空仓</div>
      <div><span class="lbl tss-mono">纪律</span> 严控回撤</div>
    </div>
    <div class="phase-quote">"3月 -9.26% 教训：逆系统融资加仓"</div>
  </div>

  <div class="tss-card phase-card" data-phase="low">
    <div class="phase-num tss-mono">PHASE 4</div>
    <div class="phase-name">🔵 低位震荡浪</div>
    <div class="phase-time tss-mono">时间占比 35%</div>
    <div class="phase-meta">
      <div><span class="lbl tss-mono">评分</span> 4 - 7 分</div>
      <div><span class="lbl tss-mono">仓位</span> 20-40%</div>
      <div><span class="lbl tss-mono">纪律</span> 逢低吸纳</div>
    </div>
    <div class="phase-quote">"等待 9 分反转"</div>
  </div>
</div>

<!-- 六子阶段状态机 -->
<div class="sub-phase-section">

## 主升浪六子阶段精修

> 把"主升上涨浪"内部继续切成 6 个状态，每个状态有不同评分阈值和仓位建议。

<div class="state-machine">
  <div class="state-row">
    <div class="state-cell" data-stage="1">
      <div class="stage-no tss-mono">01</div>
      <div class="stage-name">萌芽期</div>
      <div class="stage-rule tss-mono">7.5 ≤ 综合 < 8.8<br/>日线 ≥ 8</div>
      <div class="stage-pos">5-7 成</div>
    </div>
    <div class="state-arrow">→</div>
    <div class="state-cell" data-stage="2">
      <div class="stage-no tss-mono">02</div>
      <div class="stage-name">确认期</div>
      <div class="stage-rule tss-mono">综合 ≥ 8.8</div>
      <div class="stage-pos">7-9 成</div>
    </div>
    <div class="state-arrow">→</div>
    <div class="state-cell" data-stage="3">
      <div class="stage-no tss-mono">03</div>
      <div class="stage-name">初期</div>
      <div class="stage-rule tss-mono">综合 ≥ 7.5<br/>日线 ≥ 8</div>
      <div class="stage-pos">8-10 成</div>
    </div>
  </div>

  <div class="state-row">
    <div class="state-cell" data-stage="6">
      <div class="stage-no tss-mono">退出</div>
      <div class="stage-name">尾期</div>
      <div class="stage-rule tss-mono">综合 < 7.5<br/>日线 ≥ 8</div>
      <div class="stage-pos">5-7 成</div>
    </div>
    <div class="state-arrow">←</div>
    <div class="state-cell" data-stage="5">
      <div class="stage-no tss-mono">05</div>
      <div class="stage-name">后期</div>
      <div class="stage-rule tss-mono">综合 ≥ 7.5<br/>日线 ≥ 8</div>
      <div class="stage-pos">8-10 成</div>
    </div>
    <div class="state-arrow">←</div>
    <div class="state-cell" data-stage="4">
      <div class="stage-no tss-mono">04</div>
      <div class="stage-name">中继期</div>
      <div class="stage-rule tss-mono">综合 < 7.5<br/>日线 ≥ 8</div>
      <div class="stage-pos">保持仓位</div>
    </div>
  </div>
</div>

</div>

<!-- 实战节点 -->
<div class="exec-section">

## 2026 年实战节点

| 日期 | 评分 | 触发阶段 | 操作 | 结果 |
|------|------|----------|------|------|
| **2026-01-13** | 7.3 | 跌破 7.5 触发"观察→离场" | 减仓至 5 成 | 1/14-16 三天市场调整 |
| **2026-01-26** | 5.7 | 预判主升尾声 | 清仓中小创科至 38% | 1/29 大小票切换，收益破 7% |
| **2026-04-28** | 5.73 | 评分暴跌 + 顶背离 | 清零融资 15.2 万 | 5/14-15 完整执行 V7 |
| **2026-05-14** | 6.12 | V7 "主升浪不减仓" 完整执行 | 两天回撤 17,000 元 | 5/22 退出，纪律执行到底 |
| **2026-05-29** | 2.71 | 第四次"狼来了"成真 | 4100 清仓科创+中证 500 | 当日科创 50 -5.04%，成功逃顶 |

</div>

<div class="cta-row">
  <a :href="withBase('/wiki-四阶段交易法')" class="cta-link">📘 完整专题论文</a>
  <a :href="withBase('/timeline')" class="cta-link">🚀 主升浪时间线</a>
  <a :href="withBase('/journal/')" class="cta-link">📅 交易记录博客</a>
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

.phases-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin: 32px 0;
}
.phase-card {
  padding: 20px;
  transition: all 0.4s;
}
.phase-card[data-phase="up"] { border-top: 3px solid #ff4d6d; }
.phase-card[data-phase="high"] { border-top: 3px solid #ffb347; }
.phase-card[data-phase="down"] { border-top: 3px solid #00ff9d; }
.phase-card[data-phase="low"] { border-top: 3px solid #b794f6; }

.phase-num {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--tss-text-dim);
}
.phase-name { font-size: 20px; font-weight: 700; margin: 6px 0 4px; }
.phase-time { font-size: 11px; color: var(--tss-text-dim); margin-bottom: 12px; }
.phase-meta {
  padding: 12px 0;
  border-top: 1px dashed var(--tss-border);
  border-bottom: 1px dashed var(--tss-border);
  font-size: 13px;
  color: var(--tss-text-secondary);
}
.phase-meta > div { padding: 3px 0; }
.lbl { color: var(--tss-text-dim); font-size: 10px; letter-spacing: 1px; margin-right: 6px; }
.phase-quote {
  font-size: 12px;
  color: var(--tss-text-dim);
  font-style: italic;
  margin-top: 12px;
  padding-top: 8px;
}

.sub-phase-section, .exec-section { margin-top: 48px; }
.sub-phase-section h2, .exec-section h2 {
  font-size: 24px;
  margin-bottom: 16px;
  line-height: 1.5;
  padding: 0.1em 0;
  background: linear-gradient(90deg, #00d9ff, #b794f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.state-machine {
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-radius: 12px;
  padding: 24px;
}
.state-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.state-row:last-child { margin-bottom: 0; }
.state-cell {
  flex: 1;
  min-width: 140px;
  max-width: 220px;
  padding: 14px;
  background: rgba(0, 217, 255, 0.04);
  border: 1px solid var(--tss-border);
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
}
.state-cell:hover {
  background: rgba(0, 217, 255, 0.1);
  border-color: var(--tss-border-glow);
  transform: scale(1.03);
}
.stage-no {
  font-size: 11px;
  color: var(--tss-text-dim);
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.stage-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 8px;
}
.stage-rule {
  font-size: 10px;
  color: var(--tss-text-secondary);
  line-height: 1.5;
  padding: 6px 0;
  border-top: 1px dashed var(--tss-border);
  border-bottom: 1px dashed var(--tss-border);
}
.stage-pos {
  font-size: 13px;
  font-weight: 700;
  color: var(--tss-warning);
  margin-top: 8px;
}
.state-arrow {
  display: flex;
  align-items: center;
  color: var(--vp-c-brand-1);
  font-size: 20px;
}

.exec-section :deep(table) {
  width: 100%;
  border-collapse: collapse;
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-radius: 8px;
  overflow: hidden;
}
.exec-section :deep(th) {
  background: rgba(0, 217, 255, 0.1);
  color: var(--vp-c-brand-1);
  padding: 12px;
  text-align: left;
}
.exec-section :deep(td) {
  padding: 10px 12px;
  border-top: 1px solid var(--tss-border);
  color: var(--tss-text-secondary);
  font-size: 13px;
}
.exec-section :deep(tr:hover td) { background: rgba(0, 217, 255, 0.04); }

.cta-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 48px;
}
.cta-link {
  padding: 12px 24px;
  background: var(--tss-bg-card);
  border: 1px solid var(--tss-border);
  border-radius: 8px;
  color: var(--vp-c-brand-1) !important;
  text-decoration: none !important;
  font-size: 14px;
  transition: all 0.3s;
}
.cta-link:hover {
  border-color: var(--tss-border-glow);
  box-shadow: 0 0 16px rgba(0, 217, 255, 0.3);
  transform: translateY(-2px);
}
</style>

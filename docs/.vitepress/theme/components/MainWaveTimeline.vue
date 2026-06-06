<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

interface Node {
  date: string
  score: string
  title: string
  predict: string
  actual: string
  detail: string
  link: string
  highlight?: boolean
}

const nodes: Node[] = [
  {
    date: '2025-12-24',
    score: '9.10',
    title: '第一波主升浪启动',
    predict: '突破 9 分阈值，识别主升浪',
    actual: '17 连阳开启，3.6 万亿天量',
    detail: '量化系统首次突破 9 分阈值，多周期共振，操作满仓',
    link: '/journal/2026-01/2026-01_Summary',
    highlight: true,
  },
  {
    date: '2026-01-12',
    score: '9.50',
    title: 'A股 33 年首次 17 连阳',
    predict: '周一爆量 · 上证至少 4170',
    actual: '3.6 万亿历史天量 · 上证 4168',
    detail: 'AI 评 100/100，预判误差仅 -2 点；3.6 万亿创 A 股历史最高',
    link: '/journal/2026-01/2026-01_Summary',
    highlight: true,
  },
  {
    date: '2026-01-13',
    score: '7.30',
    title: '纪律执行：跌破阈值',
    predict: '7.5 分纪律线触发减仓',
    actual: '减仓至 5 成，避开 1/14-1/16 调整',
    detail: '系统纪律首次触发，AI 评 98/100',
    link: '/journal/2026-01/daily/2026-01-13AI评',
  },
  {
    date: '2026-03',
    score: '<3.0',
    title: '逆系统教训：-9.26%',
    predict: '阶段3杀跌浪应空仓',
    actual: '逆系统融资加仓 → 大幅亏损',
    detail: '系统升级 V3 → V6.4，认知突破：相信系统、相信系统、相信系统',
    link: '/journal/2026-04/2026-04-月度总结',
  },
  {
    date: '2026-04-16',
    score: '9.44',
    title: '第二波主升浪确认',
    predict: '综合 9.44、日线 9.40 共振',
    actual: '满仓+融资 110%，4 月 +10.05%',
    detail: '系统建立以来评分新高；从 3 月教训中蜕变，纪律执行优秀',
    link: '/journal/2026-04/2026-04-月度总结',
    highlight: true,
  },
  {
    date: '2026-05-29',
    score: '2.71',
    title: '第四次"狼来了"成真',
    predict: '权重掩护出货，主升浪结束',
    actual: '4100 清仓 · 当日科创50 -5.04%',
    detail: 'V7 框架完整执行 → V3.2 框架诞生，认知觉醒月',
    link: '/journal/2026-05/2026-05-月度总结',
  },
  {
    date: '2026-06-05',
    score: '1.28',
    title: '阶段3 杀跌浪进行中',
    predict: '科技股大退潮，权重出货',
    actual: '空仓观望 + 小仓位博弈超跌',
    detail: '当前正处于此阶段 · 操作纪律：不抄底、不接飞刀',
    link: '/journal/2026-06/2026-06_Plan',
  },
]

const visible = ref(false)
onMounted(() => { setTimeout(() => visible.value = true, 100) })
</script>

<template>
  <div class="wave-timeline">
    <div class="timeline-track">
      <div class="track-line"></div>
      <div
        v-for="(node, i) in nodes"
        :key="node.date"
        :class="['node-wrapper', { left: i % 2 === 0, right: i % 2 === 1, visible }]"
        :style="{ '--delay': (i * 0.15) + 's' }"
      >
        <div :class="['wave-dot', { highlight: node.highlight }]">
          <div class="wave-ring" v-if="node.highlight"></div>
        </div>
        <div :class="['node-card', 'tss-card', { highlight: node.highlight }]">
          <div class="node-header">
            <span class="node-date tss-mono">{{ node.date }}</span>
            <span :class="['node-score', 'tss-mono', node.highlight ? 'score-extreme' : '']">
              {{ node.score }}
            </span>
          </div>
          <div class="node-title">{{ node.title }}</div>
          <div class="node-detail">
            <div class="row"><span class="lbl tss-mono">PREDICT</span><span class="val">{{ node.predict }}</span></div>
            <div class="row"><span class="lbl tss-mono">ACTUAL</span><span class="val val-actual">{{ node.actual }}</span></div>
          </div>
          <div class="node-foot">
            <span class="foot-text">{{ node.detail }}</span>
            <a :href="withBase(node.link)" class="foot-link tss-mono">详情 →</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wave-timeline {
  position: relative;
  padding: 40px 0;
}

.timeline-track {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 0;
}

.track-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(0, 217, 255, 0.3) 10%,
    rgba(183, 148, 246, 0.5) 50%,
    rgba(0, 217, 255, 0.3) 90%,
    transparent 100%);
  transform: translateX(-50%);
}

.node-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  align-items: center;
  margin-bottom: 32px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
  transition-delay: var(--delay);
}
.node-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.wave-dot {
  position: relative;
  grid-column: 2;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  justify-self: center;
  box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.2), 0 0 16px rgba(0, 217, 255, 0.5);
  z-index: 2;
}
.wave-dot.highlight {
  background: #ff006e;
  box-shadow: 0 0 0 4px rgba(255, 0, 110, 0.2), 0 0 24px rgba(255, 0, 110, 0.6);
  width: 22px;
  height: 22px;
}
.wave-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #ff006e;
  animation: ring-pulse 2s ease-out infinite;
}
@keyframes ring-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
}

.node-card {
  padding: 16px;
  position: relative;
}
.node-wrapper.left .node-card {
  grid-column: 1;
  text-align: right;
}
.node-wrapper.right .node-card {
  grid-column: 3;
  text-align: left;
}
.node-card.highlight {
  border-color: rgba(255, 0, 110, 0.4);
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.05), var(--tss-bg-card));
}
.node-card.highlight:hover {
  box-shadow: 0 0 24px rgba(255, 0, 110, 0.3), 0 12px 32px rgba(0, 0, 0, 0.4);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 12px;
}
.node-wrapper.left .node-header { flex-direction: row-reverse; }
.node-date { color: var(--tss-text-dim); }
.node-score {
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-shadow: 0 0 12px rgba(0, 217, 255, 0.4);
}
.score-extreme {
  color: #ff006e;
  text-shadow: 0 0 16px rgba(255, 0, 110, 0.6);
}

.node-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--tss-text-primary);
  margin-bottom: 12px;
}

.node-detail {
  border-top: 1px dashed var(--tss-border);
  padding-top: 8px;
}
.row {
  display: flex;
  font-size: 12px;
  margin-bottom: 4px;
  gap: 8px;
}
.node-wrapper.left .row {
  flex-direction: row-reverse;
}
.lbl {
  color: var(--tss-text-dim);
  font-size: 10px;
  letter-spacing: 1px;
  min-width: 56px;
}
.val { color: var(--tss-text-secondary); flex: 1; }
.val-actual { color: var(--vp-c-brand-1); font-weight: 500; }

.node-foot {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--tss-border);
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.foot-text { color: var(--tss-text-dim); flex: 1; }
.foot-link {
  color: var(--vp-c-brand-1);
  white-space: nowrap;
  text-decoration: none;
}
.foot-link:hover { text-shadow: 0 0 8px rgba(0, 217, 255, 0.6); }

@media (max-width: 768px) {
  .timeline-track { padding-left: 40px; }
  .track-line { left: 24px; transform: none; }
  .node-wrapper {
    grid-template-columns: 0 32px 1fr;
  }
  .wave-dot {
    grid-column: 2;
    margin-left: -8px;
  }
  .node-wrapper.left .node-card,
  .node-wrapper.right .node-card {
    grid-column: 3;
    text-align: left;
  }
  .node-wrapper.left .node-header,
  .node-wrapper.left .row {
    flex-direction: row;
  }
}
</style>

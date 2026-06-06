<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface PhaseData {
  timestamp: string
  trade_date: string
  phase: {
    current_phase: string
    main_phase: string
    sub_phase: string
    confidence: number
  }
  scores: {
    composite_score: number
    daily_score: number
    avg_score: number
    recent_avg: number
    recent_trend: number
    high_ratio: number
    low_ratio: number
  }
  position: {
    recommended_ratio: number
    position_desc: string
    reason: string
  }
  action: {
    suggestion: string
    alert_level: string
  }
  history: {
    days_in_phase: number
    max_drawdown: number
  }
}

const data = ref<PhaseData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/phase_decision.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data.value = await res.json()
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
})

// 阶段颜色映射
const phaseColor = computed(() => {
  if (!data.value) return 'tss-chip-info'
  const main = data.value.phase.main_phase
  if (main.includes('主升')) return 'tss-chip-danger'      // 红涨
  if (main.includes('杀跌')) return 'tss-chip-success'     // 绿跌
  if (main.includes('高位')) return 'tss-chip-warning'
  if (main.includes('低位')) return 'tss-chip-purple'
  return 'tss-chip-info'
})

// 评分配色
const scoreClass = computed(() => {
  if (!data.value) return ''
  const s = data.value.scores.composite_score
  if (s >= 8.8) return 'tss-score-extreme-high'
  if (s >= 7.5) return 'tss-score-high'
  if (s >= 4) return 'tss-score-mid'
  if (s >= 2) return 'tss-score-low'
  return 'tss-score-extreme-low'
})

const trendArrow = computed(() => {
  if (!data.value) return ''
  const t = data.value.scores.recent_trend
  if (t > 0.3) return '↑'
  if (t < -0.3) return '↓'
  return '→'
})

const trendColor = computed(() => {
  if (!data.value) return ''
  const t = data.value.scores.recent_trend
  if (t > 0.3) return 'tss-up'
  if (t < -0.3) return 'tss-down'
  return 'tss-neutral'
})
</script>

<template>
  <div class="phase-hero">
    <div v-if="loading" class="loading">
      <span class="tss-dot-live"></span>
      <span class="tss-mono">载入实时阶段数据...</span>
    </div>
    <div v-else-if="error" class="error tss-mono">
      ⚠ 数据加载失败: {{ error }}
    </div>
    <div v-else-if="data" class="hero-inner">
      <!-- 顶部状态条 -->
      <div class="status-bar">
        <span><span class="tss-dot-live"></span><span class="tss-mono">LIVE · {{ data.timestamp }}</span></span>
        <span class="tss-mono">交易日 {{ data.trade_date }}</span>
        <span class="tss-mono">置信度 {{ data.phase.confidence }}%</span>
      </div>

      <!-- 主标题：当前阶段 -->
      <div class="main-stage">
        <div class="stage-label tss-mono">CURRENT MARKET PHASE</div>
        <div class="stage-name">
          <span :class="['tss-chip', phaseColor, 'tss-pulse']" style="font-size:18px; padding:8px 20px;">
            {{ data.phase.main_phase }}
          </span>
          <span class="sub-phase tss-mono">› {{ data.phase.sub_phase }}</span>
        </div>
      </div>

      <!-- 评分大数字 + 仓位 + 操作 -->
      <div class="tss-grid-3 metrics">
        <div class="tss-card metric-card">
          <div class="metric-label tss-mono">综合评分</div>
          <div :class="['tss-mega-number', scoreClass]" style="font-size:64px;">
            {{ data.scores.composite_score.toFixed(2) }}
          </div>
          <div class="metric-sub tss-mono">
            日线 {{ data.scores.daily_score.toFixed(2) }} ·
            5日均 {{ data.scores.recent_avg.toFixed(2) }}
            <span :class="trendColor">{{ trendArrow }} {{ data.scores.recent_trend.toFixed(2) }}</span>
          </div>
        </div>

        <div class="tss-card metric-card">
          <div class="metric-label tss-mono">建议仓位</div>
          <div class="tss-mega-number" style="font-size:64px;">
            {{ data.position.recommended_ratio }}%
          </div>
          <div class="metric-sub tss-mono">{{ data.position.position_desc }} · {{ data.position.reason }}</div>
        </div>

        <div class="tss-card metric-card">
          <div class="metric-label tss-mono">预警级别</div>
          <div class="alert-big" style="font-size:36px; padding-top:12px;">{{ data.action.alert_level }}</div>
          <div class="metric-sub tss-mono">
            高分比 {{ data.scores.high_ratio.toFixed(1) }}% ·
            低分比 {{ data.scores.low_ratio.toFixed(1) }}%
          </div>
        </div>
      </div>

      <!-- 操作建议 -->
      <div class="tss-card suggestion">
        <div class="metric-label tss-mono" style="margin-bottom:8px;">SYSTEM SUGGESTION</div>
        <div class="suggest-text">{{ data.action.suggestion }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phase-hero {
  margin: 24px 0;
}
.loading, .error {
  padding: 40px;
  text-align: center;
  color: var(--tss-text-secondary);
}
.error { color: var(--tss-danger); }

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--tss-text-dim);
  padding: 8px 0 16px;
  border-bottom: 1px dashed var(--tss-border);
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.main-stage {
  text-align: center;
  margin: 32px 0;
}
.stage-label {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--tss-text-dim);
  margin-bottom: 12px;
}
.stage-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.sub-phase {
  color: var(--tss-text-secondary);
  font-size: 16px;
}

.metrics {
  margin: 24px 0;
}
.metric-card {
  text-align: center;
}
.metric-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--tss-text-dim);
  margin-bottom: 12px;
}
.metric-sub {
  font-size: 12px;
  color: var(--tss-text-secondary);
  margin-top: 8px;
}
.alert-big {
  font-weight: 700;
}

.suggestion {
  margin-top: 16px;
}
.suggest-text {
  font-family: 'SF Mono', monospace;
  font-size: 14px;
  color: var(--tss-text-primary);
  line-height: 1.7;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Props {
  compact?: boolean
}
const props = withDefaults(defineProps<Props>(), { compact: false })

const phase = ref<string>('')
const subPhase = ref<string>('')
const score = ref<number>(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/phase_decision.json`)
    const data = await res.json()
    phase.value = data.phase.main_phase
    subPhase.value = data.phase.sub_phase
    score.value = data.scores.composite_score
  } catch (e) {
    phase.value = '未知'
  } finally {
    loading.value = false
  }
})

const phaseColor = computed(() => {
  if (phase.value.includes('主升')) return 'tss-chip-danger'
  if (phase.value.includes('杀跌')) return 'tss-chip-success'
  if (phase.value.includes('高位')) return 'tss-chip-warning'
  if (phase.value.includes('低位')) return 'tss-chip-purple'
  return 'tss-chip-info'
})
</script>

<template>
  <span v-if="!loading" :class="['tss-chip', phaseColor]">
    <span class="tss-dot-live" style="width:6px;height:6px;"></span>
    <span class="tss-mono">{{ phase }}</span>
    <span v-if="!compact" style="opacity:0.7;">· {{ subPhase }} · {{ score.toFixed(2) }}</span>
  </span>
</template>

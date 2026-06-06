import DefaultTheme from 'vitepress/theme'
import './style.css'
import PerformanceDash from './components/PerformanceDash.vue'
import PhaseIndicator from './components/PhaseIndicator.vue'
import MainWaveTimeline from './components/MainWaveTimeline.vue'
import ScoreGauge from './components/ScoreGauge.vue'
import IndustryHeatmap from './components/IndustryHeatmap.vue'
import EarningsCurve from './components/EarningsCurve.vue'
import MarketIndices from './components/MarketIndices.vue'
import CurrentPhaseHero from './components/CurrentPhaseHero.vue'
import JournalView from './components/JournalView.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PerformanceDash', PerformanceDash)
    app.component('PhaseIndicator', PhaseIndicator)
    app.component('MainWaveTimeline', MainWaveTimeline)
    app.component('ScoreGauge', ScoreGauge)
    app.component('IndustryHeatmap', IndustryHeatmap)
    app.component('EarningsCurve', EarningsCurve)
    app.component('MarketIndices', MarketIndices)
    app.component('CurrentPhaseHero', CurrentPhaseHero)
    app.component('JournalView', JournalView)
  },
}

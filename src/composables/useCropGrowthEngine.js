/**
 * 作物生长引擎 Composable（V2.0）
 * V1.1 1:1 接口对齐：useCropGrowthEngine.ts
 */
import { ref, computed } from 'vue'

export const GROWTH_STAGE_CONFIG = {
  seedling: { label: '苗期', days: 30 },
  vegetative: { label: '营养生长期', days: 45 },
  flowering: { label: '开花期', days: 20 },
  fruiting: { label: '结果期', days: 40 },
  harvest: { label: '收获期', days: 15 },
}

export function getSeasonByMonth(month) {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function getSeasonalIntervalAdjustment(season) {
  return { spring: 1.0, summer: 1.2, autumn: 1.0, winter: 0.7 }[season] || 1.0
}

export function useCropGrowthEngine() {
  const currentStage = ref('vegetative')
  const predictedTasks = ref([])

  const generatePredictedTasks = (crop) => {
    const stage = GROWTH_STAGE_CONFIG[currentStage.value]
    return [{
      id: `pred-${Date.now()}`,
      type: 'irrigation',
      title: `${crop || '作物'} 灌溉任务`,
      priority: 'normal',
      estimatedDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    }]
  }

  return {
    currentStage,
    predictedTasks,
    GROWTH_STAGE_CONFIG,
    getSeasonByMonth,
    getSeasonalIntervalAdjustment,
    generatePredictedTasks,
  }
}

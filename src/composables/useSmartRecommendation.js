/**
 * 智能推荐 Composable（V2.0）
 * V1.1 1:1 接口对齐：useSmartRecommendation.ts (farm 子目录)
 */
import { ref, computed } from 'vue'
import { useComprehensiveDispatch } from './useComprehensiveDispatch.js'

export function useSmartRecommendation() {
  const dispatch = useComprehensiveDispatch()

  const recommendations = computed(() => {
    return dispatch.taskPool.value.map(task => ({
      task,
      suggestions: dispatch.getRecommendations(task).slice(0, 3),
    }))
  })

  return {
    recommendations,
  }
}

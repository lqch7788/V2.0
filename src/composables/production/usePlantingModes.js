/**
 * 种植模式下拉数据 composable
 * 第二阶段 Y1 重构：3 个 TechSolution 弹窗（Create/Edit/BatchEdit）原本各自重复 25 行 loadPlantingModes 逻辑
 * 现抽取为单一 composable，避免字典加载策略变化需改 3 处的维护成本
 */
import { ref } from 'vue'
import { useDictionaryStore } from '@/stores/modules/dictionary'
import { PLANTING_MODE_FALLBACK } from '@/views/production/constants/techSolutionScopes'

export function usePlantingModes() {
  const dictionaryStore = useDictionaryStore()
  const plantingModes = ref([...PLANTING_MODE_FALLBACK])

  const loadPlantingModes = async () => {
    // 优先从已加载的字典数据中提取
    try {
      if (dictionaryStore.dictionaries && dictionaryStore.dictionaries.length > 0) {
        const list = dictionaryStore.dictionaries
          .filter((d) => d.category === 'planting_mode' && d.status !== 'inactive')
          .map((d) => d.name)
        if (list.length > 0) {
          plantingModes.value = list
          return
        }
      }
    } catch {
      // 静默降级
    }
    // 字典未加载则触发加载，再提取
    try {
      await dictionaryStore.loadDictionaries()
      const list = dictionaryStore.dictionaries
        .filter((d) => d.category === 'planting_mode' && d.status !== 'inactive')
        .map((d) => d.name)
      plantingModes.value = list.length > 0 ? list : [...PLANTING_MODE_FALLBACK]
    } catch {
      plantingModes.value = [...PLANTING_MODE_FALLBACK]
    }
  }

  return {
    plantingModes,
    loadPlantingModes,
  }
}

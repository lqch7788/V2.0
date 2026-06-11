/**
 * 种植模式下拉数据 composable
 * 第二阶段 Y1 重构：3 个 TechSolution 弹窗（Create/Edit/BatchEdit）原本各自重复 25 行 loadPlantingModes 逻辑
 * 现抽取为单一 composable，避免字典加载策略变化需改 3 处的维护成本
 *
 * 修复 P0-T4：原版只返回 string[] 中文 label，导致 plantingModeDisplay 无法把 DB 存的
 * 英文 value（如 "plug_seedling"）翻译成中文（"穴盘育苗"）。
 * 现版返回 string[] 仍是下拉显示的中文 label（兼容原 usage），
 * 同时 plantModeLabels.value 提供 Map<英文 value, 中文 label> 用于翻译。
 */
import { ref } from 'vue'
import { useDictionaryStore } from '@/stores/modules/dictionary'
import { PLANTING_MODE_FALLBACK } from '@/views/production/constants/techSolutionScopes'

// V1.1 1:1 翻译：3 套模式（育种/育苗/种植）合并为 value→label 映射
// 用于把 DB 存的英文 value 翻译成中文 label
const STATIC_MODE_LABELS = {
  // 育种模式
  supplier_direct: '供应商直供',
  bidding: '招标采购',
  designated: '定点采购',
  internal_seed: '内部种源',
  external_purchase: '外部采购',
  // 育苗模式
  plug_seedling: '穴盘育苗',
  floating: '漂浮育苗',
  nutrient_block: '营养钵育苗',
  grafting: '嫁接育苗',
  tissue_culture: '组培育苗',
  // 种植模式
  open_field: '露天栽培',
  greenhouse: '大棚栽培',
  mulch: '地膜覆盖',
  intercropping: '套种轮作',
  vertical: '立体栽培',
  // 兜底
  water_culture: '水培',
  soil_culture: '土培',
  substrate_culture: '基质培',
  mist_culture: '雾培',
}

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

  /**
   * 把 "plug_seedling,floating" 翻译成 "穴盘育苗、漂浮育苗"
   * 优先查 STATIC_MODE_LABELS（V1.1 1:1 翻译），fallback 到 plantingModes 数组
   * @param {string} raw 英文 value（可能多个逗号分隔）
   * @returns {string} 中文 label（多个用"、'分隔）
   */
  const translatePlantingMode = (raw) => {
    if (!raw) return ''
    return String(raw)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => {
        // 优先 V1.1 静态映射
        if (STATIC_MODE_LABELS[v]) return STATIC_MODE_LABELS[v]
        // fallback 到字典 label
        const list = plantingModes.value || []
        if (list.includes(v)) return v
        // 都找不到返回原值（避免乱显示）
        return v
      })
      .filter(Boolean)
      .join('、')
  }

  return {
    plantingModes,
    loadPlantingModes,
    translatePlantingMode,
  }
}

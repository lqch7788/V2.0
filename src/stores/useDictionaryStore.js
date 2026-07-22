/**
 * 2026-07-22 1:1 迁移自 V1.1 stores/useDictionaryStore.ts
 * 字典 Store - 提供 getDictItems / getDictItemName 等工具函数
 *
 * 注：V2.0 主字典 Store 已在 stores/modules/dictionary.js
 * 本文件仅作为 V1.1 兼容入口，保留相同的 API 形态
 */
import { getDictionaries } from '@/services/apiBasicDataService'
import { logger } from '@/lib/logger'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 2026-07-17：pesticide_type / application_method / control_type / watering_method / fertilization_method 字典兜底
// 覆盖全部分类常用码 — 即使后端字典未拉到，前端也能显示中文
const DICT_FALLBACK = {
  pesticide_type: {
    insecticide: '杀虫剂',
    fungicide: '杀菌剂',
    herbicide: '除草剂',
    acaricide: '杀螨剂',
    plant_growth_regulator: '调节剂',
    protective: '保护剂',
    adjuvant: '助剂',
    other: '其他',
    nematicide: '杀线虫剂',
    insecticide_chewing: '杀虫剂-咀嚼式',
    insecticide_sucking: '杀虫剂-刺吸式',
    acaricide_mite: '杀螨剂-螨类',
    fungicide_fungi: '杀菌剂-真菌',
    fungicide_bacteria: '杀菌剂-细菌',
    fungicide_virus: '杀菌剂-病毒',
    protective_contact: '保护剂-接触式',
    protective_systemic: '保护剂-系统性',
    adjuvant_penetration: '助剂-渗透剂',
    adjuvant_synergist: '助剂-增效剂',
    pgr_promoter: '调节剂-促进生长',
    pgr_retardant: '调节剂-延缓生长',
    pgr_ripening: '调节剂-催熟催黄',
    pgr_rooting: '调节剂-生根壮苗',
    pgr_fruit_set: '调节剂-保花保果',
    pgr_stress: '调节剂-抗逆增效'
  },
  application_method: {
    spray: '喷雾',
    drench: '灌根',
    fumigation: '熏蒸',
    broadcast: '撒施',
    trap: '诱捕',
    soak: '浸泡',
    other: '其他'
  },
  control_type: {
    chemical: '化学防治',
    bio: '生物防治',
    physical: '物理防治'
  },
  watering_method: {
    spray: '喷雾浇水',
    drip: '滴灌',
    flood: '漫灌',
    mist: '弥雾',
    dip: '浸盆',
    pot: '浇盆',
    drip_irrigation: '滴灌',
    flood_irrigation: '冲施/漫灌',
    manual: '人工浇水',
    manual_watering: '人工浇水'
  },
  fertilization_method: {
    foliar_spray: '叶面喷施',
    drip_irrigation: '滴灌施肥',
    flood_irrigation: '冲施/漫灌',
    spread: '撒施',
    buried: '埋施/穴施',
    injection: '注射施肥',
    base: '基施/底肥',
    top_dressing: '追肥',
    spray: '叶面喷施',
    drench: '浇根',
    fumigation: '土壤熏蒸',
    broadcast: '撒施',
    irrigation: '随水冲施'
  }
}

// Pinia Store 兼容入口（V1.1 useDictionaryStore）
export const useDictionaryStore = defineStore('useDictionaryStore', () => {
  const dictionaries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  const loadDictionaries = async () => {
    const now = Date.now()
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && dictionaries.value.length > 0) {
      if ('categoryCode' in (dictionaries.value[0] || {})) return
    }

    loading.value = true
    error.value = null
    try {
      const data = await getDictionaries()
      dictionaries.value = data
      lastFetch.value = now
    } catch (e) {
      logger.error('[useDictionaryStore] 加载字典失败', e)
      error.value = e instanceof Error ? e.message : '加载字典失败'
    } finally {
      loading.value = false
    }
  }

  const refreshDictionaries = async () => {
    lastFetch.value = null
    await loadDictionaries()
  }

  return { dictionaries, loading, error, lastFetch, loadDictionaries, refreshDictionaries }
})

// 辅助函数 - 按分类获取字典项
// 注意：API 返回的是 snake_case (category_code, dict_code)，需要兼容处理
export const getDictItems = (category) => {
  const dicts = useDictionaryStore().dictionaries || []
  return dicts
    .filter((d) => {
      const cat = d.categoryCode || d.category_code || d.category
      return cat === category && d.status === 'active'
    })
    .map((d) => ({
      id: d.id,
      categoryCode: d.categoryCode || d.category_code || d.category,
      dictCode: d.dictCode || d.dict_code || d.code,
      dictLabel: d.dictLabel || d.name,
      dictValue: d.dictValue || d.name,
      sortOrder: d.sortOrder || d.sort_order,
      color: d.color,
      status: d.status,
      createdAt: d.createdAt || d.created_at,
      updatedAt: d.updatedAt || d.updated_at
    }))
}

// 获取字典项名称
export const getDictItemName = (category, code) => {
  if (!code) return ''
  const store = useDictionaryStore()
  const state = { dictionaries: store.dictionaries, loading: store.loading, loadDictionaries: store.loadDictionaries }

  if (state.dictionaries.length === 0 && !state.loading) {
    state.loadDictionaries()
  }

  const dicts = state.dictionaries
  const item = dicts.find((d) => {
    const cat = d.categoryCode || d.category || d.category_code
    const c = d.dictCode || d.code || d.dict_code
    return cat === category && c === code
  })

  if (item) {
    return item.dictLabel || item.dict_label || item.name || code
  }

  const fallback = DICT_FALLBACK[category]?.[code]
  if (fallback) return fallback

  if (!item) {
    const codeParts = code.split(/[,\s]+/).filter(Boolean)
    if (codeParts.length > 1) {
      const names = codeParts.map((part) => {
        const partItem = dicts.find((d) => {
          const cat = d.categoryCode || d.category || d.category_code
          const c = d.dictCode || d.code || d.dict_code
          return cat === category && c === part
        })
        return partItem ? (partItem.dictLabel || partItem.name || partItem.dictCode || part) : part
      })
      return names.join('、')
    }
    return code
  }

  return item.name || item.dictLabel || item.dictCode || code
}

// 兼容旧名
export const getDictLabel = getDictItemName

// 获取字典分类列表
export const getDictionaryCategories = () => {
  const dicts = useDictionaryStore().dictionaries || []
  return [...new Set(dicts.map((d) => d.categoryCode || d.category_code))]
}

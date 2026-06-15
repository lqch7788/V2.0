/**
 * 字典管理 Store — V2.0 Vue3 版本
 * 功能：数据字典的增删改查、分类管理、缓存管理
 * 数据流：Store → 组件 → API → 后端
 * 迁移自 V1.1 useDictionaryStore
 *
 * 与 V1.1 useDictionaryStore.ts 1:1 对齐：
 * - state: dictionaries / loading / error / lastFetch
 * - action: loadDictionaries / refreshDictionaries
 * - 辅助函数: getDictItems / getDictItemName / getDictionaryCategories
 *   （兼容 categoryCode/category_code/category、dictCode/dict_code/code、dictLabel/name 多种字段格式）
 *
 * V2.0 扩展：
 * - getter: getDictionariesByCategory / getCategoryChineseName / getCategoriesByModule / getTotalItemsInModule
 * - action: addDictionary / updateDictionary / deleteDictionary
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDictionaries,
  saveDictionaries,
  DICTIONARY_MODULES,
  CATEGORY_CHINESE_NAMES
} from '@/services/dictionaryService'

// localStorage 缓存键名（与 dictionaryService 保持一致）
const DICTIONARY_STORAGE_KEY = 'yuanxingtu_dictionaries'

/**
 * 标准化字典项字段（兼容 V1.1 多种数据格式）
 * - categoryCode / category_code / category
 * - dictCode / dict_code / code
 * - dictLabel / name
 * @param {Object} d - 原始字典项
 * @returns {Object} - 标准化后的字典项
 */
function normalizeDictItem(d) {
  const cat = d.categoryCode || d.category_code || d.category
  const code = d.dictCode || d.dict_code || d.code
  return {
    id: d.id,
    categoryCode: cat,
    dictCode: code,
    dictLabel: d.dictLabel || d.name,
    dictValue: d.dictValue || d.name,
    sortOrder: d.sortOrder || d.sort_order,
    color: d.color,
    status: d.status,
    createdAt: d.createdAt || d.created_at,
    updatedAt: d.updatedAt || d.updated_at,
    // 保留原始字段，避免破坏引用方
    ...d
  }
}

// ==================== Store ====================

export const useDictionaryStore = defineStore('dictionary', () => {
  // ---------- 状态 ----------
  /** 字典数据列表 */
  const dictionaries = ref([])
  /** 字典分类列表 */
  const dictionaryTypes = ref([])
  /** 加载状态 */
  const loading = ref(false)
  /** 错误信息 */
  const error = ref(null)
  /** 上次加载时间戳（5 分钟缓存，对齐 V1.1） */
  const lastFetch = ref(null)

  // ---------- Getters ----------

  /**
   * 按分类获取字典项（对齐 V1.1 getDictItems 静态函数 + V2.0 getter）
   * 兼容多种字段格式：categoryCode / category_code / category
   */
  const getDictionariesByCategory = computed(() => {
    return (category) => dictionaries.value.filter(d => {
      const cat = d.categoryCode || d.category_code || d.category
      return cat === category
    })
  })

  /** 获取分类的中文名称 */
  const getCategoryChineseName = computed(() => {
    return (category) => CATEGORY_CHINESE_NAMES[category] || category
  })

  /** 按模块获取分类列表 */
  const getCategoriesByModule = computed(() => {
    return (moduleCode) => {
      const module = DICTIONARY_MODULES.find(m => m.code === moduleCode)
      if (!module) return []
      return dictionaryTypes.value.filter(c => module.categories.includes(c))
    }
  })

  /** 获取模块下的字典项总数 */
  const getTotalItemsInModule = computed(() => {
    return (moduleCode) => {
      const moduleCategories = getCategoriesByModule.value(moduleCode)
      return moduleCategories.reduce((sum, cat) => {
        return sum + dictionaries.value.filter(d => {
          const dc = d.categoryCode || d.category_code || d.category
          return dc === cat
        }).length
      }, 0)
    }
  })

  // ---------- Actions ----------

  /**
   * 加载字典数据
   * 优先从后端 API 获取，失败时降级到 localStorage
   * 5 分钟缓存（对齐 V1.1）
   */
  const loadDictionaries = async () => {
    const now = Date.now()

    // 缓存 5 分钟内不重复请求（对齐 V1.1 lastFetch 逻辑）
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && dictionaries.value.length > 0) {
      // 检查数据是否有效（是否有 categoryCode / category 字段）
      if ('categoryCode' in dictionaries.value[0] || 'category' in dictionaries.value[0]) {
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const data = await getDictionaries()
      dictionaries.value = (data || []).map(normalizeDictItem)
      lastFetch.value = now
      // 同步到 localStorage（V2.0 增强可观察性）
      try { localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(dictionaries.value)) } catch (_) { /* 忽略 */ }
    } catch (err) {
      console.error('[DictionaryStore] 加载字典失败:', err)
      error.value = err instanceof Error ? err.message : '加载字典失败'
      // 降级到 localStorage
      try {
        const cached = localStorage.getItem(DICTIONARY_STORAGE_KEY)
        if (cached) dictionaries.value = JSON.parse(cached)
      } catch (_) { /* 忽略 */ }
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载字典分类列表
   */
  const loadDictionaryTypes = async () => {
    loading.value = true
    error.value = null

    try {
      const categories = await getDictionaryCategories()
      dictionaryTypes.value = categories
    } catch (err) {
      console.error('[DictionaryStore] 加载分类失败:', err)
      error.value = err instanceof Error ? err.message : '加载分类失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载所有字典数据（字典列表 + 分类列表）
   */
  const loadAll = async () => {
    await Promise.all([loadDictionaries(), loadDictionaryTypes()])
  }

  /**
   * 保存字典（新增或更新）
   * @param {Object} data - 包含 inserted, updated, deleted 的对象
   */
  const saveDictionary = async (data) => {
    loading.value = true
    error.value = null

    try {
      const result = await saveDictionaries(data)
      // 保存成功后重新加载数据
      await loadDictionaries()
      await loadDictionaryTypes()
      return result
    } catch (err) {
      console.error('[DictionaryStore] 保存字典失败:', err)
      error.value = err instanceof Error ? err.message : '保存字典失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** 新增字典项 */
  const addDictionary = async (dict) => {
    return saveDictionary({
      inserted: [{ ...dict }],
      updated: [],
      deleted: []
    })
  }

  /** 更新字典项 */
  const updateDictionary = async (dict) => {
    return saveDictionary({
      inserted: [],
      updated: [{ ...dict }],
      deleted: []
    })
  }

  /** 删除字典项 */
  const deleteDictionary = async (id) => {
    return saveDictionary({
      inserted: [],
      updated: [],
      deleted: [id]
    })
  }

  /** 刷新字典数据（强制重新加载，对齐 V1.1 refreshDictionaries） */
  const refreshDictionaries = async () => {
    lastFetch.value = null
    await loadDictionaries()
  }

  /** 刷新所有数据 */
  const refreshAll = async () => {
    lastFetch.value = null
    await loadAll()
  }

  return {
    // 状态
    dictionaries,
    dictionaryTypes,
    loading,
    error,
    lastFetch,
    // Getters
    getDictionariesByCategory,
    getCategoryChineseName,
    getCategoriesByModule,
    getTotalItemsInModule,
    // Actions
    loadDictionaries,
    loadDictionaryTypes,
    loadAll,
    saveDictionary,
    addDictionary,
    updateDictionary,
    deleteDictionary,
    refreshDictionaries,
    refreshAll
  }
})

// ==================== 辅助函数（不在 Store 内，对齐 V1.1）====================

/**
 * 从 localStorage 获取缓存的字典数据
 * @returns {Array} 字典项列表
 */
function getCachedDictionaries() {
  try {
    const stored = localStorage.getItem(DICTIONARY_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('[DictionaryStore] 读取本地缓存失败:', e)
  }
  return []
}

/**
 * 按分类获取字典项（对齐 V1.1 getDictItems 静态函数）
 * 兼容 categoryCode / category_code / category 多种格式
 * @param {string} category - 分类编码
 * @returns {Array} 字典项列表
 */
export const getDictItems = (category) => {
  const dicts = useDictionaryStore().dictionaries
  return dicts
    .filter(d => {
      const cat = d.categoryCode || d.category_code || d.category
      return cat === category && d.status === 'active'
    })
    .map(d => normalizeDictItem(d))
}

/**
 * 获取字典项名称（对齐 V1.1 getDictItemName）
 * - 找不到时返回原始 code
 * - 多值（逗号/空格分隔）时用「、」连接
 * @param {string} category - 分类编码
 * @param {string} code - 字典编码
 * @returns {string}
 */
export const getDictItemName = (category, code) => {
  if (!code) return ''

  const state = useDictionaryStore()
  const dicts = state.dictionaries

  // 如果字典未加载，触发加载（异步，不阻塞）
  if (dicts.length === 0 && !state.loading) {
    state.loadDictionaries()
  }

  // 标准化字段映射，兼容多种数据格式
  const item = dicts.find(d => {
    const cat = d.categoryCode || d.category_code || d.category
    const c = d.dictCode || d.dict_code || d.code
    return cat === category && c === code
  })

  if (!item) {
    // 模糊匹配：处理空格/逗号分隔的多值情况
    const codeParts = code.split(/[,\s]+/).filter(Boolean)
    if (codeParts.length > 1) {
      const names = codeParts.map(part => {
        const partItem = dicts.find(d => {
          const cat = d.categoryCode || d.category_code || d.category
          const c = d.dictCode || d.dict_code || d.code
          return cat === category && c === part
        })
        return partItem
          ? (partItem.dictLabel || partItem.name || partItem.dictCode || part)
          : part
      })
      return names.join('、')
    }
    return code // 找不到就返回原始 code
  }

  // 优先使用 name（兼容旧格式），其次 dictLabel（新格式），最后是 dictCode
  return item.name || item.dictLabel || item.dictCode || code
}

/**
 * 获取字典分类列表（对齐 V1.1 getDictionaryCategories）
 * @returns {string[]} 分类列表
 */
export const getDictionaryCategories = () => {
  const dicts = useDictionaryStore().dictionaries
  const categories = [...new Set(dicts.map(d => d.categoryCode || d.category_code || d.category))]
  return categories
}

/**
 * 异步版 getDictItems（V2.0 扩展）
 */
export async function getDictItemsAsync(category) {
  try {
    const dicts = await getDictionaries()
    return dicts
      .filter(d => {
        const cat = d.categoryCode || d.category_code || d.category
        return cat === category && d.status === 'active'
      })
      .map(d => normalizeDictItem(d))
  } catch (e) {
    console.warn('[DictionaryStore] getDictItemsAsync 失败:', e)
    return []
  }
}

/**
 * 异步版 getDictItemName（V2.0 扩展）
 */
export async function getDictItemNameAsync(category, code) {
  if (!code) return ''
  try {
    const dicts = await getDictionaries()
    const item = dicts.find(d => {
      const cat = d.categoryCode || d.category_code || d.category
      const c = d.dictCode || d.dict_code || d.code
      return cat === category && c === code
    })
    return item?.name || item?.dictLabel || code
  } catch (e) {
    console.warn('[DictionaryStore] getDictItemNameAsync 失败:', e)
    return code
  }
}

// 重新导出配置常量，方便组件使用
export { DICTIONARY_MODULES, CATEGORY_CHINESE_NAMES }

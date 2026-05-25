/**
 * 字典管理 Store — V2.0 Vue3 版本
 * 功能：数据字典的增删改查、分类管理、缓存管理
 * 数据流：Store → 组件 → API → 后端
 * 迁移自 V1.1 useDictionaryStore
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDictionaries,
  getDictionaryCategories,
  saveDictionaries,
  DICTIONARY_MODULES,
  CATEGORY_CHINESE_NAMES
} from '@/services/dictionaryService'

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
  /** 上次加载时间戳 */
  const lastFetch = ref(null)

  // ---------- Getters ----------

  /** 按分类获取字典项 */
  const getDictionariesByCategory = computed(() => {
    return (category) => dictionaries.value.filter(d => d.category === category)
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
        return sum + dictionaries.value.filter(d => d.category === cat).length
      }, 0)
    }
  })

  // ---------- Actions ----------

  /**
   * 加载字典数据
   * 优先从后端API获取，失败时降级到 localStorage
   * 缓存5分钟
   */
  const loadDictionaries = async () => {
    const now = Date.now()

    // 缓存5分钟内不重复请求
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && dictionaries.value.length > 0) {
      // 检查数据是否有效（是否有 category 字段）
      if (dictionaries.value.length > 0 && 'category' in dictionaries.value[0]) {
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const data = await getDictionaries()
      dictionaries.value = data
      lastFetch.value = now
      console.log('[DictionaryStore] 加载字典数据成功:', data.length, '条')
    } catch (err) {
      console.error('[DictionaryStore] 加载字典失败:', err)
      error.value = err instanceof Error ? err.message : '加载字典失败'
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
      console.log('[DictionaryStore] 加载分类成功:', categories.length, '个')
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

  /**
   * 新增字典项
   * @param {Object} dict - 字典数据
   */
  const addDictionary = async (dict) => {
    return saveDictionary({
      inserted: [{ ...dict }],
      updated: [],
      deleted: []
    })
  }

  /**
   * 更新字典项
   * @param {Object} dict - 字典数据
   */
  const updateDictionary = async (dict) => {
    return saveDictionary({
      inserted: [],
      updated: [{ ...dict }],
      deleted: []
    })
  }

  /**
   * 删除字典项
   * @param {string} id - 字典ID
   */
  const deleteDictionary = async (id) => {
    return saveDictionary({
      inserted: [],
      updated: [],
      deleted: [id]
    })
  }

  /**
   * 刷新字典数据（强制重新加载）
   */
  const refreshDictionaries = async () => {
    lastFetch.value = null
    await loadDictionaries()
  }

  /**
   * 刷新所有数据
   */
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

// ==================== 辅助函数（不在Store内） ====================

// localStorage 缓存键名（与 dictionaryService 保持一致）
const DICTIONARY_STORAGE_KEY = 'yuanxingtu_dictionaries'

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
 * 按分类获取字典项（静态函数）
 * 直接从 dictionaryService 获取数据（已有缓存机制）
 * @param {string} category - 分类编码
 * @returns {Promise<Array>} 字典项列表
 */
export async function getDictItems(category) {
  try {
    const dicts = await getDictionaries()
    return dicts.filter(d => d.category === category && d.status === 'active')
  } catch (e) {
    console.warn('[DictionaryStore] getDictItems 失败:', e)
    return []
  }
}

/**
 * 获取字典项名称（静态函数）
 * @param {string} category - 分类编码
 * @param {string} code - 字典编码
 * @returns {Promise<string>} 字典项名称
 */
export async function getDictItemName(category, code) {
  try {
    const dicts = await getDictionaries()
    const item = dicts.find(d => d.category === category && d.code === code)
    return item?.name || code
  } catch (e) {
    console.warn('[DictionaryStore] getDictItemName 失败:', e)
    return code
  }
}

/**
 * 获取字典分类列表（静态函数）
 * @returns {Promise<string[]>} 分类列表
 */
export async function getDictionaryCategoriesStatic() {
  try {
    const categories = await getDictionaryCategories()
    return categories
  } catch (e) {
    console.warn('[DictionaryStore] getDictionaryCategoriesStatic 失败:', e)
    return []
  }
}

// 重新导出配置常量，方便组件使用
export { DICTIONARY_MODULES, CATEGORY_CHINESE_NAMES }

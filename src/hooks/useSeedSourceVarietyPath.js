/**
 * 2026-07-21：种源品种路径共享 Hook（V1.1 useSeedSourceVarietyPath.ts 1:1 迁移）
 *
 * 解决问题：
 * - 列表 (SeedSourceTable) 和详情 (DetailModal) 各自实现品种路径逻辑
 * - 详情只显示 2 段（typeName + varietyName），列表显示完整 4 段
 * - 同一记录两个视图显示不一致 → 用户困惑
 *
 * 设计：把路径生成逻辑抽到共享 Hook，两端用同一份
 *
 * 路径规则（4 段，与种植管理 PlantingTable.getVarietyPath 对齐）：
 *   类别（categoryName） > 类型（typeName） > 品种（varietyName） > 子品种（subVariety1Name）
 *
 * 数据源优先级：
 *   1. 品种库 cropVarietyCache（按 cropCode 精确匹配 → cropName/cropVariety 模糊匹配）
 *   2. 兜底：record 自身字段拼接
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as cropVarietyService from '@/services/cropVarietyService'

/**
 * @typedef {Object} CropVariety
 * @property {string} [id]
 * @property {string} [cropCode]
 * @property {string} [categoryName]
 * @property {string} [typeName]
 * @property {string} [varietyName]
 * @property {string} [subVariety1Name]
 */

/**
 * @typedef {Object} SeedSource
 * @property {string} [id]
 * @property {string} [seedCode]
 * @property {string} [sourceType]
 * @property {string} [sourceOrigin]
 * @property {string} [seedForm]
 * @property {string} [cropCategory]
 * @property {string} [typeName]
 * @property {string} [varietyName]
 * @property {string} [cropName]
 * @property {string} [cropVariety]
 * @property {string} [cropCode]
 * @property {string} [supplierId]
 * @property {string} [supplierName]
 * @property {string} [purchaseDate]
 * @property {number} [quantity]
 * @property {string} [unit]
 * @property {number} [unitPrice]
 * @property {number} [totalAmount]
 * @property {number} [initialCount]
 * @property {number} [availableCount]
 * @property {string[]} [pictures]
 * @property {string} [remarks]
 * @property {string} [traceabilityCode]
 * @property {number} [printCount]
 * @property {string} [createBy]
 * @property {string} [createTime]
 * @property {string} [updateTime]
 * @property {string} [productionPlanId]
 * @property {string} [productionPlanCode]
 * @property {string} [propagationType]
 * @property {string} [propagationStatus]
 * @property {string} [endTime]
 * @property {string} [endType]
 */

/**
 * @typedef {Object} UseSeedSourceVarietyPathResult
 * @property {(record: SeedSource) => string} getVarietyPath - 完整 4 段路径（用 " > " 分隔）
 * @property {(record: SeedSource) => (CropVariety|null)} getVarietyByAny - 品种库查到的完整信息（用于编辑弹窗选中显示）
 * @property {import('vue').Ref<boolean>} loaded - 品种库是否已加载
 */

/**
 * 全局品种库缓存（避免每个组件都重新请求）
 * 模块级 Map：组件卸载不清空，由 Vite HMR 重新加载时清空
 */
let globalVarietyCache = /** @type {Map<string, CropVariety>|null} */ (null)
let loadingPromise = /** @type {Promise<Map<string, CropVariety>>|null} */ (null)

/**
 * 加载品种库并构建多键缓存（subVariety1Name / varietyName / cropCode）
 * @returns {Promise<Map<string, CropVariety>>}
 */
async function loadVarietyCache() {
  if (globalVarietyCache) return globalVarietyCache
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    try {
      const varieties = await cropVarietyService.getAllVarieties()
      const cache = new Map()
      varieties.forEach((/** @type {CropVariety} */ v) => {
        // 按 subVariety1Name 缓存（最细分）
        const key1 = v.subVariety1Name || ''
        if (key1 && !cache.has(key1)) cache.set(key1, v)
        // 按 varietyName 缓存
        const key2 = v.varietyName || ''
        if (key2 && !cache.has(key2)) cache.set(key2, v)
        // 按 cropCode 缓存（最精确）
        const key3 = v.cropCode || ''
        if (key3 && !cache.has(key3)) cache.set(key3, v)
      })
      globalVarietyCache = cache
      return cache
    } catch (e) {
      console.warn('[useSeedSourceVarietyPath] 加载品种库失败', e)
      globalVarietyCache = new Map()
      return globalVarietyCache
    } finally {
      loadingPromise = null
    }
  })()
  return loadingPromise
}

/**
 * 种源品种路径 Composable（V1.1 useSeedSourceVarietyPath 1:1 迁移）
 * @returns {UseSeedSourceVarietyPathResult}
 */
export function useSeedSourceVarietyPath() {
  const varietyCache = ref(globalVarietyCache || new Map())
  const loaded = ref(!!globalVarietyCache)
  let cancelled = false

  onMounted(() => {
    if (loaded.value) return
    loadVarietyCache().then((cache) => {
      if (cancelled) return
      varietyCache.value = cache
      loaded.value = true
    })
  })

  onBeforeUnmount(() => {
    cancelled = true
  })

  // 从品种库查找完整品种信息
  const getVarietyByAny = (/** @type {SeedSource} */ record) => {
    // 优先 cropCode 查找
    if (record.cropCode) {
      const v = varietyCache.value.get(record.cropCode)
      if (v) return v
    }
    // cropName 模糊匹配
    if (record.cropName) {
      for (const [, variety] of varietyCache.value.entries()) {
        const fullName = variety.subVariety1Name || variety.varietyName || ''
        if (fullName && (fullName.includes(record.cropName) || record.cropName.includes(fullName))) {
          return variety
        }
      }
    }
    // cropVariety 模糊匹配
    if (record.cropVariety) {
      for (const [, variety] of varietyCache.value.entries()) {
        const fullName = variety.subVariety1Name || variety.varietyName || ''
        if (fullName && (fullName.includes(record.cropVariety) || record.cropVariety.includes(fullName))) {
          return variety
        }
      }
    }
    return null
  }

  // 品种完整路径：从品种库查四段路径（类别 > 类型 > 品种 > 子品种）
  const getVarietyPath = (/** @type {SeedSource} */ record) => {
    const variety = getVarietyByAny(record)
    if (!variety) {
      // 兜底：用 record 自身字段拼接
      const parts = []
      if (record.cropCategory) parts.push(record.cropCategory)
      if (record.cropName) parts.push(record.cropName)
      if (record.cropVariety && record.cropVariety !== record.cropName) parts.push(record.cropVariety)
      return parts.length > 0 ? parts.join(' > ') : '—'
    }
    const parts = []
    if (variety.categoryName) parts.push(variety.categoryName)
    if (variety.typeName) parts.push(variety.typeName)
    if (variety.varietyName) parts.push(variety.varietyName)
    if (variety.subVariety1Name) parts.push(variety.subVariety1Name)
    return parts.join(' > ') || '—'
  }

  return { getVarietyPath, getVarietyByAny, loaded }
}

/** 重置缓存（HMR / 手动刷新品种库时调用） */
export function resetSeedSourceVarietyCache() {
  globalVarietyCache = null
  loadingPromise = null
}

export default useSeedSourceVarietyPath
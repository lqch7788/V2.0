/**
 * 2026-06-06: 种源筛选 Hook（V1.1 useFilteredSeedSources.ts 1:1 迁移）
 * 把 SeedSourcePage 中 12 项过滤条件（~45 行）的 computed 逻辑抽出来。
 * 依赖：useUserStore 解析 recorderId → 名称。
 *
 * @param {import('vue').Ref<Array>} sourcesRef - 种源列表的 ref
 * @param {import('vue').Ref<Object>} filtersRef - 筛选条件的 ref
 * @returns {import('vue').ComputedRef<Array>} 过滤后的种源列表
 */
import { computed } from 'vue'
import { computeStockStatus } from '@/constants/seedSourceDict'
import { StockStatus, seedSourceStatusOptions } from '@/constants/seedSourceDict'
import { useUserStore } from '@/stores/modules/user'

/**
 * @typedef {Object} SeedSourceLike
 * @property {string} [id]
 * @property {string} [cropCategory]
 * @property {string} [cropName]
 * @property {string} [cropVariety]
 * @property {string} [seedCode]
 * @property {string} [sourceType]
 * @property {string} [supplierName]
 * @property {number} [availableCount]
 * @property {number} [initialCount]
 * @property {string} [purchaseDate]
 * @property {string} [createBy]
 * @property {string} [createTime]
 * @property {string} [propagationType]
 * @property {string} [propagationStatus]
 */

/**
 * @typedef {Object} SeedSourceFilters
 * @property {string} [cropCategory]
 * @property {string} [cropName]
 * @property {string} [cropType]
 * @property {string} [seedCode]
 * @property {string} [sourceType]
 * @property {string} [sourceOrigin]
 * @property {string} [supplierName]
 * @property {string} [status]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} [createBy]
 * @property {string} [recorderId]
 * @property {number} [surplusMin]
 * @property {number} [surplusMax]
 * @property {string} [propagationType]
 * @property {string} [propagationStatus]
 */

/**
 * 12 项过滤逻辑（V1.1 useFilteredSeedSources.ts L41-64 1:1 迁移）
 * @param {Array<SeedSourceLike>} sources
 * @param {SeedSourceFilters} filters
 * @param {Array<{oid: string, id?: string, name?: string, realName?: string, username?: string}>} users
 * @returns {Array<SeedSourceLike>}
 */
function filterSeedSources(sources, filters, users) {
  // 记录人 ID → 名称（用于级联筛选）
  let recorderName = ''
  if (filters.recorderId) {
    const user = users.find((u) => (u.oid || u.id) === filters.recorderId)
    recorderName = user?.name || ''
  }

  const filtered = sources.filter((item) => {
    if (filters.cropCategory && filters.cropCategory !== '__all__' && item.cropCategory !== filters.cropCategory) return false
    if (filters.cropName && !(item.cropName || '').includes(filters.cropName)) return false
    if (filters.cropType && filters.cropType !== '__all__' && item.cropCategory !== filters.cropType) return false
    if (filters.seedCode && !(item.seedCode || '').includes(filters.seedCode)) return false
    if (filters.sourceType && filters.sourceType !== '__all__' && item.sourceType !== filters.sourceType) return false
    if (filters.sourceOrigin && filters.sourceOrigin !== '__all__' && item.sourceOrigin !== filters.sourceOrigin) return false
    if (filters.supplierName && filters.supplierName !== '__all__' && !(item.supplierName || '').includes(filters.supplierName)) return false
    // status 实时计算（与 V1.1 一致：基于 availableCount / initialCount）
    if (filters.status && filters.status !== '__all__' && computeStockStatus(item.availableCount, item.initialCount) !== filters.status) return false
    if (filters.startDate && (item.purchaseDate || item.createTime || '') < filters.startDate) return false
    if (filters.endDate && (item.purchaseDate || item.createTime || '') > filters.endDate) return false
    if (filters.createBy && !(item.createBy || '').includes(filters.createBy)) return false
    if (recorderName && item.createBy !== recorderName) return false
    if (filters.surplusMin !== undefined && filters.surplusMin !== null && (item.availableCount || 0) < filters.surplusMin) return false
    if (filters.surplusMax !== undefined && filters.surplusMax !== null && (item.availableCount || 0) > filters.surplusMax) return false
    if (filters.propagationType) {
      const itemPropType = item.propagationType || 'external'
      if (itemPropType !== filters.propagationType) return false
    }
    if (filters.propagationStatus) {
      if (item.propagationStatus !== filters.propagationStatus) return false
    }
    return true
  })
  // 按创建时间倒序排列（最新在前，与 V1.1 一致）
  return filtered.sort((a, b) => {
    const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
    const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
    return timeB - timeA
  })
}

export function useFilteredSeedSources(sourcesRef, filtersRef) {
  // 开发态校验 seedSourceStatusOptions 的 value 与 StockStatus 枚举一致
  // 防止某天 STOCK_STATUS_MAP key 改名导致 status 筛选静默失灵
  if (process.env.NODE_ENV !== 'production') {
    const validStatuses = new Set(Object.values(StockStatus))
    for (const opt of seedSourceStatusOptions) {
      if (opt.value !== '__all__' && !validStatuses.has(opt.value)) {
        console.warn(
          `[useFilteredSeedSources] 库存状态筛选 value="${opt.value}" 不在 StockStatus 枚举内，`
          + `有效值: ${Array.from(validStatuses).join(', ')}`
        )
      }
    }
  }

  const userStore = useUserStore()

  return computed(() => {
    const sources = sourcesRef.value || sourcesRef
    const filters = filtersRef.value || filtersRef
    return filterSeedSources(sources, filters, userStore.users || [])
  })
}

export default useFilteredSeedSources

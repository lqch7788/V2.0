/**
 * 2026-07-10 P1-2: 育苗筛选 Hook（V1.1 useFilteredSeedlings.ts 1:1 迁移）
 * 把 SeedlingPage 中 ~30 行 inline useMemo 过滤逻辑抽出来，与 useFilteredSeedSources 对齐。
 *
 * 不改变任何功能逻辑：保持原有的 includes/startsWith 行为、surplus 派生公式。
 *
 * 2026-07-18 P0-MISS-008 修复：V2.0 此前缺失此 hook
 *
 * @param {import('vue').Ref<Array>|Array} seedlingsRef - 育苗列表的 ref 或数组
 * @param {import('vue').Ref<Object>|Object} filtersRef - 筛选条件的 ref 或对象
 * @returns {import('vue').ComputedRef<Array>} 过滤后的育苗列表
 */
import { computed } from 'vue'

/**
 * 12 项过滤逻辑（V1.1 useFilteredSeedlings.ts 1:1 迁移）
 * @param {Array<Object>} seedlings
 * @param {Object} filters
 * @returns {Array<Object>}
 */
function filterSeedlings(seedlings, filters) {
  return seedlings.filter((item) => {
    if (filters.cropName && filters.cropName !== '__all__' && !(item.cropName || '').includes(filters.cropName)) return false
    if (filters.seedlingCode && !(item.seedlingCode || '').startsWith(filters.seedlingCode)) return false
    if (filters.sourceCode && !(item.sourceCode || '').startsWith(filters.sourceCode)) return false
    if (filters.siteName && filters.siteName !== '__all__' && item.siteName !== filters.siteName) return false
    if (filters.seedlingType && filters.seedlingType !== '__all__' && item.seedlingType !== filters.seedlingType) return false
    if (filters.status && filters.status !== '__all__' && item.status !== filters.status) return false
    if (filters.startDate && (item.startDate || '') < filters.startDate) return false
    if (filters.endDate && (item.startDate || '') > filters.endDate) return false
    if (filters.createBy && !(item.createBy || '').startsWith(filters.createBy)) return false
    if (filters.initialCountMin !== undefined && filters.initialCountMin !== null && (item.initialCount || 0) < filters.initialCountMin) return false
    if (filters.initialCountMax !== undefined && filters.initialCountMax !== null && (item.initialCount || 0) > filters.initialCountMax) return false
    if (filters.survivalCountMin !== undefined && filters.survivalCountMin !== null && (item.survivalCount || 0) < filters.survivalCountMin) return false
    if (filters.survivalCountMax !== undefined && filters.survivalCountMax !== null && (item.survivalCount || 0) > filters.survivalCountMax) return false
    if (filters.lossCountMin !== undefined && filters.lossCountMin !== null && (item.lossCount || 0) < filters.lossCountMin) return false
    if (filters.lossCountMax !== undefined && filters.lossCountMax !== null && (item.lossCount || 0) > filters.lossCountMax) return false
    // 现存数量 = 小苗剩余 = 产出 - 损耗 - 采收入库（V1.1 L32-36 派生公式 1:1）
    const surplus = Math.max(
      0,
      (item.expandedPlantCount || 0)
        - (item.seedlingLossCount || 0)
        - (item.harvestStockedCount || 0)
    )
    if (filters.surplusMin !== undefined && filters.surplusMin !== null && surplus < filters.surplusMin) return false
    if (filters.surplusMax !== undefined && filters.surplusMax !== null && surplus > filters.surplusMax) return false
    if (filters.survivalRateMin !== undefined && filters.survivalRateMin !== null && (item.survivalRate || 0) < filters.survivalRateMin) return false
    if (filters.survivalRateMax !== undefined && filters.survivalRateMax !== null && (item.survivalRate || 0) > filters.survivalRateMax) return false
    if (filters.lossRateMin !== undefined && filters.lossRateMin !== null && (item.lossRate || 0) < filters.lossRateMin) return false
    if (filters.lossRateMax !== undefined && filters.lossRateMax !== null && (item.lossRate || 0) > filters.lossRateMax) return false
    return true
  })
}

export function useFilteredSeedlings(sourcesRef, filtersRef) {
  return computed(() => {
    const sources = sourcesRef.value !== undefined ? sourcesRef.value : sourcesRef
    const filters = filtersRef.value !== undefined ? filtersRef.value : filtersRef
    return filterSeedlings(sources || [], filters || {})
  })
}

export default useFilteredSeedlings

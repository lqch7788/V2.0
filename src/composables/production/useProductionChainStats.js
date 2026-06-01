/**
 * 产业链统计 Composable
 * 1:1 翻译自 V1.1 src/hooks/useProductionChainStats.ts
 *
 * 关联逻辑：
 * - 生产计划 → 育苗：通过 seedlings.productionPlanCode = productionPlans.batchCode
 * - 育苗 → 种植：通过 plantings.sourceId = seedlings.id
 * - 种植 → 采收：通过 plantings.productionPlanCode = harvestRecords.productionPlanCode
 * - 库存 → 计划：通过 inventory.batch_code = productionPlans.batchCode（V2.0 经 store 映射后为 batchCode）
 *
 * 数据来源：V1.1 useQuery → V2.0 Pinia store 订阅 + onMounted 主动 fetch
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\hooks\useProductionChainStats.ts
 */
import { ref, computed, onMounted } from 'vue'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useSeedlingStore } from '@/stores/modules/seedling'
import { usePlantingStore } from '@/stores/modules/planting'
import { useHarvestStore } from '@/stores/modules/harvest'
import { useCropInventoryStore } from '@/stores/modules/inventory/useCropInventoryStore'

// ============================================
// 类型定义（JSDoc）
// ============================================

/**
 * 作物批次（生产计划）
 * @typedef {import('@/services/apiProductionPlanService').CropBatch} CropBatch
 */

/**
 * 育苗记录
 * @typedef {Object} Seedling
 * @property {string} [id]
 * @property {string} [productionPlanCode]
 */

/**
 * 种植记录
 * @typedef {Object} Planting
 * @property {string} [id]
 * @property {string} [sourceId]
 * @property {string} [productionPlanCode]
 */

/**
 * 采收记录
 * @typedef {Object} HarvestRecord
 * @property {string} [id]
 * @property {string} [productionPlanCode]
 */

/**
 * 库存记录
 * @typedef {Object} InventoryRecord
 * @property {string} [id]
 * @property {string} [batchCode]
 */

/**
 * 统计数据接口
 * @typedef {Object} ChainStats
 * @property {number} total 总数
 * @property {number} related 已关联数
 * @property {number} [pending] 待处理数（仅生产计划有）
 * @property {number} [completed] 已完成数（仅生产计划有）
 */

/**
 * 生产链统计数据
 * @typedef {Object} ProductionChainData
 * @property {CropBatch[]} productionPlans
 * @property {Seedling[]} seedlings
 * @property {Planting[]} plantings
 * @property {HarvestRecord[]} harvestRecords
 * @property {InventoryRecord[]} inventoryRecords
 */

// ============================================
// useProductionChainStats Composable
// ============================================

/**
 * 生产链条统计 composable
 * 并行获取各环节数据并计算关联统计
 * 1:1 翻译自 V1.1 useProductionChainStats
 * @returns {{
 *   stats: {
 *     productionPlans: ChainStats,
 *     seedlings: ChainStats,
 *     plantings: ChainStats,
 *     harvests: ChainStats,
 *     inventory: ChainStats
 *   },
 *   data: ProductionChainData,
 *   isLoading: import('vue').ComputedRef<boolean>
 * }}
 */
export function useProductionChainStats() {
  // 1:1 翻译 V1.1 useQuery → V2.0 Pinia store 订阅
  const productionPlanStore = useProductionPlanStore()
  const seedlingStore = useSeedlingStore()
  const plantingStore = usePlantingStore()
  const harvestStore = useHarvestStore()
  const cropInventoryStore = useCropInventoryStore()

  // 1:1 翻译 V1.1 data 解构：store 内部 state 名 → V1.1 暴露的字段名
  const productionPlans = computed(() => productionPlanStore.plans || [])
  const seedlings = computed(() => seedlingStore.items || [])
  const plantings = computed(() => plantingStore.plantings || [])
  const harvestRecords = computed(() => harvestStore.records || [])
  const inventoryRecords = computed(() => cropInventoryStore.inventoryData || [])

  // 1:1 翻译 V1.1 isLoading 解构
  const isLoadingPlans = computed(() => !!productionPlanStore.isLoading)
  const isLoadingSeedlings = computed(() => !!seedlingStore.isLoading)
  const isLoadingPlantings = computed(() => !!plantingStore.isLoading)
  const isLoadingHarvest = computed(() => !!harvestStore.isLoading)
  const isLoadingInventory = computed(() => !!cropInventoryStore.isLoading)

  // V1.1 useQuery 自动触发；V2.0 需在挂载时主动调用 store fetch
  // 1:1 翻译 V1.1 行为：组件挂载时即并行发起各端点请求
  onMounted(() => {
    // 并行触发各 store 拉取（与 V1.1 useQuery 并行语义一致）
    // 容错：单个 store fetch 失败不应阻断其他端点
    try { productionPlanStore.fetchPlans() } catch (e) { /* 静默保留 V1.1 react-query 行为：失败由 store 内 error 状态承载 */ }
    try { seedlingStore.loadItems() } catch (e) { /* 同上 */ }
    try { plantingStore.fetchPlantings() } catch (e) { /* 同上 */ }
    try { harvestStore.fetchRecords() } catch (e) { /* 同上 */ }
    try { cropInventoryStore.loadInventoryData() } catch (e) { /* 同上 */ }
  })

  // ============================================
  // 计算生产计划统计
  // 1:1 翻译 V1.1 productionPlansStats 计算
  // ============================================
  /**
   * @type {import('vue').ComputedRef<ChainStats>}
   */
  const productionPlansStats = computed(() => {
    const stats = {
      total: productionPlans.value.length,
      related: 0,
      pending: 0,
      completed: 0,
    }

    // 收集所有已关联的生产计划批次号
    const relatedPlanCodes = new Set()

    // 计算育苗关联：seedlings.productionPlanCode = productionPlans.batchCode
    seedlings.value.forEach((seedling) => {
      if (seedling.productionPlanCode) {
        relatedPlanCodes.add(seedling.productionPlanCode)
      }
    })

    // 计算种植关联：plantings.productionPlanCode = productionPlans.batchCode
    plantings.value.forEach((planting) => {
      if (planting.productionPlanCode) {
        relatedPlanCodes.add(planting.productionPlanCode)
      }
    })

    // 计算采收关联：harvestRecords.productionPlanCode = productionPlans.batchCode
    harvestRecords.value.forEach((record) => {
      if (record.productionPlanCode) {
        relatedPlanCodes.add(record.productionPlanCode)
      }
    })

    // 计算库存关联：inventory.batchCode = productionPlans.batchCode
    // V1.1 源读取 inv.batch_code（蛇形），V2.0 经 useCropInventoryStore 映射后为 batchCode（驼峰）
    inventoryRecords.value.forEach((inv) => {
      if (inv.batchCode) {
        relatedPlanCodes.add(inv.batchCode)
      }
    })

    // 统计已关联的生产计划
    productionPlans.value.forEach((plan) => {
      if (relatedPlanCodes.has(plan.batchCode)) {
        stats.related++
      }
      // pending: 规划中、进行中的计划
      if (plan.status === 'planning' || plan.status === 'in_progress') {
        stats.pending++
      }
      // completed: 已完成的计划
      if (plan.status === 'completed' || plan.batchStatus === 'completed') {
        stats.completed++
      }
    })

    return stats
  })

  // ============================================
  // 计算育苗统计
  // 1:1 翻译 V1.1 seedlingsStats 计算
  // ============================================
  /**
   * @type {import('vue').ComputedRef<ChainStats>}
   */
  const seedlingsStats = computed(() => {
    // V1.1 在生产计划统计内构造了 relatedPlanCodes；这里需要在 computed 内重建（每次重算）
    const relatedPlanCodes = new Set()

    seedlings.value.forEach((seedling) => {
      if (seedling.productionPlanCode) {
        relatedPlanCodes.add(seedling.productionPlanCode)
      }
    })

    plantings.value.forEach((planting) => {
      if (planting.productionPlanCode) {
        relatedPlanCodes.add(planting.productionPlanCode)
      }
    })

    harvestRecords.value.forEach((record) => {
      if (record.productionPlanCode) {
        relatedPlanCodes.add(record.productionPlanCode)
      }
    })

    inventoryRecords.value.forEach((inv) => {
      if (inv.batchCode) {
        relatedPlanCodes.add(inv.batchCode)
      }
    })

    return {
      total: seedlings.value.length,
      related: seedlings.value.filter(
        (s) => s.productionPlanCode && relatedPlanCodes.has(s.productionPlanCode)
      ).length,
    }
  })

  // ============================================
  // 计算种植统计（关联到育苗或生产计划）
  // 1:1 翻译 V1.1 plantingsStats 计算
  // ============================================
  /**
   * @type {import('vue').ComputedRef<ChainStats>}
   */
  const plantingsStats = computed(() => {
    const relatedPlanCodes = new Set()

    seedlings.value.forEach((seedling) => {
      if (seedling.productionPlanCode) {
        relatedPlanCodes.add(seedling.productionPlanCode)
      }
    })

    plantings.value.forEach((planting) => {
      if (planting.productionPlanCode) {
        relatedPlanCodes.add(planting.productionPlanCode)
      }
    })

    harvestRecords.value.forEach((record) => {
      if (record.productionPlanCode) {
        relatedPlanCodes.add(record.productionPlanCode)
      }
    })

    inventoryRecords.value.forEach((inv) => {
      if (inv.batchCode) {
        relatedPlanCodes.add(inv.batchCode)
      }
    })

    // 关联到育苗的种植
    const plantingRelatedIds = new Set()
    plantings.value.forEach((planting) => {
      if (planting.sourceId) {
        plantingRelatedIds.add(planting.sourceId)
      }
    })
    // 关联到生产计划的种植
    plantings.value.forEach((planting) => {
      if (planting.productionPlanCode && relatedPlanCodes.has(planting.productionPlanCode)) {
        plantingRelatedIds.add(planting.id)
      }
    })

    return {
      total: plantings.value.length,
      related: plantings.value.filter(
        (p) => plantingRelatedIds.has(p.id) || (p.productionPlanCode && relatedPlanCodes.has(p.productionPlanCode))
      ).length,
    }
  })

  // ============================================
  // 计算采收统计（关联到种植或生产计划）
  // 1:1 翻译 V1.1 harvestsStats 计算
  // ============================================
  /**
   * @type {import('vue').ComputedRef<ChainStats>}
   */
  const harvestsStats = computed(() => {
    const relatedPlanCodes = new Set()

    seedlings.value.forEach((seedling) => {
      if (seedling.productionPlanCode) {
        relatedPlanCodes.add(seedling.productionPlanCode)
      }
    })

    plantings.value.forEach((planting) => {
      if (planting.productionPlanCode) {
        relatedPlanCodes.add(planting.productionPlanCode)
      }
    })

    harvestRecords.value.forEach((record) => {
      if (record.productionPlanCode) {
        relatedPlanCodes.add(record.productionPlanCode)
      }
    })

    inventoryRecords.value.forEach((inv) => {
      if (inv.batchCode) {
        relatedPlanCodes.add(inv.batchCode)
      }
    })

    const harvestRelatedIds = new Set()
    harvestRecords.value.forEach((record) => {
      if (record.productionPlanCode && relatedPlanCodes.has(record.productionPlanCode)) {
        harvestRelatedIds.add(record.id)
      }
    })

    return {
      total: harvestRecords.value.length,
      related: harvestRecords.value.filter(
        (h) => harvestRelatedIds.has(h.id) || (h.productionPlanCode && relatedPlanCodes.has(h.productionPlanCode))
      ).length,
    }
  })

  // ============================================
  // 计算库存统计（关联到生产计划）
  // 1:1 翻译 V1.1 inventoryStats 计算
  // ============================================
  /**
   * @type {import('vue').ComputedRef<ChainStats>}
   */
  const inventoryStats = computed(() => {
    const relatedPlanCodes = new Set()

    seedlings.value.forEach((seedling) => {
      if (seedling.productionPlanCode) {
        relatedPlanCodes.add(seedling.productionPlanCode)
      }
    })

    plantings.value.forEach((planting) => {
      if (planting.productionPlanCode) {
        relatedPlanCodes.add(planting.productionPlanCode)
      }
    })

    harvestRecords.value.forEach((record) => {
      if (record.productionPlanCode) {
        relatedPlanCodes.add(record.productionPlanCode)
      }
    })

    inventoryRecords.value.forEach((inv) => {
      if (inv.batchCode) {
        relatedPlanCodes.add(inv.batchCode)
      }
    })

    return {
      total: inventoryRecords.value.length,
      related: inventoryRecords.value.filter(
        (inv) => inv.batchCode && relatedPlanCodes.has(inv.batchCode)
      ).length,
    }
  })

  // ============================================
  // 1:1 翻译 V1.1 返回值结构
  // ============================================
  return {
    stats: {
      productionPlans: productionPlansStats,
      seedlings: seedlingsStats,
      plantings: plantingsStats,
      harvests: harvestsStats,
      inventory: inventoryStats,
    },
    // 返回原始数据供表格使用
    data: {
      productionPlans,
      seedlings,
      plantings,
      harvestRecords,
      inventoryRecords,
    },
    isLoading: computed(
      () =>
        isLoadingPlans.value ||
        isLoadingSeedlings.value ||
        isLoadingPlantings.value ||
        isLoadingHarvest.value ||
        isLoadingInventory.value
    ),
  }
}

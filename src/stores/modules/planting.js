/**
 * 种植 Pinia store - 1:1 翻译自 V1.1
 * 管理种植记录的完整 CRUD 数据流 + 采收/结束状态联动
 *
 * 数据流：API → request（无缓存）→ Store → 页面组件
 * - L1：Pinia Store 内存数组
 * - L2：（未使用）无 IndexedDB 缓存
 * - L3：（未使用）种植管理页面不读取 localStorage
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\stores\usePlantingStore.ts
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getPlantings,
  addPlanting as addPlantingService,
  updatePlanting as updatePlantingService,
  deletePlantings as deletePlantingsService,
  harvestPlanting as harvestPlantingService
} from '@/services/apiPlantingService'

/**
 * 种植记录主体（来自后端 /plantings）
 * @typedef {import('@/types/crop').Planting} Planting
 */

/** 种植状态枚举 - 与V1.1保持一致 */
export const PlantingStatus = {
  PLANTED: 'planted',
  GROWING: 'growing',
  HARVESTED: 'harvested',
  CANCELLED: 'cancelled'
}

/** 来源类型枚举 */
export const SourceType = {
  SEED: 'seed',
  SEEDLING: 'seedling',
  CUTTING: 'cutting',
  GRAFTING: 'grafting',
  TISSUE_CULTURE: 'tissue_culture'
}

export const usePlantingStore = defineStore('planting', () => {
  // ============== 1:1 翻译 V1.1 state ==============
  /** @type {import('vue').Ref<Planting[]>} */
  const plantings = ref([])

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  // ============== 1:1 翻译 V1.1 getters ==============

  /**
   * 统计计算 - 与V1.1完全一致
   * @type {import('vue').ComputedRef<{ total: number, growing: number, harvested: number, monthCount: number }>}
   */
  const stats = computed(() => {
    const total = plantings.value.length
    const growing = plantings.value.filter(
      p => p.status === PlantingStatus.PLANTED || p.status === PlantingStatus.GROWING
    ).length
    const harvested = plantings.value.filter(
      p => p.status === PlantingStatus.HARVESTED
    ).length
    const now = new Date()
    const monthCount = plantings.value.filter(p => {
      const date = new Date(p.createTime)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length
    return { total, growing, harvested, monthCount }
  })

  // ============== 1:1 翻译 V1.1 actions ==============

  /**
   * 获取种植列表 - 调用真实API
   * 1:1 翻译自 V1.1 fetchPlantings
   * @returns {Promise<void>}
   */
  async function fetchPlantings() {
    isLoading.value = true
    try {
      const data = await getPlantings()
      plantings.value = data || []
    } catch (error) {
      console.error('[usePlantingStore] 获取种植列表失败:', error)
      plantings.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取单条种植记录
   * 1:1 翻译自 V1.1 getPlantingById
   * @param {string} id
   * @returns {Planting | undefined}
   */
  function getPlantingById(id) {
    return plantings.value.find(item => item.id === id)
  }

  /**
   * 添加种植记录
   * 1:1 翻译自 V1.1 addPlantingRecord（对外暴露为 addPlanting，与 V1.1 一致）
   * @param {Partial<Planting>} plantingData
   * @returns {Promise<Planting>}
   */
  async function addPlanting(plantingData) {
    const newPlanting = await addPlantingService({
      plantCode: plantingData.plantCode || '',
      sourceType: plantingData.sourceType || SourceType.SEEDLING,
      sourceId: plantingData.sourceId || '',
      sourceCode: plantingData.sourceCode || '',
      cropName: plantingData.cropName || '',
      cropVariety: plantingData.cropVariety || '',
      cropCode: plantingData.cropCode || '',
      areaId: plantingData.areaId || '',
      areaName: plantingData.areaName || '',
      rootName: plantingData.rootName || '',
      plantingCount: plantingData.plantingCount || 0,
      plantingDate: plantingData.plantingDate || new Date().toISOString().slice(0, 10),
      soilPH: plantingData.soilPH || 0,
      soilEC: plantingData.soilEC || 0,
      transplantCount: 0,
      transplantDate: '',
      isHarvest: false,
      harvestDate: '',
      attritionRate: 0,
      printCount: 0,
      traceabilityCode: plantingData.traceabilityCode || '',
      pictures: plantingData.pictures || [],
      remarks: plantingData.remarks || '',
      status: PlantingStatus.PLANTED,
      productionPlanId: plantingData.productionPlanId || '',
      productionPlanCode: plantingData.productionPlanCode || '',
      createBy: localStorage.getItem('username') || '陆启闯',
      targetYield: plantingData.targetYield || 0
    })
    // V1.1: plantings.value.unshift(newPlanting)
    plantings.value = [newPlanting, ...plantings.value]
    return newPlanting
  }

  /**
   * 更新种植记录
   * 1:1 翻译自 V1.1 updatePlantingRecord（对外暴露为 updatePlanting，与 V1.1 一致）
   * @param {string} id
   * @param {Partial<Planting>} plantingData
   * @returns {Promise<void>}
   */
  async function updatePlanting(id, plantingData) {
    await updatePlantingService(id, plantingData)
    const index = plantings.value.findIndex(item => item.id === id)
    if (index !== -1) {
      // V1.1: plantings.value[index] = { ...plantings.value[index], ...plantingData, updateTime: ... }
      plantings.value = plantings.value.map((item, i) =>
        i === index
          ? { ...item, ...plantingData, updateTime: new Date().toLocaleString() }
          : item
      )
    }
  }

  /**
   * 删除种植记录
   * 1:1 翻译自 V1.1 deletePlantingRecord（对外暴露为 deletePlanting，与 V1.1 一致）
   * @param {string} id
   * @returns {Promise<void>}
   */
  async function deletePlanting(id) {
    await deletePlantingsService([id])
    plantings.value = plantings.value.filter(item => item.id !== id)
  }

  /**
   * 批量删除种植记录
   * 1:1 翻译自 V1.1 deletePlantingsBatch（对外暴露为 deletePlantings，与 V1.1 一致）
   * @param {string[]} ids
   * @returns {Promise<void>}
   */
  async function deletePlantingsBatch(ids) {
    await deletePlantingsService(ids)
    plantings.value = plantings.value.filter(item => !ids.includes(item.id))
  }

  /**
   * 采收登记
   * 1:1 翻译自 V1.1 harvestPlantingRecord（对外暴露为 harvestPlanting，与 V1.1 一致）
   * @param {string} id
   * @param {string} harvestDate
   * @param {number} harvestQuantity
   * @returns {Promise<void>}
   */
  async function harvestPlantingRecord(id, harvestDate, harvestQuantity) {
    await harvestPlantingService(id, harvestDate, harvestQuantity)
    const index = plantings.value.findIndex(item => item.id === id)
    if (index !== -1) {
      const planting = plantings.value[index]
      const attritionRate = planting.plantingCount > 0
        ? Math.round((1 - harvestQuantity / planting.plantingCount) * 100)
        : 0
      // V1.1: plantings.value[index] = { ...planting, isHarvest, harvestDate, ... }
      plantings.value = plantings.value.map((item, i) =>
        i === index
          ? {
              ...planting,
              isHarvest: true,
              harvestDate,
              harvestQuantity,
              attritionRate,
              status: PlantingStatus.HARVESTED,
              updateTime: new Date().toLocaleString()
            }
          : item
      )
    }
  }

  /**
   * 结束种植计划（正常结束/异常结束）
   * 1:1 翻译自 V1.1 endPlanting（不调用 API，仅本地状态更新）
   * @param {string} id
   * @param {string} [endType='normal']
   * @param {string} [remarks='']
   * @returns {boolean}
   */
  function endPlanting(id, endType = 'normal', remarks = '') {
    const index = plantings.value.findIndex(item => item.id === id)
    if (index !== -1) {
      // V1.1: plantings.value[index] = { ...plantings.value[index], isFinished, endType, ... }
      plantings.value = plantings.value.map((item, i) =>
        i === index
          ? {
              ...item,
              isFinished: true,
              endType,
              endRemarks: remarks,
              endTime: new Date().toLocaleString(),
              status: endType === 'normal' ? PlantingStatus.HARVESTED : PlantingStatus.CANCELLED,
              updateTime: new Date().toLocaleString()
            }
          : item
      )
      return true
    }
    return false
  }

  return {
    // state
    plantings,
    isLoading,
    // getters
    stats,
    // actions（对外名称 1:1 与 V1.1 一致：planting.vue 已在使用）
    fetchPlantings,
    getPlantingById,
    addPlanting,
    updatePlanting,
    deletePlanting,
    // V1.1 暴露名 `deletePlantings`（批量），调用方 planting.vue 仍用 plantingStore.deletePlantings(ids)
    deletePlantings: deletePlantingsBatch,
    harvestPlanting: harvestPlantingRecord,
    endPlanting
  }
})

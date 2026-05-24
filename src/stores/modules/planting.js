/**
 * 种植管理 Store 模块
 * 对应 V1.1 usePlantingStore
 * 使用 Pinia 管理种植数据状态
 * 数据来源：API /api/plantings (apiPlantingService.ts)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPlantings, addPlanting, updatePlanting, deletePlantings, harvestPlanting } from '@/services/apiPlantingService'

// 种植状态枚举 - 与V1.1保持一致
export const PlantingStatus = {
  PLANTED: 'planted',
  GROWING: 'growing',
  HARVESTED: 'harvested',
  CANCELLED: 'cancelled'
}

// 来源类型枚举
export const SourceType = {
  SEED: 'seed',
  SEEDLING: 'seedling',
  CUTTING: 'cutting',
  GRAFTING: 'grafting',
  TISSUE_CULTURE: 'tissue_culture'
}

export const usePlantingStore = defineStore('planting', () => {
  // ========== 状态定义 ==========

  // 种植记录列表 - 使用与服务端一致的数据结构
  const plantings = ref([])

  // 加载状态
  const isLoading = ref(false)

  // ========== Getters ==========

  // 统计计算 - 与V1.1完全一致
  const stats = computed(() => {
    const total = plantings.value.length
    const growing = plantings.value.filter(p =>
      p.status === PlantingStatus.PLANTED || p.status === PlantingStatus.GROWING
    ).length
    const harvested = plantings.value.filter(p =>
      p.status === PlantingStatus.HARVESTED
    ).length
    const now = new Date()
    const monthCount = plantings.value.filter(p => {
      const date = new Date(p.createTime)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length
    return { total, growing, harvested, monthCount }
  })

  // ========== Actions ==========

  /**
   * 获取种植列表 - 调用真实API
   */
  const fetchPlantings = async () => {
    isLoading.value = true
    try {
      const data = await getPlantings()
      plantings.value = data || []
    } catch (error) {
      console.error('获取种植列表失败:', error)
      plantings.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取单条种植记录
   */
  const getPlantingById = (id) => {
    return plantings.value.find(item => item.id === id)
  }

  /**
   * 添加种植记录
   */
  const addPlantingRecord = async (plantingData) => {
    try {
      const newPlanting = await addPlanting({
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
      plantings.value.unshift(newPlanting)
      return newPlanting
    } catch (error) {
      console.error('添加种植记录失败:', error)
      throw error
    }
  }

  /**
   * 更新种植记录
   */
  const updatePlantingRecord = async (id, plantingData) => {
    try {
      await updatePlanting(id, plantingData)
      const index = plantings.value.findIndex(item => item.id === id)
      if (index !== -1) {
        plantings.value[index] = {
          ...plantings.value[index],
          ...plantingData,
          updateTime: new Date().toLocaleString()
        }
      }
    } catch (error) {
      console.error('更新种植记录失败:', error)
      throw error
    }
  }

  /**
   * 删除种植记录
   */
  const deletePlantingRecord = async (id) => {
    try {
      await deletePlantings([id])
      plantings.value = plantings.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('删除种植记录失败:', error)
      throw error
    }
  }

  /**
   * 批量删除种植记录
   */
  const deletePlantingsBatch = async (ids) => {
    try {
      await deletePlantings(ids)
      plantings.value = plantings.value.filter(item => !ids.includes(item.id))
    } catch (error) {
      console.error('批量删除种植记录失败:', error)
      throw error
    }
  }

  /**
   * 采收登记
   */
  const harvestPlantingRecord = async (id, harvestDate, harvestQuantity) => {
    try {
      await harvestPlanting(id, harvestDate, harvestQuantity)
      const index = plantings.value.findIndex(item => item.id === id)
      if (index !== -1) {
        const planting = plantings.value[index]
        const attritionRate = planting.plantingCount > 0
          ? Math.round((1 - harvestQuantity / planting.plantingCount) * 100)
          : 0
        plantings.value[index] = {
          ...planting,
          isHarvest: true,
          harvestDate,
          harvestQuantity,
          attritionRate,
          status: PlantingStatus.HARVESTED,
          updateTime: new Date().toLocaleString()
        }
      }
    } catch (error) {
      console.error('采收登记失败:', error)
      throw error
    }
  }

  /**
   * 结束种植计划（正常结束/异常结束）
   */
  const endPlanting = async (id, endType = 'normal', remarks = '') => {
    const index = plantings.value.findIndex(item => item.id === id)
    if (index !== -1) {
      plantings.value[index] = {
        ...plantings.value[index],
        isFinished: true,
        endType: endType,
        endRemarks: remarks,
        endTime: new Date().toLocaleString(),
        status: endType === 'normal' ? PlantingStatus.HARVESTED : PlantingStatus.CANCELLED,
        updateTime: new Date().toLocaleString()
      }
      return true
    }
    return false
  }

  return {
    // 状态
    plantings,
    isLoading,
    // Getters
    stats,
    // Actions
    fetchPlantings,
    getPlantingById,
    addPlanting: addPlantingRecord,
    updatePlanting: updatePlantingRecord,
    deletePlanting: deletePlantingRecord,
    deletePlantings: deletePlantingsBatch,
    harvestPlanting: harvestPlantingRecord,
    endPlanting
  }
})

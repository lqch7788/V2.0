/**
 * 种植管理 Store 模块
 * 使用 Pinia 管理种植数据状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 种植状态枚举
export const PlantingStatus = {
  PLANTED: 'planted',
  GROWING: 'growing',
  HARVESTED: 'harvested',
  CANCELLED: 'cancelled'
}

// 来源类型枚举
export const SourceType = {
  SEED: 'seed',
  SEEDLING: 'seedling'
}

// Mock数据
const mockPlantings = [
  {
    id: '1',
    plantCode: 'ZZ202405001',
    productionPlanCode: 'SC202405001',
    sourceType: 'seedling',
    sourceId: 'S001',
    sourceCode: 'YM202405001',
    cropName: '番茄',
    cropVariety: '大红番茄',
    cropCode: '001001001001',
    areaId: 'A001',
    areaName: '1号棚',
    rootName: '大棚区',
    plantingCount: 1000,
    plantingDate: '2024-05-01',
    soilPH: 6.5,
    soilEC: 2.3,
    transplantCount: 0,
    transplantDate: '',
    isHarvest: false,
    harvestDate: '',
    harvestQuantity: 0,
    attritionRate: 2.5,
    printCount: 0,
    traceabilityCode: 'TR20240501番',
    pictures: [],
    remarks: '',
    status: 'growing',
    createBy: '陆启闯',
    createTime: '2024-05-01 10:00:00',
    updateTime: '2024-05-01 10:00:00',
    unit: '株',
    targetYield: 5000
  },
  {
    id: '2',
    plantCode: 'ZZ202405002',
    productionPlanCode: '',
    sourceType: 'seedling',
    sourceId: 'S002',
    sourceCode: 'YM202405002',
    cropName: '黄瓜',
    cropVariety: '水果黄瓜',
    cropCode: '002001001001',
    areaId: 'A002',
    areaName: '2号棚',
    rootName: '大棚区',
    plantingCount: 800,
    plantingDate: '2024-05-03',
    soilPH: 6.8,
    soilEC: 2.1,
    transplantCount: 0,
    transplantDate: '',
    isHarvest: true,
    harvestDate: '2024-06-15',
    harvestQuantity: 750,
    attritionRate: 6.25,
    printCount: 1,
    traceabilityCode: 'TR20240503黄',
    pictures: [],
    remarks: '',
    status: 'harvested',
    createBy: '陆启闯',
    createTime: '2024-05-03 09:00:00',
    updateTime: '2024-06-15 16:00:00',
    unit: '株',
    targetYield: 4000
  },
  {
    id: '3',
    plantCode: 'ZZ202405003',
    productionPlanCode: 'SC202405003',
    sourceType: 'seed',
    sourceId: 'Z001',
    sourceCode: 'ZY202405001',
    cropName: '辣椒',
    cropVariety: '螺丝椒',
    cropCode: '003001001001',
    areaId: 'A003',
    areaName: '3号棚',
    rootName: '大棚区',
    plantingCount: 1200,
    plantingDate: '2024-05-05',
    soilPH: 7.0,
    soilEC: 1.8,
    transplantCount: 0,
    transplantDate: '',
    isHarvest: false,
    harvestDate: '',
    harvestQuantity: 0,
    attritionRate: 0,
    printCount: 0,
    traceabilityCode: 'TR20240505辣',
    pictures: [],
    remarks: '',
    status: 'planted',
    createBy: '张三',
    createTime: '2024-05-05 14:00:00',
    updateTime: '2024-05-05 14:00:00',
    unit: '株',
    targetYield: 6000
  }
]

export const usePlantingStore = defineStore('planting', () => {
  // ========== 状态定义 ==========

  // 种植记录列表
  const plantings = ref([...mockPlantings])

  // 加载状态
  const isLoading = ref(false)

  // ========== Getters ==========

  // 统计计算
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
   * 获取种植列表
   */
  const fetchPlantings = async () => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      // 使用现有数据
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
  const addPlanting = async (plantingData) => {
    const newPlanting = {
      id: `PL_${Date.now()}`,
      plantCode: plantingData.plantCode || `ZZ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(plantings.value.length + 1).padStart(3, '0')}`,
      productionPlanCode: plantingData.productionPlanCode || '',
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
      soilPH: plantingData.soilPH || null,
      soilEC: plantingData.soilEC || null,
      transplantCount: 0,
      transplantDate: '',
      isHarvest: false,
      harvestDate: '',
      harvestQuantity: 0,
      attritionRate: 0,
      printCount: 0,
      traceabilityCode: plantingData.traceabilityCode || '',
      pictures: plantingData.pictures || [],
      remarks: plantingData.remarks || '',
      status: PlantingStatus.PLANTED,
      createBy: localStorage.getItem('username') || '陆启闯',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      unit: plantingData.unit || '株',
      targetYield: plantingData.targetYield || 0
    }
    plantings.value.unshift(newPlanting)
    return newPlanting
  }

  /**
   * 更新种植记录
   */
  const updatePlanting = async (id, plantingData) => {
    const index = plantings.value.findIndex(item => item.id === id)
    if (index !== -1) {
      plantings.value[index] = {
        ...plantings.value[index],
        ...plantingData,
        updateTime: new Date().toLocaleString()
      }
    }
  }

  /**
   * 删除种植记录
   */
  const deletePlanting = async (id) => {
    const index = plantings.value.findIndex(item => item.id === id)
    if (index !== -1) {
      plantings.value.splice(index, 1)
    }
  }

  /**
   * 批量删除种植记录
   */
  const deletePlantings = async (ids) => {
    plantings.value = plantings.value.filter(item => !ids.includes(item.id))
  }

  /**
   * 采收登记
   */
  const harvestPlanting = async (id, harvestDate, harvestQuantity) => {
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
  }

  /**
   * 结束种植计划（正常结束/异常结束）
   * @param id 种植记录ID
   * @param endType 结束类型：'normal' 正常结束，'abnormal' 异常结束
   * @param remarks 备注
   */
  const endPlanting = async (id, endType = 'normal', remarks = '') => {
    const index = plantings.value.findIndex(item => item.id === id)
    if (index !== -1) {
      const planting = plantings.value[index]
      plantings.value[index] = {
        ...planting,
        isFinished: true,
        endType: endType,
        endRemarks: remarks,
        endTime: new Date().toLocaleString(),
        status: endType === 'normal' ? PlantingStatus.HARVESTED : 'cancelled',
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
    addPlanting,
    updatePlanting,
    deletePlanting,
    deletePlantings,
    harvestPlanting,
    endPlanting
  }
})

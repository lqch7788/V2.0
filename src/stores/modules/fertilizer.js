/**
 * 施肥管理 Store 模块
 * 使用 Pinia 管理施肥记录数据状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 模拟施肥记录数据
const mockFertilizerItems = [
  {
    id: 'FERT_20260522_001',
    fertilizerCode: 'SF20260522001',
    fertilizerName: '有机复合肥',
    fertilizerType: 'compound',
    cropName: '番茄',
    greenhouseName: '1号大棚-A区',
    dilutionRatio: '1:500',
    quantity: 150.5,
    unit: '千克',
    unitPrice: 12.5,
    totalCost: 1881.25,
    fertilizeTime: '2026-05-22 09:30:00',
    dataSource: 'manual',
    operatorName: '张三',
    description: '定植后第一次追肥',
    productionPlanCode: '',
    productionPlanId: '',
    plantingCode: '',
    farmTaskId: '',
    createTime: '2026-05-22 09:35:00',
    updateTime: '2026-05-22 09:35:00'
  },
  {
    id: 'FERT_20260521_002',
    fertilizerCode: 'SF20260521002',
    fertilizerName: '水溶性氮肥',
    fertilizerType: 'inorganic',
    cropName: '黄瓜',
    greenhouseName: '2号大棚',
    dilutionRatio: '1:800',
    quantity: 80.0,
    unit: '千克',
    unitPrice: 8.0,
    totalCost: 640.0,
    fertilizeTime: '2026-05-21 14:20:00',
    dataSource: 'auto_iot',
    iotDeviceId: 'IOT_DEVICE_001',
    operatorName: '李四',
    description: '滴灌施肥',
    productionPlanCode: '',
    productionPlanId: '',
    plantingCode: '',
    farmTaskId: '',
    createTime: '2026-05-21 14:25:00',
    updateTime: '2026-05-21 14:25:00'
  },
  {
    id: 'FERT_20260520_003',
    fertilizerCode: 'SF20260520003',
    fertilizerName: '生物有机肥',
    fertilizerType: 'biological',
    cropName: '茄子',
    greenhouseName: '3号大棚',
    dilutionRatio: '1:200',
    quantity: 200.0,
    unit: '千克',
    unitPrice: 15.0,
    totalCost: 3000.0,
    fertilizeTime: '2026-05-20 08:00:00',
    dataSource: 'manual',
    operatorName: '王五',
    description: '基肥深施',
    productionPlanCode: '',
    productionPlanId: '',
    plantingCode: '',
    farmTaskId: '',
    createTime: '2026-05-20 08:10:00',
    updateTime: '2026-05-20 08:10:00'
  },
  {
    id: 'FERT_20260519_004',
    fertilizerCode: 'SF20260519004',
    fertilizerName: '磷酸二氢钾',
    fertilizerType: 'trace',
    cropName: '辣椒',
    greenhouseName: '1号大棚-B区',
    dilutionRatio: '1:1000',
    quantity: 50.0,
    unit: '千克',
    unitPrice: 25.0,
    totalCost: 1250.0,
    fertilizeTime: '2026-05-19 16:30:00',
    dataSource: 'manual',
    operatorName: '张三',
    description: '叶面喷施',
    productionPlanCode: '',
    productionPlanId: '',
    plantingCode: '',
    farmTaskId: '',
    createTime: '2026-05-19 16:35:00',
    updateTime: '2026-05-19 16:35:00'
  },
  {
    id: 'FERT_20260518_005',
    fertilizerCode: 'SF20260518005',
    fertilizerName: '有机肥（牛粪）',
    fertilizerType: 'organic',
    cropName: '生菜',
    greenhouseName: '4号地块',
    dilutionRatio: '',
    quantity: 500.0,
    unit: '千克',
    unitPrice: 3.0,
    totalCost: 1500.0,
    fertilizeTime: '2026-05-18 07:00:00',
    dataSource: 'auto_iot',
    iotDeviceId: 'IOT_DEVICE_002',
    operatorName: '李四',
    description: '基肥撒施后翻耕',
    productionPlanCode: '',
    productionPlanId: '',
    plantingCode: '',
    farmTaskId: '',
    createTime: '2026-05-18 07:15:00',
    updateTime: '2026-05-18 07:15:00'
  }
]

export const useFertilizerStore = defineStore('fertilizer', () => {
  // ========== 状态定义 ==========

  // 施肥记录列表
  const items = ref([...mockFertilizerItems])

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const error = ref(null)

  // ========== 计算属性 ==========

  // 统计数据
  const stats = computed(() => {
    const total = items.value.length
    const totalQuantity = items.value.reduce((sum, it) => sum + (it.quantity || 0), 0)
    const totalCost = items.value.reduce((sum, it) => sum + (it.totalCost || 0), 0)
    const iotCount = items.value.filter((it) => it.dataSource === 'auto_iot').length
    return { total, totalQuantity, totalCost, iotCount }
  })

  // ========== Actions ==========

  /**
   * 获取施肥记录列表
   */
  const fetchItems = async (filters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      // 模拟异步请求
      await new Promise(resolve => setTimeout(resolve, 300))
      // 实际项目中这里会根据filters过滤数据
      items.value = [...mockFertilizerItems]
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建施肥记录
   */
  const createItem = async (itemData) => {
    const newItem = {
      id: `FERT_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${String(items.value.length + 1).padStart(3, '0')}`,
      fertilizerCode: itemData.fertilizerCode || `SF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(items.value.length + 1).padStart(3, '0')}`,
      fertilizerName: itemData.fertilizerName || '',
      fertilizerType: itemData.fertilizerType || '',
      cropName: itemData.cropName || '',
      greenhouseName: itemData.greenhouseName || '',
      dilutionRatio: itemData.dilutionRatio || '',
      quantity: itemData.quantity || 0,
      unit: itemData.unit || '千克',
      unitPrice: itemData.unitPrice || 0,
      totalCost: itemData.totalCost || 0,
      fertilizeTime: itemData.fertilizeTime || '',
      operatorName: itemData.operatorName || '',
      dataSource: itemData.dataSource || 'manual',
      description: itemData.description || '',
      productionPlanCode: itemData.productionPlanCode || '',
      productionPlanId: itemData.productionPlanId || '',
      plantingCode: itemData.plantingCode || '',
      farmTaskId: itemData.farmTaskId || '',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString()
    }
    items.value.unshift(newItem)
    return newItem
  }

  /**
   * 更新施肥记录
   */
  const updateItem = async (id, itemData) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = {
        ...items.value[index],
        ...itemData,
        updateTime: new Date().toLocaleString()
      }
    }
  }

  /**
   * 删除单条施肥记录
   */
  const deleteItem = async (id) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  /**
   * 批量删除施肥记录
   */
  const deleteItems = async (ids) => {
    items.value = items.value.filter(item => !ids.includes(item.id))
  }

  /**
   * 根据ID获取单条记录
   */
  const getItemById = (id) => {
    return items.value.find(item => item.id === id) || null
  }

  return {
    // 状态
    items,
    isLoading,
    error,
    stats,
    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    getItemById
  }
})

// 字典项名称映射
const dictLabels = {
  fertilizer_type: {
    organic: '有机肥',
    inorganic: '无机肥',
    biological: '生物肥',
    compound: '复合肥',
    trace: '微量元素肥'
  }
}

/**
 * 获取字典项显示名称
 */
export const getDictItemName = (category, code) => {
  if (!code) return ''
  const categoryMap = dictLabels[category]
  if (!categoryMap) return code
  return categoryMap[code] || code
}

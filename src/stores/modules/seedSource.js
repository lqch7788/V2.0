import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/crop'

export const useSeedSourceStore = defineStore('seedSource', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const currentItem = ref(null)
  const filters = ref({
    cropCategory: '',
    cropName: '',
    seedCode: '',
    sourceType: '',
    supplierName: '',
    startDate: '',
    endDate: '',
    status: '',
    createBy: '',
    cropType: '',
    orgId: '',
    recorderId: '',
    surplusMin: undefined,
    surplusMax: undefined,
    propagationType: undefined,
    propagationStatus: undefined
  })

  // 加载数据
  const loadItems = async () => {
    isLoading.value = true
    try {
      const res = await api.getSeedSourceList(filters.value)
      // 兼容后端返回格式：可能是数组，也可能是 { success: true, data: [...] }，也可能是 { items: [...] }，也可能是 { data: [...] }
      let rawItems = []
      if (Array.isArray(res)) {
        rawItems = res
      } else if (res && typeof res === 'object') {
        // 处理 { success: true, data: [...] } 格式（后端实际返回格式）
        if ('success' in res && res.data !== undefined) {
          rawItems = Array.isArray(res.data) ? res.data : []
        } else if ('items' in res) {
          rawItems = res.items || []
        } else if ('data' in res && Array.isArray(res.data)) {
          rawItems = res.data
        } else if (Array.isArray(res)) {
          rawItems = res
        } else {
          rawItems = []
        }
      } else {
        rawItems = []
      }

      // 将后端返回的 snake_case 字段映射为前端需要的 camelCase 格式
      items.value = rawItems.map(item => ({
        id: item.id,
        // 种源批号
        seedCode: item.seedCode || item.source_code || '',
        // 源名称
        sourceName: item.sourceName || item.source_name || '',
        // 种源类型
        sourceType: item.sourceType || item.source_type || '',
        // 来源途径
        sourceOrigin: item.sourceOrigin || item.source_origin || 'external_purchase',
        // 作物类别
        cropCategory: item.cropCategory || item.crop_category || '',
        // 作物名称
        cropName: item.cropName || item.crop_name || '',
        // 作物品种
        cropVariety: item.cropVariety || item.crop_variety || '',
        // 作物编码
        cropCode: item.cropCode || item.crop_code || '',
        // 供应商ID
        supplierId: item.supplierId || item.supplier_id || '',
        // 供应商名称
        supplierName: item.supplierName || item.supplier_name || '',
        // 采购日期
        purchaseDate: item.purchaseDate || item.purchase_date || '',
        // 数量相关
        quantity: item.quantity || 0,
        unit: item.unit || '',
        unitPrice: item.unitPrice || item.purchase_price || 0,
        totalAmount: item.totalAmount || item.total_amount || 0,
        initialCount: item.initialCount || item.initial_quantity || item.quantity || 0,
        availableCount: item.availableCount || item.remaining_quantity || 0,
        // 状态
        status: item.status || 'active',
        // 备注
        remarks: item.remarks || '',
        // 关联生产计划
        productionPlanCode: item.productionPlanCode || item.production_plan_code || '',
        // 创建信息
        createBy: item.createBy || item.create_by || '',
        createTime: item.createTime || item.create_time || '',
        updateTime: item.updateTime || item.update_time || '',
        // 繁殖相关
        propagationType: item.propagationType || item.propagation_type || '',
        propagationStatus: item.propagationStatus || item.propagation_status || '',
        // 图片
        pictures: item.pictures || []
      }))
    } catch (error) {
      console.error('获取种源数据失败:', error)
      // 使用mock数据
      items.value = getMockData()
    } finally {
      isLoading.value = false
    }
  }

  // 获取详情
  const loadItem = async (id) => {
    try {
      const res = await api.getSeedSourceDetail(id)
      currentItem.value = res
      return res
    } catch (error) {
      console.error('获取种源详情失败:', error)
      return null
    }
  }

  // 创建
  const addItem = async (data) => {
    try {
      const res = await api.createSeedSource(data)
      items.value.unshift(res)
      return res
    } catch (error) {
      console.error('创建种源失败:', error)
      throw error
    }
  }

  // 更新
  const updateItem = async (id, data) => {
    try {
      const res = await api.updateSeedSource(id, data)
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = res
      }
      return res
    } catch (error) {
      console.error('更新种源失败:', error)
      throw error
    }
  }

  // 删除
  const deleteItem = async (id) => {
    try {
      await api.deleteSeedSource(id)
      items.value = items.value.filter(item => item.id !== id)
      return true
    } catch (error) {
      console.error('删除种源失败:', error)
      return false
    }
  }

  // 批量删除
  const deleteItems = async (ids) => {
    try {
      await api.deleteSeedSources(ids)
      items.value = items.value.filter(item => !ids.includes(item.id))
      return true
    } catch (error) {
      console.error('批量删除种源失败:', error)
      return false
    }
  }

  // 更新筛选条件
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // 重置筛选条件
  const resetFilters = () => {
    filters.value = {
      cropCategory: '',
      cropName: '',
      seedCode: '',
      sourceType: '',
      supplierName: '',
      startDate: '',
      endDate: '',
      status: '',
      createBy: '',
      cropType: '',
      orgId: '',
      recorderId: '',
      surplusMin: undefined,
      surplusMax: undefined,
      propagationType: undefined,
      propagationStatus: undefined
    }
  }

  // 添加繁殖过程记录
  const addPropagationRecord = async (seedSourceId, data) => {
    try {
      const res = await api.addPropagationRecord(seedSourceId, data)
      return res
    } catch (error) {
      console.error('添加繁殖过程记录失败:', error)
      return null
    }
  }

  // 获取繁殖过程记录列表
  const loadPropagationRecords = async (seedSourceId) => {
    try {
      const res = await api.getPropagationRecords(seedSourceId)
      return res || []
    } catch (error) {
      console.error('获取繁殖过程记录失败:', error)
      return []
    }
  }

  // 更新繁殖阶段
  const updatePropagationStage = async (seedSourceId, newStage) => {
    try {
      await api.updatePropagationStage(seedSourceId, newStage)
      // 更新本地items中的状态
      const index = items.value.findIndex(item => item.id === seedSourceId)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], propagationStatus: newStage }
      }
      return true
    } catch (error) {
      console.error('更新繁殖阶段失败:', error)
      return false
    }
  }

  // 完成繁殖入库
  const completePropagation = async (seedSourceId, quantity) => {
    try {
      await api.completePropagation(seedSourceId, quantity)
      // 更新本地items中的状态和数量
      const index = items.value.findIndex(item => item.id === seedSourceId)
      if (index !== -1) {
        items.value[index] = {
          ...items.value[index],
          propagationStatus: 'completed',
          availableCount: items.value[index].availableCount + quantity,
          quantity: items.value[index].quantity + quantity
        }
      }
      return true
    } catch (error) {
      console.error('完成繁殖入库失败:', error)
      return false
    }
  }

  return {
    items,
    isLoading,
    currentItem,
    filters,
    loadItems,
    loadItem,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    setFilters,
    resetFilters,
    addPropagationRecord,
    loadPropagationRecords,
    updatePropagationStage,
    completePropagation
  }
})

// Mock数据
function getMockData() {
  return [
    {
      id: '1',
      seedCode: 'ZY20260101001',
      sourceType: 'seed',
      sourceOrigin: 'external_purchase',
      cropCategory: '蔬菜类',
      typeName: '叶菜类',
      varietyName: '菠菜',
      cropName: '圆叶菠菜',
      cropVariety: '圆叶菠菜',
      cropCode: '010101001',
      supplierId: 'S001',
      supplierName: '寿光种业',
      purchaseDate: '2026-01-15',
      quantity: 1000,
      unit: '粒',
      unitPrice: 0.5,
      totalAmount: 500,
      initialCount: 950,
      availableCount: 850,
      pictures: [],
      remarks: '优质种子',
      status: 'sufficient',
      traceabilityCode: 'ZY20260101001',
      printCount: 0,
      createBy: '管理员',
      createTime: '2026-01-15 10:30:00',
      updateTime: '2026-01-15 10:30:00'
    },
    {
      id: '2',
      seedCode: 'ZY20260320002',
      sourceType: 'seedling',
      sourceOrigin: 'external_purchase',
      cropCategory: '茄果类',
      typeName: '番茄类',
      varietyName: '番茄',
      cropName: '红果番茄',
      cropVariety: '红果番茄',
      cropCode: '010201001',
      supplierId: 'S002',
      supplierName: '农科院种业',
      purchaseDate: '2026-03-20',
      quantity: 500,
      unit: '株',
      unitPrice: 2.0,
      totalAmount: 1000,
      initialCount: 480,
      availableCount: 320,
      pictures: [],
      remarks: '组培苗',
      status: 'low',
      traceabilityCode: 'ZY20260320002',
      printCount: 0,
      createBy: '管理员',
      createTime: '2026-03-20 14:20:00',
      updateTime: '2026-03-20 14:20:00'
    }
  ]
}

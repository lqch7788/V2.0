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
    createBy: ''
  })

  // 加载数据
  const loadItems = async () => {
    isLoading.value = true
    try {
      const res = await api.getSeedSourceList(filters.value)
      items.value = res.items || []
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
      createBy: ''
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
    resetFilters
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

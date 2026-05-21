import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/crop'

export const useSeedlingStore = defineStore('seedling', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const currentItem = ref(null)
  const filters = ref({
    cropName: '',
    seedlingCode: '',
    sourceCode: '',
    startDate: '',
    endDate: '',
    siteName: '',
    seedlingType: '',
    createBy: '',
    status: ''
  })

  // 加载数据
  const loadItems = async () => {
    isLoading.value = true
    try {
      const res = await api.getSeedlingList(filters.value)
      items.value = res.items || []
    } catch (error) {
      console.error('获取育苗数据失败:', error)
      // 使用mock数据
      items.value = getMockData()
    } finally {
      isLoading.value = false
    }
  }

  // 获取详情
  const loadItem = async (id) => {
    try {
      const res = await api.getSeedlingDetail(id)
      currentItem.value = res
      return res
    } catch (error) {
      console.error('获取育苗详情失败:', error)
      return null
    }
  }

  // 创建
  const addItem = async (data) => {
    try {
      const res = await api.createSeedling(data)
      items.value.unshift(res)
      return res
    } catch (error) {
      console.error('创建育苗失败:', error)
      throw error
    }
  }

  // 更新
  const updateItem = async (id, data) => {
    try {
      const res = await api.updateSeedling(id, data)
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = res
      }
      return res
    } catch (error) {
      console.error('更新育苗失败:', error)
      throw error
    }
  }

  // 删除
  const deleteItem = async (id) => {
    try {
      await api.deleteSeedling(id)
      items.value = items.value.filter(item => item.id !== id)
      return true
    } catch (error) {
      console.error('删除育苗失败:', error)
      return false
    }
  }

  // 批量删除
  const deleteItems = async (ids) => {
    try {
      await api.deleteSeedlings(ids)
      items.value = items.value.filter(item => !ids.includes(item.id))
      return true
    } catch (error) {
      console.error('批量删除育苗失败:', error)
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
      cropName: '',
      seedlingCode: '',
      sourceCode: '',
      startDate: '',
      endDate: '',
      siteName: '',
      seedlingType: '',
      createBy: '',
      status: ''
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
      seedlingCode: 'YM20260301001',
      sourceId: '1',
      sourceCode: 'ZY20260101001',
      cropName: '圆叶菠菜',
      cropVariety: '圆叶菠菜',
      cropCode: '010101001',
      seedlingType: '穴盘育苗',
      siteId: 'S001',
      siteName: '1号大棚',
      startDate: '2026-03-01',
      expectedEndDate: '2026-03-25',
      endDate: '',
      initialCount: 500,
      survivalCount: 450,
      plantedCount: 200,
      survivalRate: 90,
      lossCount: 50,
      lossRate: 10,
      isFinished: false,
      status: 'in_progress',
      dailyRecords: [],
      pictures: [],
      qualityGrade: 'A级',
      printCount: 0,
      remarks: '生长良好',
      createBy: '管理员',
      createTime: '2026-03-01 08:00:00',
      updateTime: '2026-03-15 10:30:00'
    },
    {
      id: '2',
      seedlingCode: 'YM20260310002',
      sourceId: '2',
      sourceCode: 'ZY20260320002',
      cropName: '红果番茄',
      cropVariety: '红果番茄',
      cropCode: '010201001',
      seedlingType: '嫁接育苗',
      siteId: 'S002',
      siteName: '2号大棚',
      startDate: '2026-03-10',
      expectedEndDate: '2026-04-05',
      endDate: '',
      initialCount: 300,
      survivalCount: 285,
      plantedCount: 0,
      survivalRate: 95,
      lossCount: 15,
      lossRate: 5,
      isFinished: false,
      status: 'in_progress',
      dailyRecords: [],
      pictures: [],
      qualityGrade: 'A级',
      printCount: 0,
      remarks: '嫁接成活率高',
      createBy: '管理员',
      createTime: '2026-03-10 09:00:00',
      updateTime: '2026-03-18 14:20:00'
    }
  ]
}

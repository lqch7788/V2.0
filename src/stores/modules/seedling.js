import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/crop'
import { enhancedApiClient } from '@/lib/apiClient'

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
    status: '',
    // 更多筛选条件
    initialCountMin: undefined,
    initialCountMax: undefined,
    survivalCountMin: undefined,
    survivalCountMax: undefined,
    lossCountMin: undefined,
    lossCountMax: undefined,
    surplusMin: undefined,
    surplusMax: undefined,
    survivalRateMin: undefined,
    survivalRateMax: undefined,
    lossRateMin: undefined,
    lossRateMax: undefined
  })

  // 字段映射函数：将后端返回的snake_case字段转换为前端需要的camelCase
  const mapFields = (data) => {
    if (!data || !Array.isArray(data)) return data
    return data.map(item => ({
      // 基础字段映射
      id: item.id,
      seedlingCode: item.seedlingCode || item.seedling_code || '',
      sourceId: item.sourceId || item.source_id || '',
      sourceCode: item.sourceCode || item.source_code || '',
      cropName: item.cropName || item.crop_name || '',
      cropVariety: item.cropVariety || item.crop_variety || '',
      cropCode: item.cropCode || item.crop_code || '',
      seedlingType: item.seedlingType || item.seedling_type || '',
      siteId: item.siteId || item.site_id || '',
      siteName: item.siteName || item.site_name || item.greenhouse_name || '',
      startDate: item.startDate || item.seedling_date || '',
      expectedEndDate: item.expectedEndDate || item.expected_finish_date || '',
      endDate: item.endDate || item.end_date || '',
      initialCount: item.initialCount || item.seedling_quantity || 0,
      survivalCount: item.survivalCount || item.survival_quantity || 0,
      plantedCount: item.plantedCount || item.planted_quantity || 0,
      lossCount: item.lossCount || item.loss_quantity || 0,
      survivalRate: item.survivalRate || item.survival_rate || 0,
      lossRate: item.lossRate || item.loss_rate || 0,
      isFinished: item.isFinished || item.is_finished || false,
      status: item.status || 'in_progress',
      dailyRecords: item.dailyRecords || item.daily_records || [],
      pictures: item.pictures || [],
      qualityGrade: item.qualityGrade || item.quality_grade || '',
      printCount: item.printCount || item.print_count || 0,
      remarks: item.remarks || '',
      createBy: item.createBy || item.create_by || '',
      createTime: item.createTime || item.create_time || '',
      updateTime: item.updateTime || item.update_time || '',
      // 品种路径字段（来自关联查询）
      categoryName: item.categoryName || item.category_name || '',
      typeName: item.typeName || item.type_name || '',
      varietyName: item.varietyName || item.variety_name || '',
      subVarietyName: item.subVarietyName || item.sub_variety1_name || '',
      // 关联字段
      productionPlanCode: item.productionPlanCode || item.production_plan_code || ''
    }))
  }

  // 加载数据
  const loadItems = async () => {
    isLoading.value = true
    try {
      const res = await api.getSeedlingList(filters.value)
      // 后端返回格式: { success: true, data: [...items数组], meta: {...} }
      // 响应拦截器会返回 data 字段，即 items 数组
      const rawData = Array.isArray(res) ? res : (res.items || res.data || [])
      items.value = mapFields(rawData)
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
      // 对详情数据进行字段映射
      const mapped = Array.isArray(res) ? mapFields(res) : (res ? mapFields([res])[0] : null)
      currentItem.value = mapped
      return mapped
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

  /**
   * 结束育苗计划（正常结束/异常结束）
   * @param id 育苗记录ID
   * @param endType 结束类型：'normal' 正常结束，'abnormal' 异常结束
   * @param remarks 备注
   */
  const endItem = async (id, endType = 'normal', remarks = '') => {
    try {
      await api.finishSeedling(id, { endType, remarks })
      // 刷新列表
      await loadItems()
      return true
    } catch (error) {
      console.error('结束育苗失败:', error)
      throw error
    }
  }

  // 更新筛选条件
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // 添加每日记录
  const addDailyRecord = async (seedlingId, record) => {
    try {
      const res = await api.addDailyRecord(seedlingId, record)
      // 刷新列表
      await loadItems()
      return res
    } catch (error) {
      console.error('添加每日记录失败:', error)
      throw error
    }
  }

  // 更新每日记录
  const updateDailyRecord = async (seedlingId, recordId, updates) => {
    try {
      await api.updateDailyRecord(seedlingId, recordId, updates)
      // 刷新列表
      await loadItems()
      return true
    } catch (error) {
      console.error('更新每日记录失败:', error)
      return false
    }
  }

  // 删除每日记录
  const deleteDailyRecord = async (seedlingId, recordId) => {
    try {
      await api.deleteDailyRecord(seedlingId, recordId)
      // 刷新列表
      await loadItems()
      return true
    } catch (error) {
      console.error('删除每日记录失败:', error)
      return false
    }
  }

  // 增加已定植数量
  const increasePlantedCount = async (id, count) => {
    try {
      await api.increasePlantedCount(id, count)
      // 刷新列表
      await loadItems()
      return true
    } catch (error) {
      console.error('增加已定植数量失败:', error)
      return false
    }
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
      status: '',
      // 更多筛选条件
      initialCountMin: undefined,
      initialCountMax: undefined,
      survivalCountMin: undefined,
      survivalCountMax: undefined,
      lossCountMin: undefined,
      lossCountMax: undefined,
      surplusMin: undefined,
      surplusMax: undefined,
      survivalRateMin: undefined,
      survivalRateMax: undefined,
      lossRateMin: undefined,
      lossRateMax: undefined
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
    endItem,
    setFilters,
    resetFilters,
    addDailyRecord,
    updateDailyRecord,
    deleteDailyRecord,
    increasePlantedCount
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

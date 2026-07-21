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
  // 2026-07-21 P0 修复：补全 14 个 V1.1 transformSingleSeedling 中的关键业务字段
  // 原 V2.0 mapFields 缺失 motherPlantCount/expandedPlantCount/motherLossCount/seedlingLossCount/
  // harvestStockedCount/replantCount/propagationMode/isHarvestLocked 等，导致表格全部显示 0。
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
      productionPlanCode: item.productionPlanCode || item.production_plan_code || '',
      // ========== 2026-07-21 补全的 5 业务字段 + 5 预估字段 + 衍生字段 ==========
      propagationMode: item.propagationMode || 'one_to_one',
      motherPlantCount: item.motherPlantCount || 0,
      expandedPlantCount: item.expandedPlantCount || 0,
      scionCount: item.scionCount || 0,
      motherLossCount: item.motherLossCount || 0,
      seedlingLossCount: item.seedlingLossCount || 0,
      harvestStockedCount: item.harvestStockedCount || 0,
      replantCount: item.replantCount || 0,
      availableTransplantCount: Math.max(0,
        (item.expandedPlantCount || 0) - (item.seedlingLossCount || 0) - (item.harvestStockedCount || 0)
      ),
      propagationMultiple: item.propagationMultiple || 0,
      customMultiple: item.customMultiple || 0,
      theoreticalYield: item.theoreticalYield || 0,
      targetSurvivalRate: item.targetSurvivalRate || 0,
      targetSurvivalCount: item.targetSurvivalCount || 0,
      // 状态机字段
      isHarvestLocked: item.isHarvestLocked || 0,
      endType: item.endType || '',
      endTime: item.endTime || '',
      chargePerson: item.chargePerson || ''
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
      // 2026-07-21 P0 修复：API 失败时不再 fallback 到 mock 数据
      // 原逻辑会导致"删除数据后刷新页面，数据被恢复"的 bug：
      // 当 GET /seedlings 因任何原因失败（500/超时/token 过期/CORS/服务重启）时，
      // catch 分支会用 getMockData() 覆盖真实空状态，让用户产生"删除无效"的错觉。
      // V1.1 useSeedlingStore.ts 的正确做法：只记录错误，不修改 items。
      // 与 apiSeedlingService.js 注释中"无缓存降级"的铁律保持一致。
      console.error('[seedling] 获取育苗数据失败:', error)
      // 不覆盖 items，保留删除/筛选后的真实状态
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

  // 删除（对齐 V1.1 useSeedlingStore.ts L78-89）
  const deleteItem = async (id) => {
    try {
      const result = await api.deleteSeedling(id)
      if (result) {
        items.value = items.value.filter(item => item.id !== id)
      }
      return result
    } catch (error) {
      console.error('删除育苗失败:', error)
      return false
    }
  }

  // 批量删除（对齐 V1.1 useSeedlingStore.ts L91-102）
  const deleteItems = async (ids) => {
    try {
      const result = await api.deleteSeedlings(ids)
      // 2026-07-21 对齐 V1.1：V1.1 用 `if (result)` 判断后才 filter，失败时不污染 store
      if (result) {
        items.value = items.value.filter(item => !ids.includes(item.id))
      }
      return result
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

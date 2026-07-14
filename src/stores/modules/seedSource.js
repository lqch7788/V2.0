import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/crop'
import { enhancedApiClient } from '@/lib/apiClient'
import { seedSourceTransferService } from '@/services/seedSourceTransferService'

/**
 * 种源 Pinia Store（V1.1 → V2.0 迁移版）
 * V1.1 源文件：src/stores/useSeedSourceStore.ts
 *
 * V1.1 核心 API（Zustand → Pinia 1:1 迁移）：
 * - items / isLoading / error
 * - loadItems / deleteItems / checkDeletable / endSeedSource / clearError
 */
export const useSeedSourceStore = defineStore('seedSource', () => {
  // 状态
  const items = ref([])
  const isLoading = ref(false)
  const currentItem = ref(null)
  const error = ref(null)

  // 标准化：将后端字段映射为前端需要的格式（V1.1 风格）
  const normalizeItem = (item) => ({
    id: item.id,
    // 种源批号
    seedCode: item.seedCode || item.source_code || '',
    sourceName: item.sourceName || item.source_name || '',
    // 种源类型
    sourceType: item.sourceType || item.source_type || '',
    // 形态
    seedForm: item.seedForm || item.seed_form || '',
    // 来源途径
    sourceOrigin: item.sourceOrigin || item.source_origin || 'external_purchase',
    // 作物类别
    cropCategory: item.cropCategory || item.crop_category || '',
    typeName: item.typeName || item.type_name || '',
    varietyName: item.varietyName || item.variety_name || '',
    cropName: item.cropName || item.crop_name || '',
    cropVariety: item.cropVariety || item.crop_variety || '',
    cropCode: item.cropCode || item.crop_code || '',
    // 供应商
    supplierId: item.supplierId || item.supplier_id || '',
    supplierName: item.supplierName || item.supplier_name || '',
    // 日期
    purchaseDate: item.purchaseDate || item.purchase_date || '',
    // 数量
    quantity: item.quantity || 0,
    unit: item.unit || '',
    unitPrice: item.unitPrice || item.purchase_price || 0,
    totalAmount: item.totalAmount || item.total_amount || 0,
    initialCount: item.initialCount || item.initial_quantity || item.quantity || 0,
    availableCount: item.availableCount || item.remaining_quantity || 0,
    // 状态
    status: item.status || 'sufficient',
    endType: item.endType || item.end_type || '',
    endTime: item.endTime || item.end_time || '',
    // 溯源
    traceabilityCode: item.traceabilityCode || item.traceability_code || '',
    // 备注
    remarks: item.remarks || '',
    // 关联生产计划
    productionPlanCode: item.productionPlanCode || item.production_plan_code || '',
    // 创建信息
    createBy: item.createBy || item.create_by || '',
    createTime: item.createTime || item.create_time || '',
    updateTime: item.updateTime || item.update_time || '',
    // 图片
    pictures: item.pictures || []
  })

  // 兼容后端返回格式
  const unwrapData = (res) => {
    if (Array.isArray(res)) return res
    if (res && typeof res === 'object') {
      if ('success' in res && res.data !== undefined) {
        return Array.isArray(res.data) ? res.data : []
      }
      if ('items' in res) return res.items || []
      if ('data' in res && Array.isArray(res.data)) return res.data
    }
    return []
  }

  // 加载数据
  const loadItems = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.getSeedSourceList()
      const rawItems = unwrapData(res)
      items.value = rawItems.map(normalizeItem)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      console.error('获取种源数据失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 加载详情
  const loadItem = async (id) => {
    try {
      const res = await api.getSeedSourceDetail(id)
      currentItem.value = normalizeItem(res)
      return currentItem.value
    } catch (e) {
      console.error('获取种源详情失败:', e)
      return null
    }
  }

  // 创建
  const addItem = async (data) => {
    try {
      const res = await api.createSeedSource(data)
      const newItem = normalizeItem(res)
      items.value.unshift(newItem)
      return newItem
    } catch (e) {
      console.error('创建种源失败:', e)
      throw e
    }
  }

  // 更新
  const updateItem = async (id, data) => {
    try {
      const res = await api.updateSeedSource(id, data)
      const updated = normalizeItem(res)
      const idx = items.value.findIndex(item => item.id === id)
      if (idx !== -1) items.value[idx] = updated
      return updated
    } catch (e) {
      console.error('更新种源失败:', e)
      throw e
    }
  }

  // 删除单条
  const deleteItem = async (id) => {
    try {
      await api.deleteSeedSource(id)
      items.value = items.value.filter(item => item.id !== id)
      return true
    } catch (e) {
      console.error('删除种源失败:', e)
      return false
    }
  }

  // 批量删除（V1.1 风格）
  const deleteItems = async (ids) => {
    try {
      await api.deleteSeedSources(ids)
      items.value = items.value.filter(item => !ids.includes(item.id))
      return true
    } catch (e) {
      console.error('批量删除种源失败:', e)
      throw e
    }
  }

  /**
   * 引用检查（V1.1 风格）
   * 返回 { deletable: boolean, references: any[] }
   */
  const checkDeletable = async (id) => {
    try {
      const res = await enhancedApiClient.get(`/seed-sources/${id}/check-deletable`)
      return {
        deletable: res?.deletable ?? true,
        references: res?.references || []
      }
    } catch (e) {
      console.error('[checkDeletable] 检查失败:', e)
      throw e
    }
  }

  /**
   * 清除错误（V1.1 风格，UI 提示用）
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 结束种源（V1.1 风格）
   * V1.1: endSeedSource(id, endType)
   */
  const endSeedSource = async (id, endType) => {
    try {
      await enhancedApiClient.put(`/seed-sources/${id}/end`, { endType })
      const idx = items.value.findIndex(item => item.id === id)
      if (idx !== -1) {
        items.value[idx] = {
          ...items.value[idx],
          endType,
          endTime: new Date().toISOString()
        }
      }
      return true
    } catch (e) {
      console.error('[endSeedSource] 结束失败:', e)
      return false
    }
  }

  /**
   * 从调拨创建新种源（V1.1 createFromTransfer）
   * @param {Array} items - 调拨明细
   * @param {Object} operator - { id, name }
   * @returns {Promise<Array<{newSeedSourceId, newSeedSourceCode}>>}
   */
  const createFromTransfer = async (items, operator) => {
    const results = await seedSourceTransferService.createFromTransfer(items, operator)
    // 创建后刷新列表
    await loadItems()
    return results
  }

  return {
    // state
    items,
    isLoading,
    currentItem,
    error,
    // actions
    loadItems,
    loadItem,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    checkDeletable,
    endSeedSource,
    createFromTransfer,
    clearError
  }
})

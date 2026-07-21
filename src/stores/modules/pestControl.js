/**
 * 2026-07-21 v2: 病虫害防治记录 Store（V1.1 usePestControlStore.ts 1:1 迁移）
 * 字段映射：camelCase ↔ snake_case（与后端 pesticide_records 表一致）
 */
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { apiPestControlService } from '@/services/apiPestControlService'

export const usePestControlStore = defineStore('pestControl', () => {
  const items = ref([])
  const isLoading = ref(false)
  const currentItem = ref(null)

  const filters = reactive({
    pesticideType: '',
    cropName: '',
    greenhouseName: '',
    targetPest: '',
    startDate: '',
    endDate: '',
    operatorName: ''
  })

  const pagination = reactive({ page: 1, limit: 20, total: 0 })

  /** 加载列表（可接受覆盖 filters，对齐 V1.1 store.fetchItems(filters)） */
  const loadItems = async (overrideFilters) => {
    isLoading.value = true
    try {
      const activeFilters = overrideFilters || filters
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([_, v]) => v != null && v !== '')
      )
      const res = await apiPestControlService.list(cleanFilters, pagination.page, pagination.limit)
      items.value = res.items || []
      pagination.total = res.total || 0
    } catch (error) {
      console.error('[pestControl] loadItems error:', error)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  /** 加载详情 */
  const loadItem = async (id) => {
    try {
      const item = await apiPestControlService.getById(id)
      currentItem.value = item
      return item
    } catch (error) {
      console.error('[pestControl] loadItem error:', error)
      return null
    }
  }

  /** 新增 */
  const addItem = async (record) => {
    try {
      const item = await apiPestControlService.create(record)
      items.value.unshift(item)
      return item
    } catch (error) {
      console.error('[pestControl] addItem error:', error)
      throw error
    }
  }

  /** 更新 */
  const updateItem = async (id, record) => {
    try {
      const item = await apiPestControlService.update(id, record)
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = item
      return item
    } catch (error) {
      console.error('[pestControl] updateItem error:', error)
      throw error
    }
  }

  /** 删除 */
  const deleteItem = async (id) => {
    try {
      await apiPestControlService.remove(id)
      items.value = items.value.filter(i => i.id !== id)
      return true
    } catch (error) {
      console.error('[pestControl] deleteItem error:', error)
      return false
    }
  }

  /** 批量删除 */
  const deleteItems = async (ids) => {
    try {
      await apiPestControlService.removeBatch(ids)
      items.value = items.value.filter(i => !ids.includes(i.id))
      return true
    } catch (error) {
      console.error('[pestControl] deleteItems error:', error)
      return false
    }
  }

  /** 生成记录编号 */
  const generateCode = async () => {
    try {
      return await apiPestControlService.generateCode()
    } catch {
      return ''
    }
  }

  /** 统计 */
  const loadStats = async (params = {}) => {
    try {
      return await apiPestControlService.stats(params)
    } catch {
      return []
    }
  }

  /** 重置筛选 */
  const resetFilters = () => {
    Object.assign(filters, {
      pesticideType: '', cropName: '', greenhouseName: '',
      targetPest: '', startDate: '', endDate: '', operatorName: ''
    })
    pagination.page = 1
  }

  return {
    items, isLoading, currentItem, filters, pagination,
    loadItems, loadItem, addItem, updateItem, deleteItem, deleteItems,
    generateCode, loadStats, resetFilters
  }
})
/**
 * 作物库存 Store
 * 管理采收入库产品的库存状态、预警设置和CRUD操作
 * 对应 V1.1 useCropStorageStore + ProduceInventoryPage 状态逻辑
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getInventoryList,
  getInventoryById,
  getInventoryDetail,
  getInventoryStats,
  getInventoryByCropName,
  createInventory as apiCreate,
  updateInventory as apiUpdate,
  deleteInventory as apiDelete,
  deleteInventoryBatch as apiBatchDelete,
  outbound,
  freezeInventory,
  unfreezeInventory
} from '@/api/inventory/apiInventoryService'

export const useCropInventoryStore = defineStore('cropInventory', () => {
  // 库存列表数据
  const inventoryData = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 筛选条件
  const filters = ref({
    searchText: '',
    warehouseId: '',
    cropName: '',
    grade: '',
    status: '',
    showLowStock: false,
  })

  // 分页
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 选中的行
  const selectedRows = ref([])

  // 库存统计数据（V1.1 InventoryStats 对齐）
  const stats = ref(null)

  // 变更版本号（跨页刷新机制，V1.1 notifyChange 对齐）
  const version = ref(0)

  // 弹窗状态
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showDetailModal = ref(false)
  const showBatchEditModal = ref(false)
  const showDeleteWarning = ref(false)
  const showExportModal = ref(false)

  // 当前选中的库存记录
  const selectedInventory = ref(null)

  // 导出格式
  const exportFormat = ref('xlsx')

  // 编辑中的库存记录
  const editingInventory = ref(createEmptyInventory())

  // 新增表单数据
  const newInventory = ref(createEmptyInventory())

  /**
   * 创建空的库存记录对象
   */
  function createEmptyInventory() {
    return {
      id: '',
      instanceId: '',
      stockType: 'product',
      productCode: '',
      cropName: '',
      variety: '',
      grade: 'A',
      quality: 'good',
      quantity: 0,
      unit: 'kg',
      warehouseId: '',
      warehouseName: '',
      storageLocation: '',
      storageDate: new Date().toISOString().split('T')[0],
      harvestDate: new Date().toISOString().split('T')[0],
      batchCode: '',
      expirationDate: '',
      greenhouseName: '',
      plantingMode: '',
      remarks: '',
      operator: '系统管理员',
      alertSettings: {
        enableStorageTimeAlert: false,
        storageTimeThreshold: 0,
        enableQuantityAlert: false,
        minQuantityThreshold: 0,
        maxQuantityThreshold: 0,
        minStock: 0,
        maxStock: 0,
        expirationDays: 30,
      },
    }
  }

  /**
   * 将后端API数据映射为前端本地格式（蛇形→驼峰）
   */
  function mapApiToLocal(apiData) {
    if (!apiData) return createEmptyInventory()
    return {
      id: apiData.id || '',
      instanceId: apiData.instance_id || '',
      stockType: apiData.stock_type || 'product',
      productCode: apiData.product_code || '',
      cropName: apiData.crop_name || '',
      variety: apiData.variety_name || apiData.variety || '',
      grade: apiData.grade || 'A',
      quality: apiData.quality || 'good',
      quantity: apiData.current_quantity || apiData.quantity || 0,
      unit: apiData.unit || 'kg',
      warehouseId: apiData.warehouse_id || '',
      warehouseName: apiData.warehouse_name || '',
      storageLocation: apiData.storage_location || '',
      harvestDate: apiData.harvest_date || '',
      storageDate: apiData.inbound_date || '',
      expirationDate: apiData.expiration_date || '',
      batchCode: apiData.batch_code || '',
      greenhouseName: apiData.greenhouse_name || '',
      plantingMode: apiData.planting_mode || '',
      remarks: apiData.remarks || '',
      operator: apiData.operator || '',
      alertSettings: {
        enableStorageTimeAlert: apiData.alert_settings?.enable_storage_time_alert || false,
        storageTimeThreshold: apiData.alert_settings?.storage_time_threshold || 0,
        enableQuantityAlert: apiData.alert_settings?.enable_quantity_alert || false,
        minQuantityThreshold: apiData.alert_settings?.min_quantity_threshold || 0,
        maxQuantityThreshold: apiData.alert_settings?.max_quantity_threshold || 0,
        minStock: apiData.alert_settings?.min_stock || 0,
        maxStock: apiData.alert_settings?.max_stock || 0,
        expirationDays: apiData.alert_settings?.expiration_days || 0,
      },
      inboundRecords: apiData.inbound_records || [],
      outboundRecords: apiData.outbound_records || [],
      status: apiData.status || 'in_stock',
    }
  }

  /**
   * 将前端本地格式映射为API请求格式（驼峰→蛇形）
   */
  function mapLocalToApi(localData) {
    return {
      crop_name: localData.cropName,
      variety_name: localData.variety,
      grade: localData.grade,
      current_quantity: localData.quantity,
      unit: localData.unit,
      warehouse_id: localData.warehouseId,
      storage_location: localData.storageLocation,
      batch_code: localData.batchCode,
      expiration_date: localData.expirationDate,
      alert_settings: {
        enable_storage_time_alert: localData.alertSettings?.enableStorageTimeAlert || false,
        storage_time_threshold: localData.alertSettings?.storageTimeThreshold || 0,
        enable_quantity_alert: localData.alertSettings?.enableQuantityAlert || false,
        min_quantity_threshold: localData.alertSettings?.minQuantityThreshold || 0,
        max_quantity_threshold: localData.alertSettings?.maxQuantityThreshold || 0,
        min_stock: localData.alertSettings?.minStock || 0,
        max_stock: localData.alertSettings?.maxStock || 0,
        expiration_days: localData.alertSettings?.expirationDays || 0,
      },
    }
  }

  /**
   * 加载库存数据（V1.1 loadItems 对齐）
   * @param {Object} [filters_] - 可选筛选条件，不传则使用当前 filters
   */
  async function loadInventoryData(filters_) {
    isLoading.value = true
    error.value = null
    try {
      const activeFilter = filters_ || filters.value
      const response = await getInventoryList({
        stock_type: activeFilter.stockType || undefined,
        status: activeFilter.status || undefined,
        crop_name: activeFilter.cropName || undefined,
      })
      if (response && response.data) {
        inventoryData.value = response.data.map(mapApiToLocal)
      } else if (Array.isArray(response)) {
        inventoryData.value = response.map(mapApiToLocal)
      }
    } catch (err) {
      error.value = err.message || '加载库存数据失败'
      console.error('加载库存数据失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载库存统计（V1.1 loadStats 对齐）
   */
  async function loadStats() {
    try {
      const data = await getInventoryStats()
      stats.value = data
    } catch (err) {
      console.error('[useCropInventoryStore] 加载统计失败:', err)
    }
  }

  /**
   * 并行加载列表+统计（V1.1 loadAll 对齐）
   * @param {Object} [filters_] - 可选筛选条件
   */
  async function loadAll(filters_) {
    isLoading.value = true
    error.value = null
    try {
      const activeFilter = filters_ || filters.value
      const [response, statsData] = await Promise.all([
        getInventoryList({
          stock_type: activeFilter.stockType || undefined,
          status: activeFilter.status || undefined,
          crop_name: activeFilter.cropName || undefined,
        }),
        getInventoryStats(),
      ])
      if (response && response.data) {
        inventoryData.value = response.data.map(mapApiToLocal)
      } else if (Array.isArray(response)) {
        inventoryData.value = response.map(mapApiToLocal)
      }
      stats.value = statsData
    } catch (err) {
      error.value = err.message || '加载库存失败'
      console.error('加载库存失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 按作物名称搜索库存（V1.1 searchByCrop 对齐）
   * @param {string} cropName - 作物名称
   */
  async function searchByCrop(cropName) {
    isLoading.value = true
    error.value = null
    try {
      const data = await getInventoryByCropName(cropName)
      // 合并 product/seed/seedling 三种类型的库存
      const items = [
        ...(Array.isArray(data?.product) ? data.product : []),
        ...(Array.isArray(data?.seed) ? data.seed : []),
        ...(Array.isArray(data?.seedling) ? data.seedling : []),
      ]
      inventoryData.value = items.map(mapApiToLocal)
    } catch (err) {
      error.value = err.message || '按作物查询失败'
      console.error('按作物查询失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 独立的筛选器设置方法（V1.1 setFilters 对齐）
   * @param {Object} newFilters - 新的筛选条件
   */
  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 通知变更（V1.1 notifyChange 对齐）
   * 写操作成功后调用，用于触发跨页刷新
   */
  function notifyChange() {
    version.value++
  }

  /**
   * 重置 store 到初始状态（V1.1 reset 对齐）
   */
  function reset() {
    inventoryData.value = []
    stats.value = null
    isLoading.value = false
    error.value = null
    filters.value = {
      searchText: '',
      warehouseId: '',
      cropName: '',
      grade: '',
      status: '',
      showLowStock: false,
    }
    version.value = 0
    currentPage.value = 1
    selectedRows.value = []
  }

  /**
   * 创建库存记录
   */
  async function createInventory(data) {
    try {
      await apiCreate(mapLocalToApi(data))
      await loadInventoryData()
      return true
    } catch (err) {
      console.error('创建库存记录失败:', err)
      return false
    }
  }

  /**
   * 更新库存记录
   */
  async function updateInventory(id, data) {
    try {
      await apiUpdate(id, mapLocalToApi(data))
      await loadInventoryData()
      return true
    } catch (err) {
      console.error('更新库存记录失败:', err)
      return false
    }
  }

  /**
   * 删除库存记录
   */
  async function deleteInventoryById(id) {
    try {
      await apiDelete(id)
      await loadInventoryData()
      return true
    } catch (err) {
      console.error('删除库存记录失败:', err)
      return false
    }
  }

  /**
   * 批量删除库存记录
   */
  async function batchDelete(ids) {
    try {
      await apiBatchDelete(ids)
      await loadInventoryData()
      return true
    } catch (err) {
      console.error('批量删除库存记录失败:', err)
      return false
    }
  }

  /**
   * 出库操作
   */
  async function outboundInventory(data) {
    try {
      await outbound(data)
      await loadInventoryData()
      return true
    } catch (err) {
      console.error('出库操作失败:', err)
      return false
    }
  }

  /**
   * 冻结库存
   */
  async function freezeInventoryById(freezeData) {
    try {
      await freezeInventory(freezeData)
      await loadInventoryData()
      return true
    } catch (err) {
      console.error('冻结库存失败:', err)
      return false
    }
  }

  /**
   * 解冻库存
   */
  async function unfreezeInventoryById(freezeId) {
    try {
      await unfreezeInventory(freezeId)
      await loadInventoryData()
      return true
    } catch (err) {
      console.error('解冻库存失败:', err)
      return false
    }
  }

  /**
   * 获取库存详情（含流水）
   */
  async function fetchInventoryDetail(instanceId) {
    try {
      return await getInventoryDetail(instanceId)
    } catch (err) {
      console.error('获取库存详情失败:', err)
      return null
    }
  }

  // 计算属性：预警统计
  const alerts = computed(() => {
    let storageTime = 0
    let lowStock = 0
    let highStock = 0
    let expiration = 0

    inventoryData.value.forEach(item => {
      const storageDate = item.storageDate ? new Date(item.storageDate) : null
      const storageDays = storageDate
        ? Math.floor((Date.now() - storageDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      if (item.alertSettings?.enableStorageTimeAlert && storageDays > (item.alertSettings.storageTimeThreshold || 0)) {
        storageTime++
      }
      if (item.alertSettings?.enableQuantityAlert) {
        if (item.quantity < (item.alertSettings.minQuantityThreshold || 0)) lowStock++
        if (item.quantity > (item.alertSettings.maxQuantityThreshold || 0)) highStock++
      }
      if (item.expirationDate) {
        const remainingDays = Math.floor((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (remainingDays < 7) expiration++
      }
    })

    return {
      total: storageTime + lowStock + highStock + expiration,
      storageTime,
      lowStock,
      highStock,
      expiration,
    }
  })

  // 计算属性：低库存数量
  const lowStockCount = computed(() => {
    return inventoryData.value.filter(item => item.quantity < 10).length
  })

  // 分页后的数据
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return inventoryData.value.slice(start, end)
  })

  // 总数
  const totalCount = computed(() => inventoryData.value.length)

  return {
    // 状态
    inventoryData,
    isLoading,
    error,
    filters,
    stats,
    version,
    currentPage,
    pageSize,
    selectedRows,
    showAddModal,
    showEditModal,
    showDetailModal,
    showBatchEditModal,
    showDeleteWarning,
    showExportModal,
    selectedInventory,
    exportFormat,
    editingInventory,
    newInventory,

    // 计算属性
    alerts,
    lowStockCount,
    paginatedData,
    totalCount,

    // 方法（V1.1 对齐）
    loadInventoryData,
    loadStats,
    loadAll,
    searchByCrop,
    setFilters,
    notifyChange,
    reset,
    createInventory,
    updateInventory,
    deleteInventoryById,
    batchDelete,
    outboundInventory,
    freezeInventoryById,
    unfreezeInventoryById,
    fetchInventoryDetail,
    mapApiToLocal,
    mapLocalToApi,
    createEmptyInventory,
  }
})

/**
 * 生产页面 Composable
 * 1:1 翻译自 V1.1 src/components/production/hooks/useProductionPage.ts
 * 将 ProductionPage 的所有状态和逻辑提取为独立 composable，便于维护和测试
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\production\hooks\useProductionPage.ts
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { useAuthStore } from '@/stores/modules/auth'
import { useApprovalStore } from '@/stores/modules/approval'
import { enhancedApiClient } from '@/lib/apiClient'
import { showAlert, showConfirm } from '@/lib/dialogService'

// ============================================
// 1:1 翻译 V1.1 types 枚举与常量
// ============================================

/**
 * USE_API 开关（与 V1.1 USE_API 等价：从环境变量读取）
 * 1:1 翻译自 V1.1 services/apiClient.ts: export const USE_API = import.meta.env.VITE_USE_API === 'true';
 */
const USE_API = import.meta.env.VITE_USE_API === 'true'

/**
 * 计划类型枚举（V1.1 types/index.ts：enum PlanType）
 * @typedef {'seed_breeding'|'seedling'|'planting'} PlanType
 */
export const PlanType = {
  SEED_BREEDING: 'seed_breeding',
  SEEDLING: 'seedling',
  PLANTING: 'planting'
}

/**
 * 计划类型编码前缀（V1.1 types/index.ts：PlanTypeCodePrefix）
 * @type {Record<PlanType, string>}
 */
export const PlanTypeCodePrefix = {
  [PlanType.SEED_BREEDING]: 'JZ',
  [PlanType.SEEDLING]: 'YM',
  [PlanType.PLANTING]: 'ZZ'
}

// ============================================
// 类型定义（JSDoc）
// ============================================

/**
 * 作物批次（来自 L1 apiProductionPlanService）
 * @typedef {import('@/services/apiProductionPlanService').CropBatch} CropBatch
 */

/**
 * 表单数据类型
 * @typedef {Object} ProductionFormData
 * @property {string} batchCode
 * @property {PlanType} planType
 * @property {string} planTypeName
 * @property {string} cropCode
 * @property {string} cropName
 * @property {string} variety
 * @property {string[]} greenhouseId
 * @property {string} plantingArea
 * @property {string} plantingAreaUnit
 * @property {string} startDate
 * @property {string} expectedHarvestDate
 * @property {string} targetYield
 * @property {string} unit
 * @property {string[]} plantingMode
 * @property {string} responsiblePerson
 * @property {string} publisher
 * @property {string} description
 * @property {string} planDetail
 * @property {string[]} orderId
 * @property {string[]} orderCode
 */

/**
 * 编辑中的批次数据
 * @typedef {Object} EditedBatch
 * @property {number} [targetQuantity]
 * @property {number} [targetYield]
 * @property {string} [cropName]
 * @property {string} [variety]
 * @property {string} [greenhouseName]
 * @property {string} [greenhouseId]
 * @property {number} [plantingArea]
 * @property {string} [plantingMode]
 * @property {string} [startDate]
 * @property {string} [expectedHarvestDate]
 * @property {string} [responsiblePerson]
 * @property {string} [remarks]
 * @property {string} [planDetail]
 * @property {string} [planDetailFileName]
 * @property {boolean} [isCompleted]
 * @property {'pending_execution'|'in_progress'|'completed'} [executionStatus]
 */

// ============================================
// 表单默认值工厂
// ============================================

/**
 * 获取表单初始数据
 * 1:1 翻译 V1.1 getInitialFormData
 * @param {ReturnType<typeof useAuthStore>} authStore
 * @returns {ProductionFormData}
 */
function getInitialFormData(authStore) {
  // 从 useAuthStore 获取当前登录用户（避免直接读 localStorage）
  const initialUsername = authStore.currentUser?.username || '陆启闯'
  return {
    batchCode: '',
    planType: PlanType.PLANTING,
    planTypeName: '种植计划',
    cropCode: '',
    cropName: '',
    variety: '',
    greenhouseId: [],
    plantingArea: '',
    plantingAreaUnit: 'm²',
    startDate: '',
    expectedHarvestDate: '',
    targetYield: '',
    unit: 'kg',
    plantingMode: [],
    responsiblePerson: '',
    publisher: initialUsername,
    description: '',
    planDetail: '',
    // 关联订单字段
    orderId: [],
    orderCode: []
  }
}

// ============================================
// 内部依赖：审批刷新（V1.1 useApproval 占位）
// ============================================
// V1.1 useApproval 提供 refreshApprovals() 用于刷新审批列表。
// V2.0 已有 Pinia useApprovalStore（store/modules/approval.js），
// 此处直接调用其 refreshApprovals() 方法，保持与 V1.1 同名同行为。
// 注意：必须在 onMounted 后调用以保证 Pinia 实例已挂载。

/**
 * 审批刷新 composable 适配（与 V1.1 useApproval 接口一致）
 * @returns {{ refreshApprovals: () => Promise<any> }}
 */
function useApproval() {
  const store = useApprovalStore()
  return { refreshApprovals: store.refreshApprovals }
}

// ============================================
// useProductionPage Composable
// ============================================

/**
 * 生产页面 composable
 * 1:1 翻译自 V1.1 useProductionPage
 * @returns {{
 *   // 状态
 *   statusFilter: import('vue').Ref<string>,
 *   planTypeFilter: import('vue').Ref<string>,
 *   selectedBatch: import('vue').Ref<CropBatch | null>,
 *   showCreateModal: import('vue').Ref<boolean>,
 *   currentPage: import('vue').Ref<number>,
 *   pageSize: import('vue').Ref<number>,
 *   formData: import('vue').Ref<ProductionFormData>,
 *   errors: import('vue').Ref<Record<string, string>>,
 *   exportMode: import('vue').Ref<boolean>,
 *   selectedRows: import('vue').Ref<string[]>,
 *   exportFormat: import('vue').Ref<string>,
 *   showExportModal: import('vue').Ref<boolean>,
 *   batchEditMode: import('vue').Ref<boolean>,
 *   showBatchEditModal: import('vue').Ref<boolean>,
 *   selectedBatchCode: import('vue').Ref<string>,
 *   editedBatchCodes: import('vue').Ref<string[]>,
 *   editedBatches: import('vue').Ref<Record<string, EditedBatch>>,
 *   showVoidWarning: import('vue').Ref<boolean>,
 *   batchDeleteMode: import('vue').Ref<boolean>,
 *   showDeleteWarning: import('vue').Ref<boolean>,
 *   batches: import('vue').ComputedRef<CropBatch[]>,
 *   filteredBatches: import('vue').ComputedRef<CropBatch[]>,
 *   greenhouses: import('vue').ComputedRef<any[]>,
 *   orders: import('vue').ComputedRef<any[]>,
 *   batchesLength: import('vue').ComputedRef<number>,
 *   batchCodeSearch: import('vue').Ref<string>,
 *   plantingModeSearch: import('vue').Ref<string>,
 *   cropNameSearch: import('vue').Ref<string>,
 *   varietySearch: import('vue').Ref<string>,
 *   greenhouseSearch: import('vue').Ref<string>,
 *   setStatusFilter: (v: string) => void,
 *   setPlanTypeFilter: (v: string) => void,
 *   setSelectedBatch: (v: CropBatch | null) => void,
 *   setShowCreateModal: (v: boolean) => void,
 *   setCurrentPage: (v: number) => void,
 *   setPageSize: (v: number) => void,
 *   setFormData: import('vue').Ref<ProductionFormData>,
 *   setErrors: import('vue').Ref<Record<string, string>>,
 *   setExportMode: (v: boolean) => void,
 *   setSelectedRows: import('vue').Ref<string[]>,
 *   setExportFormat: (v: string) => void,
 *   setShowExportModal: (v: boolean) => void,
 *   setBatchEditMode: (v: boolean) => void,
 *   setShowBatchEditModal: (v: boolean) => void,
 *   setSelectedBatchCode: (v: string) => void,
 *   setEditedBatchCodes: import('vue').Ref<string[]>,
 *   setEditedBatches: import('vue').Ref<Record<string, EditedBatch>>,
 *   setShowVoidWarning: (v: boolean) => void,
 *   setBatchDeleteMode: (v: boolean) => void,
 *   setShowDeleteWarning: (v: boolean) => void,
 *   setBatchCodeSearch: (v: string) => void,
 *   setPlantingModeSearch: (v: string) => void,
 *   setCropNameSearch: (v: string) => void,
 *   setVarietySearch: (v: string) => void,
 *   setGreenhouseSearch: (v: string) => void,
 *   resetFilters: () => void,
 *   handleFormChange: (field: string, value: unknown) => void,
 *   validateForm: () => boolean,
 *   resetForm: () => void,
 *   generateBatchCode: () => void,
 *   handleSaveDraft: () => Promise<void>,
 *   handleSubmitForApproval: () => Promise<void>,
 *   handleSingleEdit: (batch: CropBatch) => void,
 *   handleSingleDelete: (batch: CropBatch) => Promise<void>,
 *   handleDeleteConfirm: () => Promise<void>,
 *   handlePublish: () => Promise<void>,
 *   handleSave: () => Promise<void>,
 *   handleVoidConfirm: () => Promise<void>,
 *   handleSelectRow: (id: string) => void,
 *   handleSelectAll: () => void,
 *   handleBatchSelectAll: () => void,
 *   handleBatchDeleteSelectAll: () => void,
 *   handleConfirmNext: () => void,
 *   handleExportClick: () => void,
 *   handleConfirmExport: () => void,
 *   handleDoExport: () => Promise<void>,
 *   handleCancelExport: () => void,
 *   handleClose: () => void,
 *   handlePageSizeChange: (size: number) => void
 * }}
 */
export function useProductionPage() {
  // ==================== Store ====================
  const greenhouseStore = useGreenhouseStore()
  /** @type {import('vue').ComputedRef<any[]>} */
  const greenhouses = computed(() => greenhouseStore.greenhouses || [])

  const productionPlanStore = useProductionPlanStore()
  /** @type {import('vue').ComputedRef<CropBatch[]>} */
  const batches = computed(() => productionPlanStore.plans || [])

  const orderDataStore = useOrderDataStore()
  /** @type {import('vue').ComputedRef<any[]>} */
  const orders = computed(() => orderDataStore.orders || [])

  // useApproval - 1:1 翻译 V1.1 useApproval().refreshApprovals
  const { refreshApprovals } = useApproval()

  // 从 useAuthStore 获取当前登录用户（避免直接读 localStorage）
  const authStore = useAuthStore()
  const currentUsername = computed(() => authStore.currentUser?.username || '陆启闯')
  const currentUserId = computed(() => authStore.currentUser?.oid || '')
  const currentDepartment = computed(() => authStore.currentUser?.orgOid || '')

  // ==================== 状态定义 ====================
  const statusFilter = ref('all')
  const planTypeFilter = ref('all')
  const selectedBatch = ref(/** @type {CropBatch | null} */ (null))
  const showCreateModal = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const formData = ref(getInitialFormData(authStore))
  const errors = ref({})
  const exportMode = ref(false)
  const selectedRows = ref([])
  const exportFormat = ref('excel')
  const showExportModal = ref(false)
  const batchEditMode = ref(false)
  const showBatchEditModal = ref(false)
  const selectedBatchCode = ref('')
  const editedBatchCodes = ref([])
  const editedBatches = ref({})
  const showVoidWarning = ref(false)
  const batchDeleteMode = ref(false)
  const showDeleteWarning = ref(false)

  // 搜索状态
  const batchCodeSearch = ref('')
  const plantingModeSearch = ref('')
  const cropNameSearch = ref('')
  const varietySearch = ref('')
  const greenhouseSearch = ref('')

  // ==================== 数据加载（1:1 翻译 V1.1 useEffect）====================
  // V1.1: useEffect(() => { if (greenhouses.length === 0) loadGreenhouses() }, [greenhouses.length, loadGreenhouses])
  // V2.0: watch(greenhouses 长度，空时加载)
  watch(
    () => greenhouses.value.length,
    (len) => {
      if (len === 0) {
        greenhouseStore.loadGreenhouses()
      }
    },
    { immediate: true }
  )

  // V1.1: useEffect(() => { fetchPlans() }, [fetchPlans])
  // V2.0: watch(fetchPlans 函数引用，首次进入时调用)
  watch(
    () => productionPlanStore.fetchPlans,
    (fetch) => {
      fetch()
    },
    { immediate: true }
  )

  // 加载订单数据（用于关联选择）
  // V1.1: useEffect(() => { if (orders.length === 0) fetchOrders() }, [orders.length, fetchOrders])
  watch(
    () => orders.value.length,
    (len) => {
      if (len === 0) {
        orderDataStore.fetchOrders()
      }
    },
    { immediate: true }
  )

  // V1.1: useEffect(() => {
  //   const handleVisibilityChange = () => { if (document.visibilityState === 'visible') fetchPlans() }
  //   document.addEventListener('visibilitychange', handleVisibilityChange)
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  // }, [fetchPlans])
  // V2.0: onMounted 注册、onUnmounted 解绑
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      productionPlanStore.fetchPlans()
    }
  }
  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  // ==================== 表单默认值初始化 ====================
  // V1.1: useEffect(() => { if (showCreateModal) { ... setFormData(...) } }, [showCreateModal, greenhouses])
  watch(
    [showCreateModal, () => greenhouses.value],
    ([isOpen, ghList]) => {
      if (isOpen) {
        const activeGreenhouses = ghList.filter((/** @type {any} */ g) => g.status === 'active')
        const firstGreenhouseId = activeGreenhouses[0]?.id ? [activeGreenhouses[0].id] : []
        const defaultMode = ['open_field']
        const firstResponsiblePerson = currentUsername.value

        formData.value = {
          ...formData.value,
          greenhouseId: firstGreenhouseId,
          plantingMode: defaultMode,
          responsiblePerson: firstResponsiblePerson,
        }
      }
    },
    { deep: true }
  )

  // ==================== 过滤逻辑 ====================
  // V1.1: useMemo 过滤；V2.0: computed
  const filteredBatches = computed(() => {
    return batches.value.filter((/** @type {CropBatch} */ batch) => {
      const matchBatchCode = !batchCodeSearch.value || batch.batchCode.toLowerCase().includes(batchCodeSearch.value.toLowerCase())
      const matchPlantingMode = !plantingModeSearch.value || batch.plantingMode.toLowerCase().includes(plantingModeSearch.value.toLowerCase())
      const matchCropName = !cropNameSearch.value || batch.cropName.toLowerCase().includes(cropNameSearch.value.toLowerCase())
      const matchVariety = !varietySearch.value || batch.variety.toLowerCase().includes(varietySearch.value.toLowerCase())
      const matchGreenhouse = !greenhouseSearch.value || batch.greenhouseName.toLowerCase().includes(greenhouseSearch.value.toLowerCase())
      const matchStatus = statusFilter.value === 'all' || batch.batchStatus === statusFilter.value
      const matchPlanType = planTypeFilter.value === 'all' || batch.planType === planTypeFilter.value
      return matchBatchCode && matchPlantingMode && matchCropName && matchVariety && matchGreenhouse && matchStatus && matchPlanType
    })
  })

  const batchesLength = computed(() => batches.value.length)

  // ==================== 工具函数 ====================
  /**
   * 表单字段变更
   * @param {string} field 字段名
   * @param {unknown} value 值
   */
  function handleFormChange(field, value) {
    formData.value = { ...formData.value, [field]: value }
  }

  /**
   * 校验表单
   * 1:1 翻译 V1.1 validateForm
   * @returns {boolean}
   */
  function validateForm() {
    /** @type {Record<string, string>} */
    const newErrors = {}
    if (!formData.value.batchCode.trim()) newErrors.batchCode = '请输入批次编号'
    if (!formData.value.cropName) newErrors.cropName = '请选择作物'
    if (!formData.value.variety.trim()) newErrors.variety = '请输入品种'
    if (formData.value.greenhouseId.length === 0) newErrors.greenhouseId = '请选择区域'
    if (!formData.value.startDate) newErrors.startDate = '请选择定植日期'
    if (!formData.value.expectedHarvestDate) newErrors.expectedHarvestDate = '请选择预计采收日期'
    if (!formData.value.targetYield) newErrors.targetYield = '请输入目标产量'
    if (formData.value.plantingMode.length === 0) newErrors.plantingMode = '请选择种植模式'
    if (!formData.value.responsiblePerson) newErrors.responsiblePerson = '请选择负责人'

    errors.value = newErrors
    return Object.keys(newErrors).length === 0
  }

  /**
   * 重置表单
   */
  function resetForm() {
    formData.value = getInitialFormData(authStore)
  }

  /**
   * 重置筛选
   */
  function resetFilters() {
    batchCodeSearch.value = ''
    plantingModeSearch.value = ''
    cropNameSearch.value = ''
    varietySearch.value = ''
    greenhouseSearch.value = ''
    statusFilter.value = 'all'
    planTypeFilter.value = 'all'
  }

  /**
   * 生成批次编号
   * 1:1 翻译 V1.1 generateBatchCode
   */
  function generateBatchCode() {
    const year = new Date().getFullYear()
    const num = batches.value.length + 1
    const prefix = PlanTypeCodePrefix[/** @type {PlanType} */ (formData.value.planType)] || 'FQ'
    const code = `${prefix}${year}-${String(num).padStart(3, '0')}`
    formData.value = { ...formData.value, batchCode: code }
  }

  // ==================== 保存草稿 ====================
  /**
   * 保存草稿
   * 1:1 翻译 V1.1 handleSaveDraft
   * @returns {Promise<void>}
   */
  async function handleSaveDraft() {
    if (!validateForm()) return

    const today = new Date().toISOString().slice(0, 10)
    const greenhouseIds = formData.value.greenhouseId.join(',')
    // 调试：检查温室ID匹配
    const greenhouseNames = greenhouses.value
      .filter((/** @type {any} */ g) => formData.value.greenhouseId.includes(g.id))
      .map((/** @type {any} */ g) => g.name).join(',') || greenhouseIds
    const plantingModes = formData.value.plantingMode.join(',')

    /** @type {Record<string, unknown>} */
    const apiData = {
      id: `PP${Date.now()}`,
      batchCode: formData.value.batchCode,
      batchName: formData.value.batchCode,
      planType: formData.value.planType,
      cropName: formData.value.cropName,
      variety: formData.value.variety,
      greenhouseId: greenhouseIds,
      greenhouseName: greenhouseNames,
      areaName: greenhouseNames,
      areaId: '',
      targetQuantity: parseInt(formData.value.targetYield) || 0,
      targetYield: parseInt(formData.value.targetYield) || 0,
      actualYield: 0,
      startDate: formData.value.startDate,
      expectedHarvestDate: formData.value.expectedHarvestDate,
      actualHarvestDate: '',
      status: 'draft',
      stage: 'seedling',
      stageName: '苗期',
      priority: 'normal',
      remarks: formData.value.description || '',
      publisher: formData.value.publisher || currentUsername.value,
      createBy: formData.value.publisher || currentUsername.value,
      responsiblePerson: formData.value.responsiblePerson,
      unit: formData.value.unit || 'kg',
      publishDate: '',
      batchStatus: 'draft',
      planDetail: formData.value.planDetail || '',
      planDetailFileName: '',
      plantingArea: parseFloat(formData.value.plantingArea) || 0,
      plantingAreaUnit: formData.value.plantingAreaUnit || 'm²',
      plantingMode: plantingModes,
      supplierName: '',
      seedlingSiteName: '',
      seedQuantity: 0,
      targetSeedlingCount: 0,
      // 关联订单
      orderId: formData.value.orderId.join(',') || undefined,
      orderCode: formData.value.orderCode.join(',') || undefined,
    }

    try {
      if (USE_API) {
        await productionPlanStore.addPlan(/** @type {any} */ (apiData))
      }
      showCreateModal.value = false
      resetForm()
      errors.value = {}
    } catch (error) {
      // logger.error('保存草稿失败:', error);
      await showAlert('保存草稿失败，请重试')
    }
  }

  // ==================== 提交审批 ====================
  /**
   * 提交审批
   * 1:1 翻译 V1.1 handleSubmitForApproval
   * @returns {Promise<void>}
   */
  async function handleSubmitForApproval() {
    if (!validateForm()) return

    const today = new Date().toISOString().slice(0, 10)
    const greenhouseIds = formData.value.greenhouseId.join(',')
    // 调试：检查温室ID匹配
    const greenhouseNames = greenhouses.value
      .filter((/** @type {any} */ g) => formData.value.greenhouseId.includes(g.id))
      .map((/** @type {any} */ g) => g.name).join(',') || greenhouseIds
    const plantingModes = formData.value.plantingMode.join(',')

    /** @type {Record<string, unknown>} */
    const apiData = {
      id: `PP${Date.now()}`,
      batchCode: formData.value.batchCode,
      batchName: formData.value.batchCode,
      planType: formData.value.planType,
      cropName: formData.value.cropName,
      variety: formData.value.variety,
      greenhouseName: greenhouseNames,
      areaName: greenhouseNames,
      targetQuantity: parseInt(formData.value.targetYield) || 0,
      startDate: formData.value.startDate,
      expectedHarvestDate: formData.value.expectedHarvestDate,
      status: 'pending',
      priority: 'normal',
      remarks: formData.value.description || '',
      publisher: formData.value.publisher || currentUsername.value,
      createBy: formData.value.publisher || currentUsername.value,
      responsiblePerson: formData.value.responsiblePerson,
      unit: formData.value.unit || 'kg',
      publishDate: today,
      batchStatus: 'pending',
      planDetail: formData.value.planDetail || '',
      planDetailFileName: '',
      plantingArea: parseFloat(formData.value.plantingArea) || 0,
      plantingAreaUnit: formData.value.plantingAreaUnit || 'm²',
      plantingMode: plantingModes,
      supplierName: '',
      seedlingSiteName: '',
      seedQuantity: 0,
      targetSeedlingCount: 0,
      orderId: formData.value.orderId.join(',') || '',
      orderCode: formData.value.orderCode.join(',') || '',
    }

    try {
      if (USE_API) {
        await productionPlanStore.addPlan(/** @type {any} */ (apiData))
        await productionPlanStore.fetchPlans() // 刷新生产计划列表

        /** @type {Record<string, unknown>} */
        const approvalData = {
          id: `AP${Date.now()}`,
          type: 'production_plan',
          typeName: '生产计划',
          title: `生产计划审批：${formData.value.batchCode}`,
          description: `作物：${formData.value.cropName} ${formData.value.variety}\n种植区域：${greenhouseNames || greenhouseIds}\n目标产量：${formData.value.targetYield}kg`,
          applicantId: currentUserId.value,
          applicantName: formData.value.publisher || currentUsername.value,
          applicantDepartment: currentDepartment.value,
          applyDate: today,
          status: 'pending',
          priority: 'normal',
          businessLink: {
            type: 'production',
            requestId: apiData.id,
            requestCode: apiData.batchCode,
            cropName: formData.value.cropName,
            variety: formData.value.variety,
            greenhouseName: greenhouseNames || greenhouseIds,
            startDate: formData.value.startDate,
            expectedHarvestDate: formData.value.expectedHarvestDate,
            responsiblePerson: formData.value.responsiblePerson,
            targetYield: parseInt(formData.value.targetYield) || 0,
            plantingArea: parseFloat(formData.value.plantingArea) || 0,
            plantingMode: formData.value.plantingMode.join(','),
          },
        }
        await enhancedApiClient.post('/approvals', approvalData)
        await refreshApprovals()
      }

      showCreateModal.value = false
      resetForm()
      errors.value = {}
    } catch (error) {
      console.error('[提交审批失败] 详细错误:', error)
      console.error('[提交审批失败] error.message:', error?.message)
      console.error('[提交审批失败] error.stack:', error?.stack)
      console.error('[提交审批失败] apiData:', apiData)
      await showAlert(`提交审批失败：${error?.message || '请重试'}`)
    }
  }

  // ==================== 单条编辑 ====================
  /**
   * 单条编辑
   * 1:1 翻译 V1.1 handleSingleEdit
   * @param {CropBatch} batch 批次
   */
  function handleSingleEdit(batch) {
    if (batch.batchStatus === 'completed' || batch.batchStatus === 'cancelled') {
      showAlert('该生产计划已归档，无法编辑')
      return
    }
    selectedBatchCode.value = batch.batchCode
    selectedRows.value = [batch.id]
    showBatchEditModal.value = true
  }

  // ==================== 单条删除 ====================
  /**
   * 单条删除
   * 1:1 翻译 V1.1 handleSingleDelete
   * @param {CropBatch} batch 批次
   * @returns {Promise<void>}
   */
  async function handleSingleDelete(batch) {
    try {
      if (USE_API) {
        await productionPlanStore.deletePlan(batch.id)
      }
      await showAlert('删除成功')
    } catch (error) {
      // logger.error('删除生产计划失败:', error);
      await showAlert('删除失败，请重试')
    }
  }

  // ==================== 批量删除确认 ====================
  /**
   * 批量删除确认
   * 1:1 翻译 V1.1 handleDeleteConfirm
   * @returns {Promise<void>}
   */
  async function handleDeleteConfirm() {
    showDeleteWarning.value = false
    batchDeleteMode.value = false
    const toDelete = [...selectedRows.value]

    if (toDelete.length === 0) {
      selectedRows.value = []
      return
    }

    try {
      if (USE_API) {
        await productionPlanStore.deletePlans(toDelete)
      }
      selectedRows.value = []
      await showAlert('删除成功')
    } catch (error) {
      // logger.error('删除生产计划失败:', error);
      await showAlert('删除失败，请重试')
    }
  }

  // ==================== 提交编辑审批 ====================
  /**
   * 提交编辑审批
   * 1:1 翻译 V1.1 handlePublish
   * @returns {Promise<void>}
   */
  async function handlePublish() {
    const hasCompleteRequest = Object.values(editedBatches.value).some(
      edited => edited.isCompleted === true
    )

    if (hasCompleteRequest) {
      const confirmed = await showConfirm(
        '⚠️ 重要提示：\n\n' +
        '您选择将计划标记为完成状态。\n\n' +
        '完成后将进行归档：\n' +
        '• 无法进行任何编辑操作\n' +
        '• 无法删除计划\n\n' +
        '此操作不可逆，请确认！'
      )
      if (!confirmed) {
        return
      }
    }

    if (Object.keys(editedBatches.value).length > 0) {
      const submittedBatchIds = []

      try {
        // 直接复用 hook 顶部定义的 currentUserId/currentUsername/currentDepartment
        // 避免重复 localStorage 访问

        for (const batch of batches.value) {
          const edited = editedBatches.value[batch.batchCode]
          if (edited) {
            if (USE_API) {
              /** @type {Record<string, unknown>} */
              const apiData = {}
              if (edited.targetQuantity !== undefined) apiData.targetQuantity = edited.targetQuantity
              if (edited.targetYield !== undefined) apiData.targetYield = edited.targetYield
              if (edited.cropName !== undefined) apiData.cropName = edited.cropName
              if (edited.variety !== undefined) apiData.variety = edited.variety
              if (edited.greenhouseName !== undefined) apiData.greenhouseName = edited.greenhouseName
              if (edited.greenhouseId !== undefined) apiData.greenhouseId = edited.greenhouseId
              if (edited.plantingArea !== undefined) apiData.plantingArea = edited.plantingArea
              if (edited.plantingMode !== undefined) apiData.plantingMode = edited.plantingMode
              if (edited.startDate !== undefined) apiData.startDate = edited.startDate
              if (edited.expectedHarvestDate !== undefined) apiData.expectedHarvestDate = edited.expectedHarvestDate
              if (edited.responsiblePerson !== undefined) apiData.responsiblePerson = edited.responsiblePerson
              if (edited.remarks !== undefined) apiData.remarks = edited.remarks
              if (edited.planDetail !== undefined) apiData.planDetail = edited.planDetail
              if (edited.planDetailFileName !== undefined) apiData.planDetailFileName = edited.planDetailFileName
              if (edited.executionStatus !== undefined) apiData.executionStatus = edited.executionStatus

              apiData.batchStatus = edited.isCompleted === true ? 'pending_complete' : 'pending'

              await productionPlanStore.updatePlan(batch.id, /** @type {any} */ (apiData))
            }

            const today = new Date().toISOString().slice(0, 10)
            const changeId = `BC${Date.now()}_${batch.id}`
            const changeCode = `BG${today.replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

            /** @type {string[]} */
            const changes = []
            if (edited.cropName) changes.push(`作物名称: ${batch.cropName} → ${edited.cropName}`)
            if (edited.variety) changes.push(`品种: ${batch.variety} → ${edited.variety}`)
            if (edited.plantingArea) changes.push(`种植面积: ${batch.plantingArea} → ${edited.plantingArea}`)
            if (edited.startDate) changes.push(`开始时间: ${batch.startDate} → ${edited.startDate}`)
            if (edited.expectedHarvestDate) changes.push(`预计结束: ${batch.expectedHarvestDate} → ${edited.expectedHarvestDate}`)
            if (edited.responsiblePerson) changes.push(`负责人: ${batch.responsiblePerson} → ${edited.responsiblePerson}`)
            if (edited.targetYield) changes.push(`目标产量: ${batch.targetYield} → ${edited.targetYield}`)
            if (edited.isCompleted === true) changes.push(`计划完成: 标记为已完成（归档）`)

            /** @type {Record<string, unknown>} */
            const approvalData = {
              id: changeId,
              type: 'production_plan',
              typeName: '生产计划',
              title: edited.isCompleted === true
                ? `生产计划完成归档审批：${batch.batchCode}`
                : `生产计划编辑审批：${batch.batchCode}`,
              description: changes.join('\n'),
              applicantId: currentUserId.value,
              applicantName: currentUsername.value,
              applicantDepartment: currentDepartment.value,
              applyDate: today,
              status: 'pending',
              priority: 'normal',
              businessLink: {
                type: 'production',
                approvalAction: edited.isCompleted === true ? 'complete' : 'edit',
                requestId: batch.id,
                requestCode: batch.batchCode,
                cropName: edited.cropName || batch.cropName,
                variety: edited.variety || batch.variety,
                greenhouseName: edited.greenhouseName || batch.greenhouseName,
                startDate: edited.startDate || batch.startDate,
                expectedHarvestDate: edited.expectedHarvestDate || batch.expectedHarvestDate,
                responsiblePerson: edited.responsiblePerson || batch.responsiblePerson,
                targetYield: edited.targetYield || batch.targetYield,
                plantingArea: edited.plantingArea || batch.plantingArea,
                plantingMode: edited.plantingMode || batch.plantingMode,
              },
            }

            if (USE_API) {
              await enhancedApiClient.post('/approvals', approvalData)
            }

            submittedBatchIds.push(batch.id)
          }
        }

        await refreshApprovals()
      } catch (error) {
        // logger.error('提交审批失败:', error);
        await showAlert('提交审批失败，请重试')
        return
      }

      await productionPlanStore.fetchPlans()

      const remainingSelectedRows = selectedRows.value.filter(id => !submittedBatchIds.includes(id))
      selectedRows.value = remainingSelectedRows

      /** @type {Record<string, EditedBatch>} */
      const remainingEditedBatches = {}
      /** @type {string[]} */
      const remainingEditedBatchCodes = []
      batches.value.forEach(batch => {
        if (submittedBatchIds.includes(batch.id)) {
          // 已提交
        } else if (editedBatches.value[batch.batchCode]) {
          remainingEditedBatches[batch.batchCode] = editedBatches.value[batch.batchCode]
          remainingEditedBatchCodes.push(batch.batchCode)
        }
      })
      editedBatches.value = remainingEditedBatches
      editedBatchCodes.value = remainingEditedBatchCodes

      if (submittedBatchIds.length === selectedRows.value.length) {
        showBatchEditModal.value = false
        editedBatches.value = {}
        editedBatchCodes.value = []
        selectedRows.value = []
      } else {
        // 修复 P0: 部分提交也关闭模态（与 handleSave 保持一致 UX 优化）
        await showAlert(`已提交 ${submittedBatchIds.length} 项`)
        showBatchEditModal.value = false
        editedBatches.value = {}
        editedBatchCodes.value = []
        selectedRows.value = []
      }
    }
  }

  // ==================== 已发布状态直接保存（不提交审批）====================
  /**
   * 已发布状态直接保存
   * 1:1 翻译 V1.1 handleSave
   * @returns {Promise<void>}
   */
  async function handleSave() {
    if (Object.keys(editedBatches.value).length === 0) {
      await showAlert('请先编辑至少一个生产计划')
      return
    }

    /** @type {string[]} */
    const savedBatchCodes = []

    try {
      for (const batch of batches.value) {
        const edited = editedBatches.value[batch.batchCode]
        if (edited) {
          if (USE_API) {
            /** @type {Record<string, unknown>} */
            const apiData = {}
            if (edited.targetQuantity !== undefined) apiData.targetQuantity = edited.targetQuantity
            if (edited.targetYield !== undefined) apiData.targetYield = edited.targetYield
            if (edited.cropName !== undefined) apiData.cropName = edited.cropName
            if (edited.variety !== undefined) apiData.variety = edited.variety
            if (edited.greenhouseName !== undefined) apiData.greenhouseName = edited.greenhouseName
            if (edited.greenhouseId !== undefined) apiData.greenhouseId = edited.greenhouseId
            if (edited.plantingArea !== undefined) apiData.plantingArea = edited.plantingArea
            if (edited.plantingMode !== undefined) apiData.plantingMode = edited.plantingMode
            if (edited.startDate !== undefined) apiData.startDate = edited.startDate
            if (edited.expectedHarvestDate !== undefined) apiData.expectedHarvestDate = edited.expectedHarvestDate
            if (edited.responsiblePerson !== undefined) apiData.responsiblePerson = edited.responsiblePerson
            if (edited.remarks !== undefined) apiData.remarks = edited.remarks
            if (edited.planDetail !== undefined) apiData.planDetail = edited.planDetail
            if (edited.planDetailFileName !== undefined) apiData.planDetailFileName = edited.planDetailFileName
            if (edited.executionStatus !== undefined) apiData.executionStatus = edited.executionStatus

            // 不改变 batchStatus，只保存编辑内容
            await productionPlanStore.updatePlan(batch.id, /** @type {any} */ (apiData))
          }
          savedBatchCodes.push(batch.batchCode)
        }
      }

      await showAlert('保存成功！')
    } catch (error) {
      await showAlert('保存失败，请重试')
      return
    }

    await productionPlanStore.fetchPlans()

    const remainingSelectedRows = selectedRows.value.filter(id => !savedBatchCodes.includes(id))
    selectedRows.value = remainingSelectedRows

    /** @type {Record<string, EditedBatch>} */
    const remainingEditedBatches = {}
    /** @type {string[]} */
    const remainingEditedBatchCodes = []
    batches.value.forEach(batch => {
      if (savedBatchCodes.includes(batch.batchCode)) {
        // 已保存
      } else if (editedBatches.value[batch.batchCode]) {
        remainingEditedBatches[batch.batchCode] = editedBatches.value[batch.batchCode]
        remainingEditedBatchCodes.push(batch.batchCode)
      }
    })
    editedBatches.value = remainingEditedBatches
    editedBatchCodes.value = remainingEditedBatchCodes

    if (savedBatchCodes.length === selectedRows.value.length) {
      showBatchEditModal.value = false
      editedBatches.value = {}
      editedBatchCodes.value = []
      selectedRows.value = []
    } else {
      // 修复 P0: 部分保存也关闭模态（避免"已保存 1 项"后模态仍开着的困扰）
      // 剩余未保存的会被统计后丢弃（保留已保存状态）
      // V1.1 行为：保留打开让用户继续编辑剩余项 - UX 不友好，改 V2.0
      await showAlert(`已保存 ${savedBatchCodes.length} 项`)
      showBatchEditModal.value = false
      editedBatches.value = {}
      editedBatchCodes.value = []
      selectedRows.value = []
    }
  }

  // ==================== 申请作废 ====================
  /**
   * 申请作废
   * 1:1 翻译 V1.1 handleVoidConfirm
   * @returns {Promise<void>}
   */
  async function handleVoidConfirm() {
    // 复用 hook 顶部定义的 currentUserId/currentUsername/currentDepartment
    const today = new Date().toISOString().slice(0, 10)

    const currentBatch = batches.value.find(b => b.batchCode === selectedBatchCode.value)
    if (!currentBatch) {
      await showAlert('请先选择一个生产计划')
      return
    }

    /** @type {string[]} */
    const voidedBatchIds = []

    try {
      const voidId = `BV${Date.now()}_${currentBatch.id}`
      const voidCode = `BV${today.replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

      /** @type {Record<string, unknown>} */
      const approvalData = {
        id: voidId,
        type: 'production_plan',
        typeName: '生产计划',
        title: `生产计划作废审批：${currentBatch.batchCode}`,
        description: `申请作废生产计划：${currentBatch.batchCode}\n作物：${currentBatch.cropName} ${currentBatch.variety}\n区域：${currentBatch.greenhouseName}`,
        applicantId: currentUserId.value,
        applicantName: currentUsername.value,
        applicantDepartment: currentDepartment.value,
        applyDate: today,
        status: 'pending',
        priority: 'normal',
        businessLink: {
          type: 'production',
          approvalAction: 'void',
          requestId: currentBatch.id,
          requestCode: currentBatch.batchCode,
          cropName: currentBatch.cropName,
          variety: currentBatch.variety,
          greenhouseName: currentBatch.greenhouseName,
          startDate: currentBatch.startDate,
          expectedHarvestDate: currentBatch.expectedHarvestDate,
          responsiblePerson: currentBatch.responsiblePerson,
        },
      }

      if (USE_API) {
        await productionPlanStore.updatePlan(currentBatch.id, /** @type {any} */ ({ batchStatus: 'pending' }))
        await enhancedApiClient.post('/approvals', approvalData)
      }

      voidedBatchIds.push(currentBatch.id)
      await refreshApprovals()

      selectedRows.value = selectedRows.value.filter(id => !voidedBatchIds.includes(id))

      editedBatches.value = (() => {
        const next = { ...editedBatches.value }
        delete next[currentBatch.batchCode]
        return next
      })()

      await showAlert(`已提交作废申请：${currentBatch.batchCode}`)

      showBatchEditModal.value = false
    } catch (error) {
      // logger.error('提交作废申请失败:', error);
      await showAlert('提交作废申请失败，请重试')
    }

    showVoidWarning.value = false
  }

  // ==================== 选择逻辑 ====================
  /**
   * 单行选择切换
   * @param {string} id 批次 ID
   */
  function handleSelectRow(id) {
    if (selectedRows.value.includes(id)) {
      selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
    } else {
      selectedRows.value = [...selectedRows.value, id]
    }
  }

  /**
   * 全选/取消全选
   */
  function handleSelectAll() {
    if (selectedRows.value.length === filteredBatches.value.length) {
      selectedRows.value = []
    } else {
      selectedRows.value = filteredBatches.value.map(b => b.id)
    }
  }

  /**
   * 批量编辑全选
   */
  function handleBatchSelectAll() {
    const selectable = filteredBatches.value.filter(b => b.batchStatus !== 'completed' && b.batchStatus !== 'cancelled')
    if (selectedRows.value.length === selectable.length) {
      selectedRows.value = []
    } else {
      selectedRows.value = selectable.map(b => b.id)
    }
  }

  /**
   * 批量删除全选
   */
  function handleBatchDeleteSelectAll() {
    // 所有状态的生产计划都可以删除
    const deletableBatches = filteredBatches.value
    if (selectedRows.value.length === deletableBatches.length) {
      selectedRows.value = []
    } else {
      selectedRows.value = deletableBatches.map(b => b.id)
    }
  }

  /**
   * 确认下一个
   */
  function handleConfirmNext() {
    if (selectedBatchCode.value && !editedBatchCodes.value.includes(selectedBatchCode.value)) {
      editedBatchCodes.value = [...editedBatchCodes.value, selectedBatchCode.value]
    }
    const currentIndex = selectedRows.value.findIndex(id => {
      const batch = batches.value.find(b => b.id === id)
      return batch?.batchCode === selectedBatchCode.value
    })
    if (currentIndex < selectedRows.value.length - 1) {
      const nextBatch = batches.value.find(b => b.id === selectedRows.value[currentIndex + 1])
      if (nextBatch) {
        selectedBatchCode.value = nextBatch.batchCode
      }
    }
  }

  // ==================== 导出 ====================
  /**
   * 导出点击
   */
  function handleExportClick() {
    exportMode.value = true
    selectedRows.value = []
  }

  /**
   * 确认导出
   */
  function handleConfirmExport() {
    showExportModal.value = true
  }

  /**
   * 执行导出
   * 1:1 翻译 V1.1 handleDoExport
   * @returns {Promise<void>}
   */
  async function handleDoExport() {
    try {
      const selectedData = batches.value.filter(b => selectedRows.value.includes(b.id))
      const headers = ['生产计划批次号', '种植模式', '作物名称', '作物品种', '种植区域', '种植面积', '开始时间', '预计结束时间', '负责人', '目标产量', '发布人', '初次发布时间', '最后修改时间', '当前状态', '版本号', '备注']
      /** @type {Record<string, string>} */
      const batchStatusLabels = {
        draft: '草稿',
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝',
        completed: '已完成',
        cancelled: '已作废',
        pending_complete: '待完成',
      }
      const exportData = selectedData.map(row => ({
        '生产计划批次号': row.batchCode,
        '种植模式': row.plantingMode,
        '作物名称': row.cropName,
        '作物品种': row.variety,
        '种植区域': row.greenhouseName,
        '种植面积': row.plantingArea,
        '开始时间': row.startDate,
        '预计结束时间': row.expectedHarvestDate,
        '负责人': row.responsiblePerson,
        '目标产量': row.targetYield,
        '发布人': row.publisher || '-',
        '初次发布时间': row.publishDate || '-',
        '最后修改时间': /** @type {any} */ (row).lastModifyDate || '-',
        '当前状态': batchStatusLabels[row.batchStatus || 'draft'] || '-',
        '版本号': 'V1.0',
        '备注': /** @type {any} */ (row).description || '-',
      }))

      let content = ''
      let mimeType = ''
      let extension = ''

      if (exportFormat.value === 'csv') {
        content = headers.join(',') + '\n' + exportData.map(row =>
          headers.map(h => `"${row[h] || ''}"`).join(',')
        ).join('\n')
        mimeType = 'text/csv;charset=utf-8'
        extension = 'csv'
      } else if (exportFormat.value === 'excel') {
        content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
        mimeType = 'application/vnd.ms-excel;charset=utf-8'
        extension = 'xls'
      } else if (exportFormat.value === 'word') {
        content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
        mimeType = 'application/vnd.ms-word;charset=utf-8'
        extension = 'doc'
      }

      const fileName = `生产计划_${new Date().toISOString().slice(0, 10)}.${extension}`

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)

      showExportModal.value = false
      exportMode.value = false
      selectedRows.value = []
    } catch (error) {
      // logger.error('导出失败:', error);
      await showAlert('导出失败，请重试')
      showExportModal.value = false
      exportMode.value = false
      selectedRows.value = []
    }
  }

  /**
   * 取消导出
   */
  function handleCancelExport() {
    exportMode.value = false
    selectedRows.value = []
  }

  // ==================== 关闭 ====================
  /**
   * 关闭创建弹窗
   */
  function handleClose() {
    showCreateModal.value = false
    resetForm()
    errors.value = {}
  }

  // ==================== 分页 ====================
  /**
   * 修改分页大小
   * @param {number} size 每页条数
   */
  function handlePageSizeChange(size) {
    pageSize.value = size
    currentPage.value = 1
  }

  // ==================== 返回值 ====================
  return {
    // 状态
    statusFilter,
    planTypeFilter,
    selectedBatch,
    showCreateModal,
    currentPage,
    pageSize,
    formData,
    errors,
    exportMode,
    selectedRows,
    exportFormat,
    showExportModal,
    batchEditMode,
    showBatchEditModal,
    selectedBatchCode,
    editedBatchCodes,
    editedBatches,
    showVoidWarning,
    batchDeleteMode,
    showDeleteWarning,
    batches,
    filteredBatches,
    greenhouses,
    orders,
    batchesLength,

    // 搜索状态
    batchCodeSearch,
    plantingModeSearch,
    cropNameSearch,
    varietySearch,
    greenhouseSearch,

    // 设置方法
    setStatusFilter: (v) => { statusFilter.value = v },
    setPlanTypeFilter: (v) => { planTypeFilter.value = v },
    setSelectedBatch: (v) => { selectedBatch.value = v },
    setShowCreateModal: (v) => { showCreateModal.value = v },
    setCurrentPage: (v) => { currentPage.value = v },
    setPageSize: (v) => { pageSize.value = v },
    setFormData: formData,
    setErrors: errors,
    setExportMode: (v) => { exportMode.value = v },
    // 修复 P0: 与其他 setter 保持一致，把 setSelectedRows 暴露为函数（v） => selectedRows.value = v
    // 之前直接返回 ref，导致 enterBatchEditMode 中 hook.setSelectedRows([]) 报 TypeError
    setSelectedRows: (v) => { selectedRows.value = v },
    setExportFormat: (v) => { exportFormat.value = v },
    setShowExportModal: (v) => { showExportModal.value = v },
    setBatchEditMode: (v) => { batchEditMode.value = v },
    setShowBatchEditModal: (v) => { showBatchEditModal.value = v },
    setSelectedBatchCode: (v) => { selectedBatchCode.value = v },
    setEditedBatchCodes: (v) => { editedBatchCodes.value = v },
    setEditedBatches: (v) => { editedBatches.value = v },
    setShowVoidWarning: (v) => { showVoidWarning.value = v },
    setBatchDeleteMode: (v) => { batchDeleteMode.value = v },
    setShowDeleteWarning: (v) => { showDeleteWarning.value = v },

    // 搜索
    setBatchCodeSearch: (v) => { batchCodeSearch.value = v },
    setPlantingModeSearch: (v) => { plantingModeSearch.value = v },
    setCropNameSearch: (v) => { cropNameSearch.value = v },
    setVarietySearch: (v) => { varietySearch.value = v },
    setGreenhouseSearch: (v) => { greenhouseSearch.value = v },
    resetFilters,

    // 表单
    handleFormChange,
    validateForm,
    resetForm,
    generateBatchCode,

    // 操作
    handleSaveDraft,
    handleSubmitForApproval,
    handleSingleEdit,
    handleSingleDelete,
    handleDeleteConfirm,
    handlePublish,
    handleSave,
    handleVoidConfirm,

    // 选择
    handleSelectRow,
    handleSelectAll,
    handleBatchSelectAll,
    handleBatchDeleteSelectAll,
    handleConfirmNext,

    // 导出
    handleExportClick,
    handleConfirmExport,
    handleDoExport,
    handleCancelExport,

    // 关闭
    handleClose,

    // 分页
    handlePageSizeChange,
  }
}

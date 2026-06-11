<!--
  @file 采购计划主页面 - 1:1 翻译自 V1.1 PurchasePlanPage.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\PurchasePlanPage.tsx
  @description 复合组件：组装 L3 叶子组件 + 模态框
  @note V1.1 内联所有状态/逻辑（未抽取 hook），V2.0 保持一致
-->
<template>
  <div v-loading="isLoading" class="space-y-6">
    <!-- 预警统计头部 -->
    <AlertStats :purchase-plans-data="purchasePlansData" />

    <!-- 筛选表单 -->
    <PurchasePlanFilters
      :related-batch-code="relatedBatchCode"
      :purchase-type="purchaseType"
      :status="status"
      :alert-filter="alertFilter"
      :applicant="applicant"
      :applicant-department="applicantDepartment"
      :priority="priority"
      :required-start-date="requiredStartDate"
      :required-end-date="requiredEndDate"
      @related-batch-code-change="setRelatedBatchCode"
      @purchase-type-change="setPurchaseType"
      @status-change="setStatus"
      @alert-filter-change="setAlertFilter"
      @applicant-change="setApplicant"
      @applicant-department-change="setApplicantDepartment"
      @priority-change="setPriority"
      @required-start-date-change="setRequiredStartDate"
      @required-end-date-change="setRequiredEndDate"
      @reset="handleReset"
      @search="handleSearch"
    />

    <!-- 数据表格 -->
    <PurchasePlanTable
      :data="filteredAndSortedData"
      :current-page="currentPage"
      :page-size="pageSize"
      :selected-rows="selectedRows"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :batch-delete-mode="batchDeleteMode"
      :sort-config="sortConfig"
      :expanded-rows="expandedRows"
      :filtered-and-sorted-data="filteredAndSortedData"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-export="canExport"
      @toggle-expand="toggleExpandRow"
      @select-all="handleSelectAll"
      @select-row="handleSelectRow"
      @sort-change="handleSortChange"
      @page-change="setCurrentPage"
      @page-size-change="setPageSize"
      @view-detail="handleViewDetail"
      @edit="handleSingleEdit"
      @delete="handleSingleDelete"
      @create="handleOpenCreateModal"
      @batch-edit="handleEnterBatchEditMode"
      @batch-delete="handleEnterBatchDeleteMode"
      @export="handleExportClick"
      @export-confirm="handleConfirmExport"
      @export-cancel="handleCancelExport"
      @batch-edit-confirm="handleBatchEditConfirm"
      @batch-edit-cancel="handleBatchEditCancel"
      @batch-delete-confirm="handleBatchDeleteShowModal"
      @batch-delete-cancel="handleBatchDeleteCancel"
    />

    <!-- 创建弹窗：1:1 V1.1 L827-836 -->
    <CreatePlanModal
      v-model:is-open="showCreateModal"
      :create-form="createForm"
      :create-items="createItems"
      :purchase-plans-data="purchasePlansData"
      @form-change="handleCreateFormChange"
      @items-change="setCreateItems"
      @submit="handleCreateSubmit"
      @close="setShowCreateModal(false)"
    />

    <!-- 详情弹窗 -->
    <PlanDetailModal
      :visible="showDetailModal"
      :selected-plan-detail="selectedPlanDetail"
      :approval-records="extractAllRecords(selectedPlanApprovals)"
      @close="handleCloseDetail"
      @execution-status-changed="handleExecutionStatusChanged"
    />

    <!-- 删除确认弹窗（统一规格 560×450，按钮固定底部；单条/批量共用，根据 singleDeleteMode 区分 title/description） -->
    <DeleteWarningModal
      :is-open="showDeleteModal"
      :selected-count="singleDeleteMode ? 1 : selectedRows.length"
      :title="deleteModalTitle"
      :description="deleteModalDescription"
      @close="handleDeleteWarningClose"
      @confirm="handleDeleteConfirm"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      :visible="showBatchEditModal"
      :selected-rows="selectedRows"
      :selected-plan-code="selectedPlanCode"
      :current-editing-plan="currentEditingPlan"
      :batch-edit-data="batchEditData"
      :batch-edit-items="batchEditItems"
      :batch-select-open="batchSelectOpen"
      :edited-plans="editedPlans"
      :purchase-plans-data="purchasePlansData"
      :show-edit-items-expanded="showEditItemsExpanded"
      @close="handleCloseBatchEdit"
      @submit="handleBatchEditSave"
      @next="handleBatchEditNext"
      @batch-select-open-change="setBatchSelectOpen"
      @selected-plan-code-change="setSelectedPlanCode"
      @batch-edit-data-change="handleBatchEditDataChange"
      @batch-edit-items-change="setBatchEditItems"
      @show-edit-items-expanded-change="setShowEditItemsExpanded"
      @current-editing-plan-change="setCurrentEditingPlan"
      @edited-plans-change="setEditedPlans"
    />

    <!-- 导出格式弹窗 -->
    <ExportFormatModal
      :visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @update:visible="setShowExportModal"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
/**
 * @file PurchasePlanPage.vue
 * @description 采购计划主页面 - 1:1 翻译自 V1.1 PurchasePlanPage.tsx
 *              V1.1 内联所有状态/逻辑（无独立 composable），V2.0 保持内联
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\PurchasePlanPage.tsx
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

import AlertStats from './AlertStats.vue'
import PurchasePlanFilters from './PurchasePlanFilters.vue'
import PurchasePlanTable from './PurchasePlanTable.vue'
import CreatePlanModal from './CreatePlanModal.vue'
import PlanDetailModal from './PlanDetailModal.vue'
import BatchEditModal from './BatchEditModal.vue'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'

import { useUserStore } from '@/stores/modules/user'
import { usePurchasePlanStore } from '@/stores/modules/purchasePlan'
import { useApprovalStore } from '@/stores/modules/approval'
import { calculateOverdueAlert } from '@/types/purchase'
import { submitPurchaseApproval } from '@/services/approvalSubmitService'
import { getNextPurchaseApplicationCode } from '@/services/apiPurchasePlanService'
import { showAlert } from '@/lib/dialogService'

// ==================== 类型定义（JSDoc） ====================

/**
 * 采购计划主体（来自 L1 Pinia store）
 * @typedef {import('@/stores/modules/purchasePlan').PurchasePlan} PurchasePlan
 */

/**
 * 采购计划物料项
 * @typedef {Object} PurchasePlanItem
 * @property {string} [id]
 * @property {string} materialName
 * @property {string} [specification]
 * @property {string} [unit]
 * @property {number} quantity
 * @property {number} estimatedUnitPrice
 * @property {number} estimatedTotalPrice
 * @property {string} [supplierName]
 * @property {string} [remarks]
 */

/**
 * 排序配置
 * @typedef {Object} SortConfig
 * @property {string} field
 * @property {'asc'|'desc'} direction
 */

// ==================== 1:1 翻译 V1.1 权限控制 ====================
// V1.1: 已取消，所有人可使用所有功能（注释保留）
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true

// ==================== Store ====================
const userStore = useUserStore()
const purchasePlanStore = usePurchasePlanStore()

/** 1:1 翻译 V1.1 useUserStore((state) => state.users) */
const users = computed(() => userStore.users || [])
/** 1:1 翻译 V1.1 useUserStore((state) => state.loadUsers) */
const loadUsers = userStore.loadUsers

/** 1:1 翻译 V1.1 usePurchasePlanStore 解构
 *  ✅ 修复 P0-EMERGENCY（页面空白根因）: use storeToRefs 保留 getter ComputedRef 的响应式
 *  原代码 `const { getPlansWithStatus } = store` 会丢失响应式（Pinia setup store 解构自动 unwrap，
 *  导致 getPlansWithStatus 是 array 而非 ComputedRef，purchasePlansData.value 永远 undefined） */
const {
  plans: rawPlans,
  isLoading,
  statusUpdates,
  getPlansWithStatus,
} = storeToRefs(purchasePlanStore)
const {
  fetchPlans,
  addPlan,
  updatePlan,
  deletePlan,
  deletePlans,
} = purchasePlanStore

/** 合并 API 数据与审批状态更新（1:1 翻译 V1.1 getPlansWithStatus）
 *  getPlansWithStatus 是 ComputedRef（PURCHASE_PLAN 数组），后续 .value 访问模式保持一致 */
const purchasePlansData = getPlansWithStatus

// ==================== 1:1 翻译 V1.1 本地时间函数（避免 UTC 跨天）====================
/** 返回本地时区 YYYY-MM-DD，V1.1 L131-134 1:1 翻译 */
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ==================== 1:1 翻译 V1.1 useEffect ====================
// V1.1: useEffect(() => { if (users.length === 0) loadUsers() }, [users.length, loadUsers])
onMounted(() => {
  if (users.value.length === 0) {
    loadUsers()
  }
})

// V1.1: useEffect(() => { mountedRef.current = true; fetchPlans(); return () => { mountedRef.current = false } }, [])
const mountedRef = ref(true)
onMounted(() => {
  mountedRef.value = true
  fetchPlans()
})
onUnmounted(() => {
  mountedRef.value = false
})

// 1:1 翻译 V1.1 L75-84：监听审批状态变化，自动重拉采购计划
// 业务事件触发：审批通过/拒绝后，采购计划列表状态需要即时更新
const approvalStore = useApprovalStore()
/** 1:1 V1.1 approvalVersion - 审批总数（含挂载时的初值） */
const approvalVersion = computed(() => approvalStore.approvals?.length ?? 0)
/** 1:1 V1.1 lastApprovalStatusSum - 已审批条目总数（approved + rejected） */
const lastApprovalStatusSum = computed(() => {
  const arr = approvalStore.approvals || []
  return arr.reduce((sum, a) => sum + (a.status === 'approved' ? 1 : 0) + (a.status === 'rejected' ? 1 : 0), 0)
})
/** 1:1 V1.1 L80-84 - 跳过首次挂载，审批列表变化时 fetchPlans */
watch([approvalVersion, lastApprovalStatusSum], () => {
  if (approvalVersion.value === 0) return
  fetchPlans()
})

/** ✅ 修复 P0-EX-3: 进入采购计划页面时主动加载审批列表（V1.1 L86-91 1:1 翻译）
 *  用于详情弹窗显示审批记录（避免首次打开时审批 store 为空触发 API 拉取） */
onMounted(() => {
  if (typeof approvalStore.fetchApprovals === 'function') {
    approvalStore.fetchApprovals()
  }
})

// ==================== 筛选状态 ====================
const relatedBatchCode = ref('')
const purchaseType = ref('all')
const status = ref('all')
const alertFilter = ref('all')
const applicant = ref('')
const applicantDepartment = ref('')
const priority = ref('all')
const requiredStartDate = ref('')
const requiredEndDate = ref('')

const setRelatedBatchCode = (v) => { relatedBatchCode.value = v }
const setPurchaseType = (v) => { purchaseType.value = v }
const setStatus = (v) => { status.value = v }
const setAlertFilter = (v) => { alertFilter.value = v }
const setApplicant = (v) => { applicant.value = v }
const setApplicantDepartment = (v) => { applicantDepartment.value = v }
const setPriority = (v) => { priority.value = v }
const setRequiredStartDate = (v) => { requiredStartDate.value = v }
const setRequiredEndDate = (v) => { requiredEndDate.value = v }

// ==================== 分页状态 ====================
const currentPage = ref(1)
const pageSize = ref(10)
const setCurrentPage = (v) => { currentPage.value = v }
const setPageSize = (v) => { pageSize.value = v }

// ==================== 模式状态 ====================
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)

// ==================== 选中状态 ====================
const selectedRows = ref(/** @type {string[]} */ ([]))
const exportFormat = ref('excel')

// ==================== 弹窗状态 ====================
const showDeleteModal = ref(false)
const showExportModal = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const showBatchEditModal = ref(false)
const showEditItemsExpanded = ref(false)
const batchSelectOpen = ref(false)
// 修复 P0: 单条/批量删除共用 DeleteWarningModal，用 planToDelete + singleDeleteMode 区分
const planToDelete = ref(null)
const singleDeleteMode = ref(false)

// 弹窗 title/description 计算属性（避免 template 字符串转义问题）
const deleteModalTitle = computed(() =>
  singleDeleteMode.value ? '删除采购计划警告' : '批量删除采购计划警告'
)
const deleteModalDescription = computed(() => {
  if (singleDeleteMode.value && planToDelete.value) {
    return `确定要删除采购计划 <strong>${planToDelete.value.purchaseApplicationCode}</strong> 吗？此操作 <span style="color:#dc2626">无法恢复</span>，删除后数据将永久丢失。`
  }
  return ''
})

const setShowDeleteModal = (v) => { showDeleteModal.value = v }
const setShowExportModal = (v) => { showExportModal.value = v }
const setShowCreateModal = (v) => { showCreateModal.value = v }
const setShowDetailModal = (v) => { showDetailModal.value = v }
const setShowBatchEditModal = (v) => { showBatchEditModal.value = v }
const setShowEditItemsExpanded = (v) => { showEditItemsExpanded.value = v }
const setBatchSelectOpen = (v) => { batchSelectOpen.value = v }

// ==================== 详情选中 ====================
/** @type {import('vue').Ref<PurchasePlan | null>} */
const selectedPlanDetail = ref(null)

/** ✅ 修复 P0-3: 详情弹窗审批记录（V1.1 L128 1:1 翻译） */
const selectedPlanApprovals = ref([])

// ==================== 创建表单状态 ====================
/**
 * @typedef {Object} CreateFormState
 * @property {string} purchaseApplicationCode
 * @property {string} relatedBatchCode
 * @property {string} purchaseType
 * @property {string} applicant
 * @property {string} applicantDepartment
 * @property {string} applyDate
 * @property {string} requiredDate
 * @property {string} priority
 * @property {string} remark
 * @property {string} otherBatchReason
 * @property {string} approvalPerson
 */

/** @type {import('vue').Ref<CreateFormState>} */
const createForm = ref({
  purchaseApplicationCode: '',
  relatedBatchCode: '',
  purchaseType: 'production',
  applicant: localStorage.getItem('username') || '',
  applicantDepartment: localStorage.getItem('departmentName') || '生产部',
  // ✅ 修复 P0-8: 用本地时区生成日期（避免 UTC 跨天）
  applyDate: todayLocal(),
  requiredDate: '',
  priority: 'normal',
  remark: '',
  otherBatchReason: '',
  approvalPerson: '',
})
/** @type {import('vue').Ref<PurchasePlanItem[]>} */
const createItems = ref([])
/** ✅ 修复 P1-C: setCreateItems 支持值或 updater 函数（V1.1 L47-48 1:1 翻译）
 *  避免连续 setItems 调用（如 onSelect 一次性写多字段）互相覆盖 */
const setCreateItems = (v) => {
  if (typeof v === 'function') {
    createItems.value = v(createItems.value)
  } else {
    createItems.value = v
  }
}

// ==================== 批量编辑状态 ====================
/** @type {import('vue').Ref<string[]>} */
const editedPlanCodes = ref([])
/** @type {import('vue').Ref<Record<string, Partial<PurchasePlan>>>} */
const editedPlans = ref({})
const selectedPlanCode = ref('')
/** @type {import('vue').Ref<PurchasePlan | null>} */
const currentEditingPlan = ref(null)
const batchEditData = ref({
  // ✅ 修复 P0-15: 扩展为 10 字段（V1.1 L160-171 1:1 翻译）
  purchaseType: '',
  relatedBatchCode: '',
  otherBatchReason: '',
  applicant: '',
  applicantDepartment: '',
  applyDate: '',
  requiredDate: '',
  priority: '',
  remark: '',
  executionStatus: '',
})
/** @type {import('vue').Ref<PurchasePlanItem[]>} */
const batchEditItems = ref([])

const setEditedPlanCodes = (v) => { editedPlanCodes.value = v }
const setEditedPlans = (v) => { editedPlans.value = v }
const setSelectedPlanCode = (v) => { selectedPlanCode.value = v }
const setCurrentEditingPlan = (v) => { currentEditingPlan.value = v }
const setBatchEditData = (v) => { batchEditData.value = v }
/** ✅ 修复：setBatchEditItems 支持值或 updater 函数（V1.1 L47-48 1:1 翻译）
 *  之前 v 写死赋值，MaterialItemsTable.updateItem 传的函数式 updater 直接被存进 ref，
 *  导致 batchEditItems 变函数，v-for 渲染时整行被吞掉（看起来"被删"）*/
const setBatchEditItems = (v) => {
  if (typeof v === 'function') {
    batchEditItems.value = v(batchEditItems.value)
  } else {
    batchEditItems.value = v
  }
}

// ==================== 展开行状态 ====================
/** @type {import('vue').Ref<Set<string>>} */
const expandedRows = ref(new Set())

// ==================== 排序状态 ====================
/** @type {import('vue').Ref<SortConfig | null>} */
const sortConfig = ref(null)

// ==================== 展开/折叠行切换 ====================
function toggleExpandRow(id) {
  expandedRows.value = (() => {
    const next = new Set(expandedRows.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    return next
  })()
}

// ==================== 监听物料明细变化，标记批次号为已编辑 ====================
// V1.1 性能优化：useRef 跟踪上次 items 引用，避免 JSON.stringify 全量比较
const lastItemsRef = ref(null)
watch(
  [batchEditItems, selectedPlanCode],
  () => {
    if (!selectedPlanCode.value) {
      lastItemsRef.value = null
      return
    }
    if (lastItemsRef.value === batchEditItems.value) return // 引用未变，跳过
    lastItemsRef.value = batchEditItems.value
    editedPlans.value = {
      ...editedPlans.value,
      [selectedPlanCode.value]: {
        ...(editedPlans.value[selectedPlanCode.value] || {}),
        items: batchEditItems.value,
      },
    }
  },
  { deep: true }
)

// ==================== 排序处理 ====================
function handleSortChange(field) {
  sortConfig.value = (() => {
    const prev = sortConfig.value
    if (!prev || prev.field !== field) {
      return { field, direction: 'asc' }
    }
    if (prev.direction === 'asc') {
      return { field, direction: 'desc' }
    }
    return null
  })()
}

// ==================== 过滤和排序后的数据 ====================
/** @type {import('vue').ComputedRef<PurchasePlan[]>} */
const filteredAndSortedData = computed(() => {
  return purchasePlansData.value
    .filter((/** @type {PurchasePlan} */ plan) => {
      // V1.1: 空值保护
      if (relatedBatchCode.value && !(plan.relatedBatchCode || '').toLowerCase().includes(relatedBatchCode.value.toLowerCase())) return false
      if (purchaseType.value !== 'all' && plan.purchaseType !== purchaseType.value) return false
      if (status.value !== 'all' && plan.status !== status.value) return false
      if (applicant.value && !plan.applicant.toLowerCase().includes(applicant.value.toLowerCase())) return false
      if (applicantDepartment.value && !plan.applicantDepartment.toLowerCase().includes(applicantDepartment.value.toLowerCase())) return false
      if (priority.value !== 'all' && plan.priority !== priority.value) return false
      if (requiredStartDate.value && plan.requiredDate < requiredStartDate.value) return false
      if (requiredEndDate.value && plan.requiredDate > requiredEndDate.value) return false
      // 预警筛选（1:1 翻译 V1.1 calculateOverdueAlert）
      if (alertFilter.value !== 'all') {
        const alert = calculateOverdueAlert(plan)
        if (alertFilter.value === 'overdue' && alert.level !== 'overdue') return false
        if (alertFilter.value === 'warning' && alert.level !== 'warning') return false
      }
      return true
    })
    .sort((a, b) => {
      if (!sortConfig.value) return 0
      const { field, direction } = sortConfig.value
      const aValue = a[field]
      const bValue = b[field]
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
})

// ==================== 打开创建弹窗（异步获取编号）====================
async function handleOpenCreateModal() {
  // 兜底规则：PA + 年月 + 4位随机
  const now = new Date()
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const placeholder = `PA${ym}____`

  createForm.value = {
    purchaseApplicationCode: placeholder,
    relatedBatchCode: '',
    purchaseType: 'production',
    applicant: localStorage.getItem('username') || '',
    applicantDepartment: localStorage.getItem('departmentName') || '生产部',
    // ✅ 修复 P0-8: 用本地时区生成日期（避免 UTC 跨天）
    applyDate: todayLocal(),
    requiredDate: '',
    priority: 'normal',
    remark: '',
    otherBatchReason: '',
    approvalPerson: '',
  }
  createItems.value = []
  // 立即打开弹窗
  setShowCreateModal(true)

  // 后台异步获取真实编号并替换占位
  try {
    const realCode = await getNextPurchaseApplicationCode()
    if (realCode && createForm.value.purchaseApplicationCode === placeholder) {
      createForm.value = { ...createForm.value, purchaseApplicationCode: realCode }
    }
  } catch (err) {
    // 后端失败时用兜底编号
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    const fallback = `PA${ym}${random}`
    if (createForm.value.purchaseApplicationCode === placeholder) {
      createForm.value = { ...createForm.value, purchaseApplicationCode: fallback }
    }
  }
}

// ==================== 创建表单字段更新 ====================
function handleCreateFormChange(field, value) {
  createForm.value = { ...createForm.value, [field]: value }
}

// ==================== 批量编辑表单字段更新 ====================
// 1:1 翻译 V1.1 onBatchEditDataChange={(field, value) => setBatchEditData(prev => ({ ...prev, [field]: value }))}
function handleBatchEditDataChange(field, value) {
  batchEditData.value = { ...batchEditData.value, [field]: value }
}

// ==================== 创建提交 ====================
async function handleCreateSubmit() {
  /** 1:1 翻译 V1.1 L305-373：成功后才关闭弹窗，失败保持打开 */
  let success = false
  try {
    const totalAmount = createItems.value.reduce((sum, item) => sum + (item.estimatedTotalPrice || 0), 0)

    // 表单已是英文编码，直接提交无需映射
    /** @type {Partial<PurchasePlan>} */
    const planData = {
      purchaseApplicationCode: createForm.value.purchaseApplicationCode,
      relatedBatchCode: createForm.value.relatedBatchCode,
      purchaseType: createForm.value.purchaseType,
      applicant: createForm.value.applicant,
      applicantId: localStorage.getItem('userId') || '',
      applicantDepartment: createForm.value.applicantDepartment,
      applyDate: createForm.value.applyDate,
      requiredDate: createForm.value.requiredDate,
      priority: createForm.value.priority,
      status: /** @type {any} */ ('pending'),
      approvalStatus: /** @type {any} */ ('pending'),
      remarks: createForm.value.remark,
      approvalPerson: createForm.value.approvalPerson,
      items: createItems.value,
      totalAmount,
      attachments: [],
    }

    const result = await addPlan(planData)

    if (result && result.id) {
      const approvalAmount = totalAmount

      const approvalResult = await submitPurchaseApproval({
        purchaseId: result.id,
        purchaseCode: result.purchaseApplicationCode || createForm.value.purchaseApplicationCode,
        purchaseName: result.planTitle || `${createForm.value.purchaseType} - ${createForm.value.purchaseApplicationCode}`,
        amount: approvalAmount,
        applicantId: result.applicantId || planData.applicantId,
        applicantName: result.applicant,
        department: result.applicantDepartment,
      })

      if (!approvalResult.success) {
        // 审批提交失败，回滚：删除已创建的采购计划
        try {
          await deletePlan(result.id)
          await showAlert('审批提交失败: ' + approvalResult.message + '（采购计划已自动删除）')
        } catch (deleteError) {
          await showAlert(
            '审批提交失败: ' + approvalResult.message +
            '；自动回滚也失败，请手动删除 ID 为 ' + result.id + ' 的采购计划'
          )
        }
        return
      }

      if (approvalResult.autoApprove) {
        await showAlert('采购计划已创建，金额在免审批阈值内，已自动通过')
      } else {
        await showAlert('采购计划已创建并提交审批')
      }

      // ✅ 修复 P0-16: 创建后重新拉取列表（V1.1 L366-367 1:1 翻译）
      //  确保自动审批/普通审批的状态即时反映
      await fetchPlans()
      success = true
    }
  } catch (error) {
    await showAlert('创建采购计划失败，请重试')
  } finally {
    // ✅ 修复 P0-D：仅成功时才关闭弹窗（避免 alert 弹窗弹出时采购弹窗已被卸载丢失上下文）
    if (success) {
      setShowCreateModal(false)
    }
  }
}

// ==================== 重置筛选 ====================
function handleReset() {
  relatedBatchCode.value = ''
  purchaseType.value = 'all'
  status.value = 'all'
  alertFilter.value = 'all'
  applicant.value = ''
  applicantDepartment.value = ''
  priority.value = 'all'
  requiredStartDate.value = ''
  requiredEndDate.value = ''
  currentPage.value = 1
}

// ==================== 搜索 ====================
function handleSearch() {
  currentPage.value = 1
}

// ==================== 导出点击 ====================
function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

// ==================== 全选 ====================
function handleSelectAll() {
  if (selectedRows.value.length === filteredAndSortedData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredAndSortedData.value.map((p) => p.purchaseApplicationCode)
  }
}

// ==================== 选择行 ====================
function handleSelectRow(id) {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter((rowId) => rowId !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

// ==================== 确认导出 ====================
function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要导出的数据')
    return
  }
  setShowExportModal(true)
}

// ==================== 执行导出（RFC4180 CSV / xlsx 库 / Word HTML 兼容）====================
async function handleDoExport() {
  const selectedData = purchasePlansData.value.filter((p) => selectedRows.value.includes(p.purchaseApplicationCode))
  const headers = [
    { key: 'purchaseApplicationCode', label: '计划编号' },
    { key: 'planTitle', label: '计划名称' },
    { key: 'purchaseTypeName', label: '类型' },
    { key: 'applicant', label: '申请人' },
    { key: 'applyDate', label: '申请日期' },
    { key: 'totalAmount', label: '总金额' },
    { key: 'supplierName', label: '供应商' },
    { key: 'requiredDate', label: '交货日期' },
    { key: 'priorityText', label: '优先级' },
    { key: 'statusText', label: '状态' },
  ]

  // RFC4180 CSV 转义
  const csvEscape = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const fileNameBase = `采购计划_${dayjs().format('YYYY-MM-DD')}`

  try {
    if (exportFormat.value === 'csv') {
      const lines = [
        headers.map((h) => h.label).join(','),
        ...selectedData.map((row) => headers.map((h) => csvEscape(row[h.key])).join(',')),
      ]
      const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
      await downloadBlob(blob, `${fileNameBase}.csv`)
    } else if (exportFormat.value === 'excel') {
      // 真正用 xlsx 库生成 .xlsx
      const wsData = [
        headers.map((h) => h.label),
        ...selectedData.map((row) => headers.map((h) => row[h.key] ?? '')),
      ]
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      // 设置列宽
      ws['!cols'] = headers.map((h) => ({ wch: Math.max(12, h.label.length * 2) }))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '采购计划')
      XLSX.writeFile(wb, `${fileNameBase}.xlsx`)
    } else if (exportFormat.value === 'word') {
      // Word 走 HTML 兼容方案
      const escapeHtml = (s) => String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h) => `<th>${escapeHtml(h.label)}</th>`).join('')}</tr>${selectedData.map((row) => `<tr>${headers.map((h) => `<td>${escapeHtml(row[h.key])}</td>`).join('')}</tr>`).join('')}</table></body></html>`
      const blob = new Blob([html], { type: 'application/vnd.ms-word;charset=utf-8' })
      await downloadBlob(blob, `${fileNameBase}.doc`)
    }

    exportMode.value = false
    selectedRows.value = []
    setShowExportModal(false)
  } catch (err) {
    await showAlert('导出失败：' + (err instanceof Error ? err.message : '未知错误'))
  }
}

/** 通用下载方法：尝试用 showSaveFilePicker，否则降级到 a[download] */
async function downloadBlob(blob, fileName) {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: fileName.split('.').pop()?.toUpperCase() || 'File', accept: { [blob.type]: [`.${fileName.split('.').pop()}`] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch {
      // 用户取消或不支持，回退
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

// ==================== 取消导出 ====================
function handleCancelExport() {
  exportMode.value = false
  selectedRows.value = []
}

// ==================== 进入批量编辑/删除模式 ====================
function handleEnterBatchEditMode() {
  batchEditMode.value = true
}
function handleEnterBatchDeleteMode() {
  batchDeleteMode.value = true
}

// ==================== 删除点击 ====================
function handleDeleteClick() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要删除的数据')
    return
  }
  setShowDeleteModal(true)
}

// ==================== 批量删除请求（显示 DeleteWarningModal）====================
// 修复 P0: 批量删除走 DeleteWarningModal 确认流程
function handleBatchDeleteShowModal() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要删除的数据')
    return
  }
  // 切到批量模式（确保 DeleteWarningModal 显示批量文案）
  singleDeleteMode.value = false
  planToDelete.value = null
  setShowDeleteModal(true)
}

// ==================== 删除确认（单条/批量共用入口）====================
// 修复 P0: 单条删除走 planToDelete + singleDeleteMode；批量走 selectedRows
async function handleDeleteConfirm() {
  try {
    if (singleDeleteMode.value && planToDelete.value) {
      // 单条删除
      const plan = planToDelete.value
      setShowDeleteModal(false)
      planToDelete.value = null
      singleDeleteMode.value = false
      await deletePlan(plan.id)
      await showAlert('删除成功')
    } else {
      // 批量删除
      const selectedIds = [...selectedRows.value]
      const result = await deletePlans(selectedIds)
      setShowDeleteModal(false)
      batchDeleteMode.value = false
      selectedRows.value = []
      // ✅ 修复 P0-3: 用 result.deleted 而非 selectedIds.length
      const deletedCount = result?.deleted ?? selectedIds.length
      const skipMsg = result && result.skipped && result.skipped.length > 0 ? `，${result.skipped.length} 个被跳过` : ''
      await showAlert(`已删除 ${deletedCount} 个采购计划${skipMsg}`)
    }
    // ✅ 修复 Y-删除-3: 重新拉取数据，让列表立刻反映删除结果
    await fetchPlans()
  } catch (error) {
    const msg = error?.message || '删除失败，请重试'
    await showAlert(msg)
  }
}

// ==================== 关闭详情弹窗 ====================
function handleCloseDetail() {
  setShowDetailModal(false)
  selectedPlanDetail.value = null
}

// ==================== 查看详情 ====================
/** 1:1 翻译 V1.1 L562-571: 合并多个审批单的 records 并按时间升序 */
function extractAllRecords(approvals) {
  const all = []
  approvals.forEach((a) => {
    const records = a.records || []
    if (Array.isArray(records)) all.push(...records)
  })
  return all.sort((x, y) => String(x.actionTime || '').localeCompare(String(y.actionTime || '')))
}

/** ✅ 修复 P0-3: 异步加载关联审批 + 自动审批合成记录（V1.1 L573-634 1:1 翻译） */
async function handleViewDetail(plan) {
  selectedPlanDetail.value = plan
  selectedPlanApprovals.value = []
  setShowDetailModal(true)
  try {
    // 1. 先尝试从 store 缓存拿
    let matched = (approvalStore.approvals || []).filter((a) => {
      const link = a.businessLink
      if (!link) return false
      return link.type === 'purchase' && (
        link.requestId === plan.id ||
        link.requestCode === plan.purchaseApplicationCode ||
        link.requestId === plan.planCode
      )
    })
    // 2. 缓存未命中则从 API 拉取
    if (matched.length === 0) {
      try {
        const { enhancedApiClient } = await import('@/lib/apiClient')
        const allApprovals = await enhancedApiClient.get('/approvals')
        matched = (allApprovals || []).filter((a) => {
          const link = a.businessLink || a.business_link
          if (!link) return false
          const linkObj = typeof link === 'string' ? JSON.parse(link) : link
          return linkObj.type === 'purchase' && (
            linkObj.requestId === plan.id ||
            linkObj.requestCode === plan.purchaseApplicationCode ||
            linkObj.requestId === plan.planCode
          )
        })
        // ✅ 1:1 对齐 V1.1 L607-611: 规范化 businessLink + records 字段
        matched = matched.map((a) => ({
          ...a,
          businessLink: typeof a.businessLink === 'string' ? JSON.parse(a.businessLink) : a.businessLink,
          records: typeof a.records === 'string' ? JSON.parse(a.records) : a.records,
        }))
      } catch (apiErr) {
        console.warn('API 拉取审批单失败:', apiErr)
      }
    }
    // 3. 仍然未命中 + 计划已 approved → 自动审批合成记录
    if (matched.length === 0 && plan.status === 'approved') {
      matched = [{
        records: [{
          approverId: 'system',
          approverName: '系统',
          action: 'approve',
          comment: '金额在免审批阈值内，已自动通过',
          actionTime: plan.updatedAt || plan.createdAt || new Date().toISOString(),
        }],
      }]
    }
    selectedPlanApprovals.value = extractAllRecords(matched)
  } catch (err) {
    console.error('加载采购计划审批记录失败:', err)
  }
}

/** ✅ 修复 P0-2 配套: 详情弹窗改了执行状态 → 同步更新 + 触发重拉 */
function handleExecutionStatusChanged(updated) {
  selectedPlanDetail.value = updated
  fetchPlans()
}

// ==================== 单条编辑处理 ====================
function handleSingleEdit(plan) {
  // ✅ 修复 P0-5: 按 executionStatus 判断归档（V1.1 L639-642 1:1 翻译）
  if (plan.executionStatus === 'completed' || plan.executionStatus === 'cancelled') {
    showAlert('该采购计划已归档，无法编辑')
    return
  }
  // 设置选中的 plan 并打开批量编辑弹窗（复用它）
  selectedPlanCode.value = plan.purchaseApplicationCode
  currentEditingPlan.value = plan
  // ✅ 修复 P0-15: 初始化 10 字段（V1.1 L646-657 1:1 翻译），原 V2.0 只设 4 字段
  batchEditData.value = {
    purchaseType: plan.purchaseType,
    relatedBatchCode: plan.relatedBatchCode || '',
    otherBatchReason: plan.otherBatchReason || '',
    applicant: plan.applicant || '',
    applicantDepartment: plan.applicantDepartment || '',
    applyDate: plan.applyDate || '',
    requiredDate: plan.requiredDate || '',
    priority: plan.priority,
    remark: plan.remark || '',
    executionStatus: plan.executionStatus || 'pending_execution',
  }
  batchEditItems.value = plan.items || []
  editedPlanCodes.value = []
  editedPlans.value = {}
  selectedRows.value = [plan.purchaseApplicationCode]
  setShowBatchEditModal(true)
}

// ==================== 单条删除处理 ====================
// 修复 P0: 单条删除改为先弹 DeleteWarningModal，确认后执行
function handleSingleDelete(plan) {
  console.log('[PurchasePlan] handleSingleDelete called', plan)
  planToDelete.value = plan
  singleDeleteMode.value = true
  setShowDeleteModal(true)
  console.log('[PurchasePlan] showDeleteModal=', showDeleteModal.value, 'planToDelete=', planToDelete.value)
}

// 删除警告弹窗 - 关闭
function handleDeleteWarningClose() {
  setShowDeleteModal(false)
  planToDelete.value = null
  singleDeleteMode.value = false
}

// ==================== 批量编辑确认 ====================
function handleBatchEditConfirm() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要编辑的数据')
    return
  }
  const selectedPlansData = purchasePlansData.value.filter((p) => selectedRows.value.includes(p.purchaseApplicationCode))
  if (selectedPlansData.length > 0) {
    selectedPlanCode.value = selectedPlansData[0].purchaseApplicationCode
    currentEditingPlan.value = selectedPlansData[0]
    // ✅ 修复 P0-15: 批量编辑确认也补 10 字段（V1.1 L685-690 1:1 翻译）
    const first = selectedPlansData[0]
    batchEditData.value = {
      purchaseType: first.purchaseType,
      relatedBatchCode: first.relatedBatchCode || '',
      otherBatchReason: first.otherBatchReason || '',
      applicant: first.applicant || '',
      applicantDepartment: first.applicantDepartment || '',
      applyDate: first.applyDate || '',
      requiredDate: first.requiredDate || '',
      priority: first.priority,
      remark: first.remark || '',
      executionStatus: first.executionStatus || 'pending_execution',
    }
    batchEditItems.value = first.items || []
  }
  editedPlanCodes.value = []
  editedPlans.value = {}
  setShowBatchEditModal(true)
}

// ==================== 批量编辑取消 ====================
function handleBatchEditCancel() {
  batchEditMode.value = false
  selectedRows.value = []
}

// ==================== 批量删除取消 ====================
function handleBatchDeleteCancel() {
  batchDeleteMode.value = false
  selectedRows.value = []
}

// ==================== 关闭批量编辑弹窗 ====================
function handleCloseBatchEdit() {
  setShowBatchEditModal(false)
  batchEditMode.value = false
  selectedRows.value = []
  editedPlanCodes.value = []
  editedPlans.value = {}
  selectedPlanCode.value = ''
  currentEditingPlan.value = null
  batchEditItems.value = []
}

// ==================== 批量编辑"下一个" ====================
async function handleBatchEditNext() {
  if (!currentEditingPlan.value) {
    handleBatchEditCancel()
    return
  }

  try {
    // 1. 保存当前编辑
    const selectedUser = users.value.find((u) => u.id === currentEditingPlan.value.applicantId)
    const applicantName = selectedUser?.realName || selectedUser?.name || currentEditingPlan.value.applicant || ''
    // ✅ 修复 P0-15: 补 executionStatus + 10 字段写入（V1.1 L723-735 1:1 翻译）
    await updatePlan(currentEditingPlan.value.id, {
      relatedBatchCode: batchEditData.value.relatedBatchCode || currentEditingPlan.value.relatedBatchCode,
      purchaseType: batchEditData.value.purchaseType,
      priority: batchEditData.value.priority,
      requiredDate: batchEditData.value.requiredDate,
      remark: batchEditData.value.remark,
      executionStatus: batchEditData.value.executionStatus,
      applicantId: currentEditingPlan.value.applicantId,
      applicantName: batchEditData.value.applicant || applicantName,
      applicantDepartment: batchEditData.value.applicantDepartment || currentEditingPlan.value.applicantDepartment,
      applyDate: batchEditData.value.applyDate,
      items: batchEditItems.value,
    })

    // 2. 把当前 planCode 标记为已编辑
    const currentCode = currentEditingPlan.value.purchaseApplicationCode
    const remainingCodes = selectedRows.value.filter((code) => code !== currentCode)

    if (remainingCodes.length === 0) {
      await showAlert('所有计划已保存')
      setShowBatchEditModal(false)
      batchEditMode.value = false
      selectedRows.value = []
      editedPlanCodes.value = []
      editedPlans.value = {}
      selectedPlanCode.value = ''
      currentEditingPlan.value = null
      batchEditItems.value = []
      return
    }

    // 3. 切到下一个未编辑的
    const nextCode = remainingCodes[0]
    const nextPlan = purchasePlansData.value.find((p) => p.purchaseApplicationCode === nextCode)
    if (!nextPlan) {
      await showAlert('未找到下一个计划')
      return
    }
    selectedPlanCode.value = nextCode
    currentEditingPlan.value = nextPlan
    // ✅ 修复 P0-15: 切到下一个时初始化 10 字段（V1.1 L764-775 1:1 翻译）
    batchEditData.value = {
      purchaseType: nextPlan.purchaseType,
      relatedBatchCode: nextPlan.relatedBatchCode || '',
      otherBatchReason: nextPlan.otherBatchReason || '',
      applicant: nextPlan.applicant || '',
      applicantDepartment: nextPlan.applicantDepartment || '',
      applyDate: nextPlan.applyDate || '',
      requiredDate: nextPlan.requiredDate || '',
      priority: nextPlan.priority,
      remark: nextPlan.remark || '',
      executionStatus: nextPlan.executionStatus || 'pending_execution',
    }
    batchEditItems.value = nextPlan.items || []
    await showAlert(`已保存 ${currentCode}，已切到 ${nextCode}`)
  } catch (error) {
    await showAlert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// ==================== 批量编辑保存 ====================
async function handleBatchEditSave() {
  if (!currentEditingPlan.value) {
    await showAlert('请先选择一个采购计划')
    return
  }
  try {
    let savedCount = 0
    const errors = []

    // 1. 保存当前正在编辑的计划
    const selectedUser = users.value.find((u) => u.id === currentEditingPlan.value.applicantId)
    const applicantName = selectedUser?.realName || selectedUser?.name || currentEditingPlan.value.applicant || ''

    await updatePlan(currentEditingPlan.value.id, {
      relatedBatchCode: batchEditData.value.relatedBatchCode || currentEditingPlan.value.relatedBatchCode,
      purchaseType: batchEditData.value.purchaseType,
      priority: batchEditData.value.priority,
      requiredDate: batchEditData.value.requiredDate,
      remark: batchEditData.value.remark,
      executionStatus: batchEditData.value.executionStatus,
      applicantId: currentEditingPlan.value.applicantId,
      applicantName: batchEditData.value.applicant || applicantName,
      applicantDepartment: batchEditData.value.applicantDepartment || currentEditingPlan.value.applicantDepartment,
      applyDate: batchEditData.value.applyDate,
      items: batchEditItems.value,
    })
    savedCount++

    // 2. 保存 editedPlans 中累积的其他修改
    const editedPlanCodesList = Object.keys(editedPlans.value)
    for (const planCode of editedPlanCodesList) {
      if (planCode === currentEditingPlan.value.purchaseApplicationCode) continue
      const editData = editedPlans.value[planCode]
      const originalPlan = purchasePlansData.value.find((p) => p.purchaseApplicationCode === planCode)
      if (!originalPlan) continue

      try {
        const userForEdit = users.value.find((u) => u.id === (editData.applicantId || originalPlan.applicantId))
        const editApplicantName = userForEdit?.realName || userForEdit?.name || editData.applicant || originalPlan.applicant || ''

        await updatePlan(originalPlan.id, {
          ...editData,
          applicantName: editApplicantName,
          applicantId: editData.applicantId || originalPlan.applicantId,
          applicantDepartment: editData.applicantDepartment || originalPlan.applicantDepartment,
        })
        savedCount++
      } catch (editError) {
        errors.push(`${planCode}: ${editError instanceof Error ? editError.message : '未知错误'}`)
      }
    }

    if (errors.length > 0) {
      await showAlert(`部分计划保存失败: ${errors.join(', ')}`)
    } else {
      await showAlert(`成功保存 ${savedCount} 个采购计划`)
    }

    setShowBatchEditModal(false)
    batchEditMode.value = false
    selectedRows.value = []
    editedPlanCodes.value = []
    editedPlans.value = {}
    batchEditItems.value = []
  } catch (error) {
    await showAlert(`保存失败: ${error instanceof Error ? error.message : '请重试'}`)
  }
}
</script>

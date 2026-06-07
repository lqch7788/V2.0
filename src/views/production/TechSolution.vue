<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <FileCode class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">技术方案列表</h1>
          <p class="text-gray-500">种植技术方案的管理与发布</p>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <TechSolutionFilters
      :filters="filters"
      :crop-options="cropOptions"
      @update:filters="(v) => filters = v"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Table Card -->
    <TechSolutionTable
      :data="paginatedTechSolutions"
      :selected-rows="selectedRows"
      :batch-mode="batchMode"
      :batch-edit-mode="batchEditMode"
      :batch-delete-mode="batchDeleteMode"
      :export-mode="exportMode"
      @view="handleViewClick"
      @edit="handleEditClick"
      @delete="(ids) => { setSelectedRows(ids); showDeleteModal = true }"
      @download="downloadPlanDetail"
      @select-row="handleSelectRow"
      @select-all="handleSelectAll"
      @create="handleOpenCreateModal"
      @start-batch-edit="batchEditMode = true; selectedRows = []"
      @start-batch-delete="batchDeleteMode = true; selectedRows = []"
      @start-export="handleExportClick"
      @open-batch-edit="openBatchEdit"
      @open-delete="handleDeleteClick"
      @open-export="showExportModal = true"
      @cancel-batch="batchEditMode = false; batchDeleteMode = false; selectedRows = []"
      @cancel-export="handleCancelExport"
    />

    <!-- Pagination -->
    <!-- 修复 P0-008（cycle 2 回归）：恢复 V2.0 自定义 Pagination，与 V1.1 Pagination.tsx L78-178 1:1 对齐
         V1.1 实际包含 4 个功能：首页(ChevronsLeft) / 末页(ChevronsRight) / 每页下拉(showPageSize) / 共X页文本
         审计报告误判"无这些功能"，cycle 1 改用 el-pagination 删除了 3 个功能 → cycle 2 恢复
    -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <div class="flex items-center gap-4">
        <!-- 页码按钮组（V1.1 L76-155：首页/上一页/页码/下一页/末页）-->
        <div class="flex items-center gap-1">
          <!-- 首页（V1.1 L78-90）-->
          <button
            :class="['p-2 rounded-lg transition-colors', currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100']"
            :disabled="currentPage === 1"
            @click="currentPage = 1"
            title="首页"
          >
            <ChevronsLeft class="w-4 h-4" />
          </button>
          <!-- 上一页（V1.1 L92-104）-->
          <button
            :class="['p-2 rounded-lg transition-colors', currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100']"
            :disabled="currentPage === 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
            title="上一页"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <!-- 页码（V1.1 L106-126：智能省略号，最多 7 个可见）-->
          <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
            <button
              v-if="typeof page === 'number'"
              :class="['min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors', currentPage === page ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <span v-else class="px-2 text-gray-400">{{ page }}</span>
          </template>
          <!-- 下一页（V1.1 L128-140）-->
          <button
            :class="['p-2 rounded-lg transition-colors', currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100']"
            :disabled="currentPage >= totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            title="下一页"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
          <!-- 末页（V1.1 L142-154）-->
          <button
            :class="['p-2 rounded-lg transition-colors', currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100']"
            :disabled="currentPage >= totalPages"
            @click="currentPage = totalPages"
            title="末页"
          >
            <ChevronsRight class="w-4 h-4" />
          </button>
        </div>
        <!-- 每页下拉（V1.1 L157-173：showPageSize=true）-->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <select
            :value="pageSize"
            @change="(e) => { pageSize = Number((e.target as HTMLSelectElement).value); currentPage = 1 }"
            class="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}条</option>
          </select>
        </div>
        <!-- 共X页（V1.1 L175-178）-->
        <span class="text-sm text-gray-500">共 {{ totalPages }} 页</span>
      </div>
    </div>

    <!-- View Modal -->
    <TechSolutionDetailModal
      :visible="viewModalOpen"
      :tech="selectedTech"
      :approvals="viewApprovals"
      :approvals-loading="viewApprovalsLoading"
      @close="viewModalOpen = false"
    />

    <!-- Edit Modal -->
    <TechSolutionEditModal
      :visible="editModalOpen"
      :tech="selectedTech"
      :form="editForm"
      :selected-crop="selectedCropEdit"
      :operator-options="operatorOptions"
      @close="editModalOpen = false"
      @submit="handleEditSubmit"
      @update:form="(v) => editForm = v"
      @update:selected-crop="(v) => selectedCropEdit = v"
    />

    <!-- Create Modal -->
    <TechSolutionCreateModal
      :visible="createModalOpen"
      :form="newPlanForm"
      :selected-crop="selectedCrop"
      :operator-options="operatorOptions"
      @close="createModalOpen = false"
      @submit="handleCreateSubmit"
      @update:form="(v) => newPlanForm = v"
      @update:selected-crop="(v) => selectedCrop = v"
    />

    <!-- Delete Warning Modal -->
    <!-- 修复 P0-014：改用 V2.0 通用 DeleteWarningModal 组件（与 V1.1 DeleteWarningModal.tsx 行为一致） -->
    <DeleteWarningModal
      :is-open="showDeleteModal"
      :selected-count="selectedRows.length"
      @close="showDeleteModal = false"
      @confirm="handleDeleteConfirm"
    />

    <!-- Batch Edit Modal -->
    <TechSolutionBatchEditModal
      :visible="showBatchEditModal"
      :selected-rows="selectedRows"
      :all-techs="techSolutions"
      :edited-techs="editedTechs"
      :edited-tech-codes="editedTechCodes"
      :crop-options="cropOptions"
      @close="cancelBatchEdit"
      @save="saveBatchEdit"
      @update:edited-techs="(v) => editedTechs = v"
      @update:edited-tech-codes="(v) => editedTechCodes = v"
    />

    <!-- Export Format Modal -->
    <ExportFormatModal
      :visible="showExportModal"
      v-model:format="exportFormat"
      :selected-count="selectedRows.length"
      :formats="exportFormats"
      @close="showExportModal = false"
      @confirm="handleConfirmExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTechSolutionStore } from '@/stores/modules/techSolution'
import { useApprovalStore } from '@/stores/modules/approval'
// 修复 P0-002 衍生：导出"种植模式"使用字典 label
import { useDictionaryStore } from '@/stores/modules/dictionary'
import { enhancedApiClient } from '@/lib/apiClient'
import { showAlert } from '@/lib/dialogService'
import { FileCode, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { getVarietyByCode } from '@/services/cropVarietyService'
import { getTechSolutionApprovals } from '@/services/techSolutionService'
// 修复 P1-1/P1-3：去重字典映射与方案编号生成（3 文件共用同一工具）
import { getDictItemNameSync } from '@/utils/dictHelpers'
import { generateTechSolutionCode } from '@/utils/techSolutionHelpers'
import TechSolutionFilters from './components/TechSolutionFilters.vue'
import TechSolutionTable from './components/TechSolutionTable.vue'
import TechSolutionDetailModal from './modals/TechSolutionDetailModal.vue'
import TechSolutionEditModal from './modals/TechSolutionEditModal.vue'
import TechSolutionCreateModal from './modals/TechSolutionCreateModal.vue'
import TechSolutionBatchEditModal from './modals/TechSolutionBatchEditModal.vue'
import ExportFormatModal from './modals/ExportFormatModal.vue'
// 修复 P0-014：引入通用 DeleteWarningModal 组件
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
// 第二阶段 Y4 重构：导出格式 + 编制人 + 作物下拉统一从 composables 导入
import { useExportFormats } from '@/composables/production/useExportFormats'
import { useOperatorOptions } from '@/composables/production/useOperatorOptions'
import { useCropOptions } from '@/composables/production/useCropOptions'

// ==================== 样式常量 ====================
// 第二阶段 Y2 重构：按钮样式抽常量（共享 src/views/production/constants/buttonStyles.js）
import { btnSecondary, btnDestructive, btnGhost } from './constants/buttonStyles'

// 修复 Y6: HTML 转义工具函数（导出时防止 XSS 和表格结构破坏）
const escapeHtml = (s: any) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

// ==================== 常量 ====================
const { exportFormats } = useExportFormats()

// ==================== Store ====================
const techSolutionStore = useTechSolutionStore()
const approvalStore = useApprovalStore()
// 修复 P0-002 衍生：导出时使用字典 label 同步函数（与 V1.1 L483 `getDictItemName` 行为一致）
const dictionaryStore = useDictionaryStore()
const { solutions: techSolutions } = storeToRefs(techSolutionStore)
const { fetchSolutions, addSolution, updateSolution, deleteSolutions } = techSolutionStore

// ==================== 过滤器/分页/选中行 ====================
// 第二阶段 Y7 重构：filters/pagination/selectedRows 状态抽 composable
import { useTechSolutionState } from '@/composables/production/useTechSolutionState'
const {
  filters,
  currentPage,
  pageSize,
  selectedRows,
  isAllSelected,
  toggleRow,
  toggleSelectAll,
  resetFilters,
  triggerSearch,
} = useTechSolutionState()

// ==================== 操作人员选项 ====================
// 第二阶段 Y4 重构：编制人下拉数据从 composable 导入
const { operatorOptions, loadOperators } = useOperatorOptions()

// ==================== 生命周期 ====================
onMounted(() => {
  loadOperators()
  fetchSolutions()
  // 修复 P0-006 衍生：确保字典数据加载（与 V1.1 L117-124 setDictReady 门控对齐）
  if (dictionaryStore.dictionaries.length === 0) {
    dictionaryStore.loadDictionaries()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleFocus)
})

// 修复 Y4: visibilitychange + focus 同时触发 fetchSolutions 会发起 2 次请求
// 改为单一入口 + 1 秒节流，避免重复请求
let lastFetchAt = 0
const refreshIfStale = () => {
  if (Date.now() - lastFetchAt > 1000) {
    lastFetchAt = Date.now()
    fetchSolutions()
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    refreshIfStale()
  }
}

const handleFocus = () => {
  refreshIfStale()
}

// ==================== 计算属性 ====================
// 第二阶段 Y4 重构：作物下拉从 composable 派生
const { cropOptions } = useCropOptions(() => techSolutions.value)

const filteredTechSolutions = computed(() => {
  return techSolutions.value.filter((tech: any) => {
    if (filters.value.code && !tech.code.toLowerCase().includes(filters.value.code.toLowerCase())) return false
    if (filters.value.cropFilter && filters.value.cropFilter !== '全部' && tech.crop !== filters.value.cropFilter) return false
    if (filters.value.author && !tech.author.toLowerCase().includes(filters.value.author.toLowerCase())) return false
    if (filters.value.status && filters.value.status !== '全部' && tech.status !== filters.value.status) return false
    if (filters.value.startDate && tech.createDate < filters.value.startDate) return false
    if (filters.value.endDate && tech.createDate > filters.value.endDate) return false
    return true
  })
})

const paginatedTechSolutions = computed(() => {
  return filteredTechSolutions.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTechSolutions.value.length / pageSize.value) || 1
})

// 修复 P0-008（cycle 2 回归）：恢复 visiblePages 智能页码列表
// 1:1 翻译 V1.1 Pagination.tsx L31-66 getPageNumbers：totalPages>7 时显示省略号
const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pages: (number | string)[] = []
  const showEllipsis = total > 7

  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    // 始终显示第一页
    pages.push(1)
    if (current > 3) pages.push('...')
    // 显示当前页附近的页码
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    // 始终显示最后一页
    if (total > 1) pages.push(total)
  }
  return pages
})

// 修复 P0-008（cycle 2 回归）：pageSizeOptions 与 V1.1 Pagination.tsx L26 默认值 1:1 一致
// V1.1 默认 pageSizeOptions = [10, 20, 50, 100]
const pageSizeOptions = ref<number[]>([10, 20, 50, 100])

// ==================== 搜索/重置 ====================
const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filters.value = {
    code: '',
    cropFilter: '全部',
    author: '',
    status: '全部',
    startDate: '',
    endDate: '',
  }
  currentPage.value = 1
}

// ==================== Modal State ====================
const viewModalOpen = ref(false)
const viewApprovals = ref<any[]>([])
const viewApprovalsLoading = ref(false)
const editModalOpen = ref(false)
const createModalOpen = ref(false)
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const showDeleteModal = ref(false)
const showBatchEditModal = ref(false)
// 第二阶段 Y7 重构：selectedRows 已从 useTechSolutionState 导入
const exportFormat = ref('excel')
const showExportModal = ref(false)
const selectedTech = ref<any>(null)

const batchMode = computed(() => batchEditMode.value || batchDeleteMode.value)

const editForm = ref({
  title: '',
  crop: '',
  cropCode: '',
  plantingMode: '',
  stage: '',
  scopes: [] as string[],
  version: '',
  content: '',
  remarks: '',
  isValid: '有效',
  lastSubmitTime: '',
  planDetailFileName: '',
  // 修复 P0-003：补回"关联生产批次号"字段（V1.1 EditForm L28 有此字段）
  relatedBatchCode: '',
  // 修复 P0-CU-2：补 author 字段，编制人编辑后才能正确保存（与 V1.1 L344 一致）
  author: '',
})

const editedTechCodes = ref<string[]>([])
const editedTechs = ref<Record<string, any>>({})
// 修复 I1 衍生：与 V1.1 L224 一致，保存批量编辑弹窗中当前选中的方案编号
const selectedTechCode = ref('')

const newPlanForm = ref({
  code: '',
  title: '',
  crop: '',
  cropCode: '',
  plantingMode: '水培',
  stage: '',
  scopes: [] as string[],
  author: localStorage.getItem('username') || '',
  version: 'V1.0',
  content: '',
  remarks: '',
  planDetailFileName: '',
  relatedBatchCode: '',
})

const selectedCrop = ref<any>(null)
const selectedCropEdit = ref<any>(null)

const generateCode = generateTechSolutionCode

const setSelectedRows = (rows: (string | number)[]) => {
  selectedRows.value = rows
}

const handleViewClick = async (tech: any) => {
  selectedTech.value = tech
  viewModalOpen.value = true
  viewApprovalsLoading.value = true
  viewApprovals.value = []
  try {
    const approvals = await getTechSolutionApprovals(tech.id)
    viewApprovals.value = approvals || []
  } catch (err) {
    // 修复 Y7: catch 块增加日志（Rule 12 Fail Loud）
    console.error('[TechSolution] 获取审批记录失败:', err)
    viewApprovals.value = []
  } finally {
    viewApprovalsLoading.value = false
  }
}

const handleEditClick = (tech: any) => {
  if (tech.isValid === '作废') {
    showAlert('该方案已作废，无法编辑')
    return
  }
  selectedTech.value = tech
  const varietyInfo = tech.cropCode ? getVarietyByCode(tech.cropCode) : null
  selectedCropEdit.value = varietyInfo
  // 修复 P0-012：保留原始 lastSubmitTime，不重置（与 V1.1 L344 一致）
  // V1.1: `lastSubmitTime: tech.lastSubmitTime || ''`
  // V2.0 原: `new Date().toISOString().split('T')[0]`（强制覆盖为当天，丢失原值）
  editForm.value = {
    title: tech.title,
    crop: tech.crop,
    cropCode: tech.cropCode || '',
    plantingMode: tech.plantingMode,
    stage: tech.stage,
    scopes: tech.scopes || [],
    version: tech.version,
    content: tech.content,
    remarks: tech.remarks || '',
    relatedBatchCode: tech.relatedBatchCode || '',
    planDetailFileName: tech.planDetailFileName || '',
    isValid: tech.isValid || '有效',
    lastSubmitTime: tech.lastSubmitTime || '',
    // 修复 P0-CU-2：从 tech.author 同步给表单，编辑后才能保存（与 V1.1 L344 一致）
    author: tech.author || '',
  }
  editModalOpen.value = true
}

const handleEditSubmit = async () => {
  if (!selectedTech.value) return
  // 修复 P0-CU：补 author 字段，编制人编辑才落地（与 V1.1 L344 一致）
  // 修复 P0-012：lastSubmitTime 仅在原值为空时兜底，不强制覆盖
  const updateData = {
    solutionTitle: editForm.value.title,
    cropName: editForm.value.crop,
    cropCode: editForm.value.cropCode,
    plantingMode: editForm.value.plantingMode,
    stage: editForm.value.stage,
    scopeNames: editForm.value.scopes,
    author: editForm.value.author, // 修复 P0-CU
    version: editForm.value.version,
    content: editForm.value.content,
    remarks: editForm.value.remarks,
    relatedBatchCode: editForm.value.relatedBatchCode || '',
    planDetailFileName: editForm.value.planDetailFileName || '',
    priority: selectedTech.value.priority || 'normal',
    isValid: editForm.value.isValid,
    lastSubmitTime: editForm.value.lastSubmitTime || selectedTech.value.lastSubmitTime || '',
  }
  try {
    // 修复 R2：updateSolution 返回的是 updated 对象，变量名 success 误命名（对象为 null 时才进入 else）
    // 改为 result，统一判断 !== null
    const result = await updateSolution(selectedTech.value.id, updateData)
    // 修复 P0-K：仅成功时才关闭弹窗（避免 alert 后弹窗被卸载丢失上下文）
    if (result !== null && result !== undefined) {
      // 修复 P0-LIST-EDIT：与 V1.1 L358-360 一致，编辑后显式刷新列表
      // 解决"编辑保存后字段不显示"问题
      await fetchSolutions()
      editModalOpen.value = false
    } else {
      await showAlert('更新失败，请重试')
    }
  } catch (error) {
    console.error('更新技术方案失败:', error)
    await showAlert('更新失败，请重试')
  }
}

const handleCreateSubmit = async (submitMode: 'draft' | 'submit') => {
  const today = new Date().toISOString().split('T')[0]
  // 修复 P0-BQ/BR：与 V1.1 L373-391 一致，传 code + solutionCode 兼容后端
  const techSolutionData = {
    code: newPlanForm.value.code, // 方案编号（V1.1 L373）
    solutionCode: newPlanForm.value.code, // 兼容后端字段名
    solutionTitle: newPlanForm.value.title,
    cropName: newPlanForm.value.crop,
    cropCode: newPlanForm.value.cropCode,
    plantingMode: newPlanForm.value.plantingMode,
    stage: newPlanForm.value.stage,
    scopeNames: newPlanForm.value.scopes,
    remarks: newPlanForm.value.remarks,
    version: newPlanForm.value.version || 'V1.0',
    content: newPlanForm.value.content,
    author: newPlanForm.value.author || localStorage.getItem('username') || '',
    authorId: localStorage.getItem('userId') || '',
    relatedBatchCode: newPlanForm.value.relatedBatchCode || '',
    planDetailFileName: newPlanForm.value.planDetailFileName || '',
    priority: 'normal',
    batchStatus: submitMode === 'draft' ? 'draft' : 'pending',
  }
  try {
    const result = await addSolution(techSolutionData)
    if (submitMode === 'submit') {
      const approvalData = {
        id: `AP${Date.now()}`,
        type: 'tech_solution',
        typeName: '技术方案',
        title: `技术方案审批：${newPlanForm.value.title}`,
        // 修复 P0-BU：与 V1.1 L405 一致，description 用 stage 字段（不 scopes.join）
        description: `作物：${newPlanForm.value.crop}\n种植模式：${newPlanForm.value.plantingMode}\n适用范围：${newPlanForm.value.stage}`,
        applicantId: localStorage.getItem('userId') || '',
        applicantName: localStorage.getItem('username') || '',
        applicantDepartment: localStorage.getItem('department') || '',
        applyDate: today,
        status: 'pending',
        priority: 'normal',
        businessLink: {
          type: 'tech_solution',
          requestId: result.id,
          requestCode: result.code,
          solutionTitle: newPlanForm.value.title,
          cropName: newPlanForm.value.crop,
          plantingMode: newPlanForm.value.plantingMode,
          // 修复 P0-AT：与 V1.1 L419 一致，stage 用 newPlanForm.stage 不用 scopes.join
          stage: newPlanForm.value.stage,
          version: newPlanForm.value.version || 'V1.0',
        },
      }
      await enhancedApiClient.post('/approvals', approvalData)
      await approvalStore.refreshApprovals()
    }
    // 修复 P0-LIST：与 V1.1 L430 一致，关闭弹窗前显式刷新列表
    // 解决"新增后字段不显示"问题（addSolution 内存添加的数据可能缺字段/编码问题，强制从服务端拉一遍）
    await fetchSolutions()
    createModalOpen.value = false
    // 修复 P0-AU/AV：与 V1.1 L435-449 一致，完整重置表单
    newPlanForm.value = {
      code: '',
      title: '',
      crop: '',
      cropCode: '',
      plantingMode: '水培',
      stage: '',
      scopes: [],
      author: localStorage.getItem('username') || '',
      version: 'V1.0',
      content: '',
      remarks: '',
      planDetailFileName: '',
      relatedBatchCode: '',
    }
  } catch (error) {
    console.error('创建技术方案失败，请重试:', error)
    await showAlert('创建技术方案失败，请重试')
  }
}

const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleSelectAll = () => {
  if (selectedRows.value.length === techSolutions.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = techSolutions.value.map((t: any) => t.id)
  }
}

const handleSelectRow = (id: string | number) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter((rowId: string | number) => rowId !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要导出的数据')
    return
  }
  handleDoExport()
}

const handleDoExport = async () => {
  const selectedData = techSolutions.value.filter((t: any) => selectedRows.value.includes(t.id))
  // 修复 P0-001/P0-011 衍生：导出列与 V1.1 L477 一致（11 列，无自创的最后提交时间/审核人/审批状态）
  const headers = ['方案编号', '关联生产计划批次', '方案标题', '作物品种', '种植模式', '适用范围', '版本', '编制人', '创建日期', '状态', '方案是否有效']
  const exportData = selectedData.map((row: any) => ({
    '方案编号': row.code,
    '关联生产计划批次': row.relatedBatchCode || '-',
    '方案标题': row.title,
    '作物品种': row.crop,
    // 修复 P0-002 衍生：种植模式做字典映射（与 V1.1 L483 一致）
    '种植模式': getDictItemNameSync('planting_mode', row.plantingMode),
    // 修复 R4：导出 scopes 字段（V1.1 后端已迁到 scopes 数组模式）
    '适用范围': (row.scopes && row.scopes.length > 0) ? row.scopes.join('、') : (row.stage || '-'),
    '版本': row.version,
    '编制人': row.author,
    '创建日期': row.createDate,
    '状态': row.status,
    '方案是否有效': row.isValid || '有效'
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    // 修复 Y6: CSV 字段值中的逗号/引号需转义（避免破坏列结构）
    content = headers.join(',') + '\n' + exportData.map((row: any) =>
      headers.map((h: string) => {
        const cell = String(row[h as keyof typeof row] ?? '').replace(/"/g, '""')
        return `"${cell}"`
      }).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    // 修复 Y6: Excel 单元格值需 HTML 转义（防 < > & " ' 破坏表格结构）
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h: string) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${escapeHtml(row[h as keyof typeof row])}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map((h: string) => `<th>${h}</th>`).join('')}${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h as keyof typeof row] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const fileName = `技术方案_${new Date().toISOString().slice(0, 10)}.${extension}`

  try {
    if ((window as any).showSaveFilePicker) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: exportFormat.value.toUpperCase() + ' Files',
          accept: { [mimeType]: ['.' + extension] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
    } else {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleDeleteClick = () => {
  // 默认全选当前过滤结果（与"列表内所有订单"对齐：不过滤条件、删除所有可见行）
  if (selectedRows.value.length === 0) {
    selectedRows.value = filteredTechSolutions.value.map((t: any) => t.id)
  }
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  // 修复 Y8: 简化 filter+map（selectedRows 已是 id 数组，直接用）
  const selectedIds = [...selectedRows.value]
  try {
    await deleteSolutions(selectedIds)
    ElMessage.success(`已删除 ${selectedIds.length} 个技术方案`)
  } catch (error) {
    console.error('删除技术方案失败:', error)
    // enhancedApiClient 直接 throw new Error(message)，message 即后端 error 字段
    const msg = error?.message || '删除失败，请重试'
    await showAlert(msg)
  }
  showDeleteModal.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
}

const handleOpenCreateModal = () => {
  newPlanForm.value = {
    code: generateCode(),
    title: '',
    crop: '',
    cropCode: '',
    plantingMode: '水培',
    stage: '',
    scopes: [],
    author: localStorage.getItem('username') || '',
    version: 'V1.0',
    content: '',
    remarks: '',
    planDetailFileName: '',
    relatedBatchCode: '',
  }
  selectedCrop.value = null
  createModalOpen.value = true
}

const openBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要编辑的数据')
    return
  }
  // 修复 I1 衍生：与 V1.1 L670-674 一致，打开批量编辑弹窗时设置默认选中的方案编号
  const selectedTechsData = techSolutions.value.filter((t: any) =>
    selectedRows.value.includes(t.id)
  )
  if (selectedTechsData.length > 0) {
    selectedTechCode.value = selectedTechsData[0].code
  }
  editedTechCodes.value = []
  editedTechs.value = {}
  showBatchEditModal.value = true
}

const saveBatchEdit = async () => {
  try {
    for (const tech of techSolutions.value) {
      const edited = editedTechs.value[tech.code]
      if (edited) {
        // 修复 P0-CZ：补全所有字段（author/scopeNames/relatedBatchCode/isValid/remarks/lastSubmitTime）
        await updateSolution(tech.id, {
          solutionTitle: edited.title ?? tech.title,
          cropName: edited.crop ?? tech.crop,
          cropCode: edited.cropCode ?? tech.cropCode ?? '',
          plantingMode: edited.plantingMode ?? tech.plantingMode,
          stage: edited.stage ?? tech.stage,
          scopeNames: edited.scopes ?? tech.scopes ?? [],
          version: edited.version ?? tech.version,
          content: edited.content ?? tech.content,
          author: edited.author ?? tech.author ?? '',
          relatedBatchCode: edited.relatedBatchCode ?? tech.relatedBatchCode ?? '',
          planDetailFileName: edited.planDetailFileName ?? tech.planDetailFileName ?? '',
          priority: tech.priority || 'normal',
          remarks: edited.remarks ?? tech.remarks ?? '',
          isValid: edited.isValid ?? tech.isValid ?? '有效',
          lastSubmitTime: tech.lastSubmitTime || '',
        })
      }
    }
    const savedCount = editedTechCodes.value.length
    showBatchEditModal.value = false
    batchEditMode.value = false
    selectedRows.value = []
    editedTechCodes.value = []
    editedTechs.value = {}
    await showAlert(`已保存 ${savedCount} 个技术方案的修改`)
  } catch (error) {
    console.error('批量保存失败:', error)
    await showAlert('保存失败，请重试')
  }
}

const cancelBatchEdit = () => {
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  editedTechCodes.value = []
  editedTechs.value = {}
}

const downloadPlanDetail = (tech: any) => {
  const fileName = tech.planDetailFileName
  const isDocx = fileName.endsWith('.docx')
  // 修复 P0-002 衍生：下载文件内容中"种植模式"使用字典 label（与 V1.1 L696 一致）
  const content = `# ${tech.title}\n\n方案编号：${tech.code}\n作物品种：${tech.crop}\n种植模式：${getDictItemNameSync('planting_mode', tech.plantingMode)}\n适用范围：${tech.stage}\n版本：${tech.version}\n编制人：${tech.author}\n创建日期：${tech.createDate}\n\n---方案内容---\n${tech.content}`
  const blob = new Blob([content], {
    type: isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/markdown'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

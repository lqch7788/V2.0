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
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select v-model="pageSize" @change="currentPage = 1" class="w-20">
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-1">
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = 1" :disabled="currentPage === 1">
          <ChevronsLeft class="w-4 h-4" />
        </button>
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1">
          <ChevronLeft class="w-4 h-4" />
        </button>
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
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage >= totalPages">
          <ChevronRight class="w-4 h-4" />
        </button>
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = totalPages" :disabled="currentPage >= totalPages">
          <ChevronsRight class="w-4 h-4" />
        </button>
        <span class="text-sm text-gray-500 ml-2">共 {{ totalPages }} 页</span>
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
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-96 shadow-xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">删除警告</h3>
        </div>
        <div class="text-sm text-gray-600 space-y-2 mb-6">
          <p>确定要删除选中的 <strong>{{ selectedRows.length }}</strong> 个项目吗？</p>
          <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
        </div>
        <div class="flex gap-3">
          <button :class="btnSecondary + ' flex-1'" @click="showDeleteModal = false">取消</button>
          <button :class="btnDestructive + ' flex-1'" @click="handleDeleteConfirm">确认</button>
        </div>
      </div>
    </div>

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
import { enhancedApiClient } from '@/lib/apiClient'
import { showAlert } from '@/lib/dialogService'
import { FileCode, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { getVarietyByCode } from '@/services/cropVarietyService'
import { getTechSolutionApprovals } from '@/services/techSolutionService'
import TechSolutionFilters from './components/TechSolutionFilters.vue'
import TechSolutionTable from './components/TechSolutionTable.vue'
import TechSolutionDetailModal from './modals/TechSolutionDetailModal.vue'
import TechSolutionEditModal from './modals/TechSolutionEditModal.vue'
import TechSolutionCreateModal from './modals/TechSolutionCreateModal.vue'
import TechSolutionBatchEditModal from './modals/TechSolutionBatchEditModal.vue'
import ExportFormatModal from './modals/ExportFormatModal.vue'

// ==================== 样式常量 ====================
const btnBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 h-8 rounded-md px-3 text-xs`
const btnDestructive = `${btnBase} bg-red-600 text-white hover:bg-red-700 h-8 rounded-md px-3 text-xs`
const btnGhost = `${btnBase} hover:bg-gray-100 hover:text-gray-900`

// ==================== 常量 ====================
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
]

// ==================== Store ====================
const techSolutionStore = useTechSolutionStore()
const approvalStore = useApprovalStore()
const { solutions: techSolutions } = storeToRefs(techSolutionStore)
const { fetchSolutions, addSolution, updateSolution, deleteSolutions } = techSolutionStore

// ==================== 过滤器 ====================
const filters = ref({
  code: '',
  cropFilter: '全部',
  author: '',
  status: '全部',
  startDate: '',
  endDate: '',
})
const currentPage = ref(1)
const pageSize = ref(10)

// ==================== 操作人员选项 ====================
const operatorOptions = ref<{ value: string; label: string }[]>([])

async function loadOperators() {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch('/api/dictionary/dictionaries?category=operator', { headers })
    let options: { value: string; label: string }[] = []
    if (response.ok) {
      const rawData = await response.json()
      let data: any[] = []
      if (Array.isArray(rawData)) data = rawData
      else if (Array.isArray(rawData?.data)) data = rawData.data
      else if (Array.isArray(rawData?.result)) data = rawData.result
      options = data.map((d: any) => ({
        value: d.dict_label || d.name,
        label: d.dict_label || d.name,
      }))
    }
    if (options.length === 0) {
      options = [
        { value: '陆启闯', label: '陆启闯' },
        { value: '郭靖', label: '郭靖' },
        { value: '黄蓉', label: '黄蓉' },
        { value: '张无忌', label: '张无忌' }
      ]
    }
    operatorOptions.value = options
  } catch (error) {
    operatorOptions.value = [
      { value: '陆启闯', label: '陆启闯' },
      { value: '郭靖', label: '郭靖' },
      { value: '黄蓉', label: '黄蓉' },
      { value: '张无忌', label: '张无忌' }
    ]
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadOperators()
  fetchSolutions()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleFocus)
})

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchSolutions()
  }
}

const handleFocus = () => {
  fetchSolutions()
}

// ==================== 计算属性 ====================
const cropOptions = computed(() => {
  return Array.from(new Set(techSolutions.value.map((t: any) => t.crop).filter(Boolean)))
})

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

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pages: (number | string)[] = []
  const showEllipsis = total > 7
  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    if (total > 1) pages.push(total)
  }
  return pages
})

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
const selectedRows = ref<(string | number)[]>([])
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
})

const editedTechCodes = ref<string[]>([])
const editedTechs = ref<Record<string, any>>({})

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

const generateCode = () => {
  return `T${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}

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
  } catch {
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
    planDetailFileName: tech.planDetailFileName || '',
    isValid: tech.isValid || '有效',
    lastSubmitTime: new Date().toISOString().split('T')[0],
  }
  editModalOpen.value = true
}

const handleEditSubmit = async () => {
  if (!selectedTech.value) return
  const updateData = {
    solutionTitle: editForm.value.title,
    cropName: editForm.value.crop,
    cropCode: editForm.value.cropCode,
    plantingMode: editForm.value.plantingMode,
    stage: editForm.value.stage,
    scopeNames: editForm.value.scopes,
    version: editForm.value.version,
    content: editForm.value.content,
    remarks: editForm.value.remarks,
    relatedBatchCode: selectedTech.value.relatedBatchCode || '',
    planDetailFileName: selectedTech.value.planDetailFileName || '',
    priority: selectedTech.value.priority || 'normal',
    isValid: editForm.value.isValid,
    lastSubmitTime: editForm.value.lastSubmitTime || new Date().toISOString().split('T')[0],
  }
  try {
    await updateSolution(selectedTech.value.id, updateData)
    editModalOpen.value = false
  } catch (error) {
    console.error('更新技术方案失败:', error)
    await showAlert('更新失败，请重试')
  }
}

const handleCreateSubmit = async (submitMode: 'draft' | 'submit') => {
  const today = new Date().toISOString().split('T')[0]
  const techSolutionData = {
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
        description: `作物：${newPlanForm.value.crop}\n种植模式：${newPlanForm.value.plantingMode}\n适用范围：${newPlanForm.value.scopes?.join('、') || newPlanForm.value.stage}`,
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
          stage: newPlanForm.value.scopes?.join('、') || newPlanForm.value.stage,
          version: newPlanForm.value.version || 'V1.0',
        },
      }
      await enhancedApiClient.post('/approvals', approvalData)
      await approvalStore.refreshApprovals()
    }
    createModalOpen.value = false
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
    console.error('创建技术方案失败:', error)
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
    selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
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
  const headers = ['方案编号', '关联生产计划批次', '方案标题', '作物品种', '种植模式', '适用范围', '版本', '编制人', '创建日期', '最后提交时间', '审核人', '审批状态', '状态', '方案是否有效']
  const exportData = selectedData.map((row: any) => ({
    '方案编号': row.code,
    '关联生产计划批次': row.relatedBatchCode || '-',
    '方案标题': row.title,
    '作物品种': row.crop,
    '种植模式': row.plantingMode,
    '适用范围': row.stage,
    '版本': row.version,
    '编制人': row.author,
    '创建日期': row.createDate,
    '最后提交时间': row.lastSubmitTime ? row.lastSubmitTime.slice(0, 10) : '-',
    '审核人': row.approver,
    '审批状态': row.approveStatus,
    '状态': row.status,
    '方案是否有效': row.isValid || '有效'
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map((row: any) =>
      headers.map((h: string) => `"${row[h as keyof typeof row] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h: string) => `<th>${h}</th>`).join('')}</tr>${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h as keyof typeof row] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
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
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要删除的数据')
    return
  }
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  const selectedIds = techSolutions.value
    .filter((t: any) => selectedRows.value.includes(t.id))
    .map((t: any) => t.id)
  try {
    await deleteSolutions(selectedIds)
  } catch (error) {
    console.error('删除技术方案失败:', error)
    await showAlert('删除失败，请重试')
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
  editedTechCodes.value = []
  editedTechs.value = {}
  showBatchEditModal.value = true
}

const saveBatchEdit = async () => {
  try {
    for (const tech of techSolutions.value) {
      const edited = editedTechs.value[tech.code]
      if (edited) {
        await updateSolution(tech.id, {
          solutionTitle: edited.title ?? tech.title,
          cropName: edited.crop ?? tech.crop,
          plantingMode: edited.plantingMode ?? tech.plantingMode,
          stage: edited.stage ?? tech.stage,
          version: edited.version ?? tech.version,
          content: edited.content ?? tech.content,
          relatedBatchCode: tech.relatedBatchCode || '',
          planDetailFileName: (edited.planDetailFileName ?? tech.planDetailFileName) || '',
          priority: tech.priority || 'normal',
          remarks: '',
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
  const content = `# ${tech.title}\n\n方案编号：${tech.code}\n作物品种：${tech.crop}\n种植模式：${tech.plantingMode}\n适用范围：${tech.stage}\n版本：${tech.version}\n编制人：${tech.author}\n创建日期：${tech.createDate}\n\n---方案内容---\n${tech.content}`
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

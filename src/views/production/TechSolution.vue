<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <Document />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">技术方案列表</h1>
          <p class="text-gray-500">种植技术方案的管理与发布</p>
        </div>
      </div>
    </div>

    <!-- 筛选表单 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 方案编号 -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">方案编号</label>
          <el-input
            v-model="code"
            placeholder="请输入方案编号"
            clearable
          />
        </div>

        <!-- 作物 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">作物</label>
          <el-select v-model="cropFilter" placeholder="请选择">
            <el-option label="全部" value="全部" />
            <el-option label="番茄" value="番茄" />
            <el-option label="黄瓜" value="黄瓜" />
            <el-option label="草莓" value="草莓" />
            <el-option label="辣椒" value="辣椒" />
          </el-select>
        </div>

        <!-- 编制人 -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">编制人</label>
          <el-input
            v-model="author"
            placeholder="请输入编制人"
            clearable
          />
        </div>

        <!-- 状态 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">状态</label>
          <el-select v-model="status" placeholder="请选择">
            <el-option label="全部" value="全部" />
            <el-option label="已发布" value="已发布" />
            <el-option label="草稿" value="草稿" />
            <el-option label="审核中" value="审核中" />
          </el-select>
        </div>

        <!-- 开始日期 -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">开始日期</label>
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="请选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>

        <!-- 结束日期 -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-500 mb-1">结束日期</label>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="请选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 技术方案列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">技术方案列表</h3>
        <div class="flex gap-2">
          <el-button v-if="canCreate" type="primary" @click="handleOpenCreateModal">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" type="warning" @click="handleBatchEdit">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" type="danger" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport" type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="paginatedData" stripe>
        <el-table-column v-if="batchEditMode || batchDeleteMode || exportMode" type="selection" width="50" />

        <el-table-column prop="code" label="方案编号" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewClick(row)">
              {{ row.code }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="relatedBatchCode" label="关联生产计划批次" width="180">
          <template #default="{ row }">
            {{ row.relatedBatchCode || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="title" label="方案标题" min-width="150">
          <template #default="{ row }">
            <el-button link type="success" @click="handleTitleClick(row)">
              {{ row.title }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="crop" label="作物品种" width="100" />

        <el-table-column prop="plantingMode" label="种植模式" width="100" />

        <el-table-column prop="stage" label="适用范围" width="100" />

        <el-table-column prop="version" label="版本" width="80" />

        <el-table-column prop="author" label="编制人" width="100" />

        <el-table-column prop="createDate" label="创建日期" width="120" />

        <el-table-column prop="lastSubmitTime" label="最后提交时间" width="140">
          <template #default="{ row }">
            {{ row.lastSubmitTime ? row.lastSubmitTime.slice(0, 10) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="approver" label="审核人" width="100" />

        <el-table-column prop="approveStatus" label="审批状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.approveStatus === '已审批' ? 'success' : 'warning'" size="small">
              {{ row.approveStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.statusClass)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="isValid" label="方案是否有效" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isValid === '作废' ? 'danger' : 'success'" size="small">
              {{ row.isValid || '有效' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="planDetailFileName" label="方案详情文件" width="150">
          <template #default="{ row }">
            <span v-if="!row.planDetailFileName" class="text-gray-400">-</span>
            <el-button v-else link type="primary" size="small">
              {{ row.planDetailFileName }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button link type="primary" size="small" @click="handleEditClick(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteRow(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select v-model="pageSize" style="width: 80px" @change="handlePageSizeChange">
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">共 {{ filteredTechSolutions.length }} 条</span>
          <el-button :disabled="currentPage === 1" size="small" @click="currentPage--">
            上一页
          </el-button>
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <el-button :disabled="currentPage >= totalPages" size="small" @click="currentPage++">
            下一页
          </el-button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <TechDetailModal
      v-if="selectedTech"
      v-model:visible="viewModalOpen"
      :tech="selectedTech"
    />

    <!-- 编辑弹窗 -->
    <TechEditModal
      v-if="selectedTech"
      v-model:visible="editModalOpen"
      :tech="selectedTech"
      @success="handleEditSuccess"
    />

    <!-- 创建弹窗 -->
    <TechCreateModal
      v-model:visible="createModalOpen"
      @success="handleCreateSuccess"
    />

    <!-- 删除确认弹窗 -->
    <DeleteWarningModal
      :is-open="showDeleteModal"
      :selected-count="selectedRows.length"
      @confirm="handleDeleteConfirm"
      @close="showDeleteModal = false"
    />

    <!-- 导出格式弹窗 -->
    <ExportFormatModal
      :is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @change="exportFormat = $event"
      @confirm="handleDoExport"
      @close="showExportModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Download, Document } from '@element-plus/icons-vue'
import TechDetailModal from '@/components/techSolution/TechDetailModal.vue'
import TechEditModal from '@/components/techSolution/TechEditModal.vue'
import TechCreateModal from '@/components/techSolution/TechCreateModal.vue'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { useTechSolutionStore } from '@/stores/modules/techSolution'
import {  TechSolution  } from '@/components/techSolution/types'
import dayjs from 'dayjs'

// 权限检查
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)

// Store
const techSolutionStore = useTechSolutionStore()

// 筛选状态
const code = ref('')
const cropFilter = ref('全部')
const author = ref('')
const status = ref('全部')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 模式状态
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const showDeleteModal = ref(false)
const showExportModal = ref(false)

// 选中状态
const selectedRows = ref([])
const exportFormat = ref('excel')

// 弹窗状态
const viewModalOpen = ref(false)
const editModalOpen = ref(false)
const createModalOpen = ref(false)
const selectedTech = ref(null)

// 过滤后的技术方案数据
const filteredTechSolutions = computed(() => {
  return techSolutionStore.solutions.filter(tech => {
    if (code.value && !tech.code.toLowerCase().includes(code.value.toLowerCase())) {
      return false
    }
    if (cropFilter.value && cropFilter.value !== '全部' && tech.crop !== cropFilter.value) {
      return false
    }
    if (author.value && !tech.author.toLowerCase().includes(author.value.toLowerCase())) {
      return false
    }
    if (status.value && status.value !== '全部' && tech.status !== status.value) {
      return false
    }
    if (startDate.value && tech.createDate < startDate.value) {
      return false
    }
    if (endDate.value && tech.createDate > endDate.value) {
      return false
    }
    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredTechSolutions.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTechSolutions.value.slice(start, end)
})

// 加载数据
onMounted(async () => {
  await techSolutionStore.fetchSolutions()
})

const getStatusType = (statusClass) => {
  if (statusClass === 'normal') return 'success'
  if (statusClass === 'pending') return 'warning'
  return 'info'
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  code.value = ''
  cropFilter.value = '全部'
  author.value = ''
  status.value = '全部'
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const handleViewClick = (tech) => {
  selectedTech.value = tech
  viewModalOpen.value = true
}

const handleTitleClick = (tech) => {
  selectedTech.value = tech
  viewModalOpen.value = true
}

const handleCloseViewModal = () => {
  viewModalOpen.value = false
  selectedTech.value = null
}

const handleEditClick = (tech) => {
  if (tech.isValid === '作废') {
    ElMessage.warning('该方案已作废，无法编辑')
    return
  }
  selectedTech.value = tech
  editModalOpen.value = true
}

const handleEditSuccess = async () => {
  editModalOpen.value = false
  await techSolutionStore.fetchSolutions()
}

const handleOpenCreateModal = () => {
  createModalOpen.value = true
}

const handleCreateSuccess = async () => {
  createModalOpen.value = false
  await techSolutionStore.fetchSolutions()
}

const handleBatchEdit = () => {
  batchEditMode.value = true
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  showDeleteModal.value = true
}

const handleDeleteRow = (tech) => {
  selectedRows.value = [tech.id]
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  try {
    const selectedIds = techSolutionStore.solutions
      .filter(t => selectedRows.value.includes(t.id))
      .map(t => t.id)
    await techSolutionStore.deleteSolutions(selectedIds)
    ElMessage.success('删除成功')
    selectedRows.value = []
  } catch (error) {
    console.error('删除技术方案失败:', error)
    ElMessage.error('删除失败，请重试')
  }
  showDeleteModal.value = false
}

const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleDoExport = async () => {
  const selectedData = techSolutionStore.solutions.filter(t => selectedRows.value.includes(t.id))
  const headers = ['方案编号', '关联生产计划批次', '方案标题', '作物品种', '种植模式', '适用范围', '版本', '编制人', '创建日期', '最后提交时间', '审核人', '审批状态', '状态', '方案是否有效']
  const exportData = selectedData.map(row => ({
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

  const fileName = `技术方案_${dayjs().format('YYYY-MM-DD')}.${extension}`

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  showExportModal.value = false
  selectedRows.value = []
}
</script>

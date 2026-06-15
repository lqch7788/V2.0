<template>
  <div class="space-y-6">
    <!-- 筛选栏 -->
    <WorkLogFilters
      :filters="filters"
      @update:filters="handleFiltersChange"
      @search="handleSearch"
    />

    <!-- 数据表格 -->
    <WorkLogTable
      :data="filteredData"
      :pagination="pagination"
      :show-checkbox="exportMode || batchEditMode || batchDeleteMode"
      :export-mode="exportMode"
      :batch-edit-mode="batchEditMode"
      :batch-delete-mode="batchDeleteMode"
      :selected-rows="selectedRows"
      :on-add-click="(!exportMode && !batchEditMode && !batchDeleteMode) ? handleAdd : null"
      :on-batch-edit-click="exportMode ? null : (batchEditMode ? handleBatchEdit : () => enterBatchMode('edit'))"
      :on-batch-delete-click="exportMode ? null : handleEnterBatchDelete"
      :on-export-click="(batchEditMode || batchDeleteMode) ? null : (exportMode ? handleConfirmExport : enterExportMode)"
      @view-detail="handleViewDetail"
      @update:selected-rows="setSelectedRows"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />

    <!-- 批量操作提示栏 -->
    <div
      v-if="batchEditMode || batchDeleteMode || exportMode"
      class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
    >
      <div class="text-sm text-gray-600">
        已选择 <strong class="text-emerald-600">{{ selectedRows.length }}</strong> 项
        <template v-if="batchEditMode">（点击批量编辑进入编辑模式）</template>
        <template v-if="batchDeleteMode">（仅待执行状态可删除）</template>
      </div>
      <div class="flex gap-2">
        <template v-if="batchEditMode">
          <el-button
            size="small"
            type="primary"
            :disabled="selectedRows.length === 0"
            @click="handleBatchEdit"
          >
            批量编辑
          </el-button>
          <el-button size="small" @click="cancelBatchMode">取消</el-button>
        </template>
        <template v-if="batchDeleteMode">
          <el-button
            size="small"
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            确认删除
          </el-button>
          <el-button size="small" @click="cancelBatchMode">取消</el-button>
        </template>
        <template v-if="exportMode">
          <el-button
            size="small"
            type="primary"
            :disabled="selectedRows.length === 0"
            @click="handleConfirmExport"
          >
            确认导出
          </el-button>
          <el-button size="small" @click="cancelBatchMode">取消</el-button>
        </template>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <WorkLogDetailModal
      :log="selectedLog"
      :open="isDetailOpen"
      @close="isDetailOpen = false"
    />

    <!-- 表单弹窗（新建/编辑） -->
    <WorkLogFormModal
      :log="selectedLog"
      :open="isFormOpen"
      @close="isFormOpen = false"
      @save="handleSave"
    />

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteWarning"
      title="删除工作日志警告"
      width="450px"
      :close-on-click-modal="false"
    >
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <span class="text-red-600 text-2xl font-bold">!</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">删除工作日志警告</h3>
        </div>
      </div>
      <div class="text-sm text-gray-600 space-y-3">
        <p>确定要删除选中的 <strong>{{ selectedRows.length }}</strong> 个工作日志吗？</p>
        <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
      </div>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleDeleteConfirm">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog
      v-model="showExportModal"
      title="选择导出格式"
      width="500px"
      :close-on-click-modal="false"
    >
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <label
          v-for="fmt in exportFormats"
          :key="fmt.value"
          :class="exportFormat === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400'"
          class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
          @click="exportFormat = fmt.value"
        >
          <div
            :class="exportFormat === fmt.value ? 'border-emerald-600' : 'border-gray-400'"
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          >
            <div v-if="exportFormat === fmt.value" class="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ fmt.label }}</p>
            <p class="text-xs text-gray-500">{{ fmt.desc }}</p>
          </div>
        </label>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <WorkLogBatchEditModal
      :is-open="showBatchEditModal"
      :selected-rows="selectedRows"
      :logs="filteredData"
      @close="showBatchEditModal = false"
      @confirm="handleBatchEditConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import WorkLogFilters from './WorkLogFilters.vue'
import WorkLogTable from './WorkLogTable.vue'
import WorkLogDetailModal from './WorkLogDetailModal.vue'
import WorkLogFormModal from './WorkLogFormModal.vue'
import WorkLogBatchEditModal from './WorkLogBatchEditModal.vue'
import { useWorkLogStore } from '@/stores/modules/workLog.js'

const store = useWorkLogStore()

// 筛选条件
const filters = ref({
  date: '',
  worker: '',
  greenhouse: '全部',
})

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 详情/表单弹窗
const selectedLog = ref(null)
const isDetailOpen = ref(false)
const isFormOpen = ref(false)

// 批量操作状态
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const showBatchEditModal = ref(false)

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
]

// 筛选后的数据
const filteredData = computed(() => {
  let data = store.workLogs
  if (filters.value.date) {
    data = data.filter(log => log.date === filters.value.date)
  }
  if (filters.value.worker) {
    data = data.filter(log => log.worker.includes(filters.value.worker))
  }
  if (filters.value.greenhouse && filters.value.greenhouse !== '全部') {
    data = data.filter(log => log.greenhouse === filters.value.greenhouse)
  }
  return data
})

// 同步分页总数（在 computed 外避免副作用警告）
watch(filteredLogs, (val) => {
  pagination.value.total = val.length
})

// 查看详情
function handleViewDetail(log) {
  selectedLog.value = log
  isDetailOpen.value = true
}

// 新建日志
function handleAdd() {
  selectedLog.value = null
  isFormOpen.value = true
}

// 搜索
function handleSearch() {
  pagination.value.currentPage = 1
}

// 筛选条件变更
function handleFiltersChange(newFilters) {
  filters.value = newFilters
  pagination.value.currentPage = 1
}

// 分页
function handlePageChange(page) {
  pagination.value.currentPage = page
}

function handlePageSizeChange(size) {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

// 保存日志
function handleSave(data) {
  if (data.id) {
    store.updateWorkLog(data.id, data)
  } else {
    store.addWorkLog(data)
  }
  isFormOpen.value = false
}

// 设置选中行
function setSelectedRows(ids) {
  selectedRows.value = ids
}

// 批量模式
function enterBatchMode(mode) {
  if (mode === 'edit') {
    batchEditMode.value = true
    batchDeleteMode.value = false
    exportMode.value = false
  }
  selectedRows.value = []
}

function enterExportMode() {
  exportMode.value = true
  batchEditMode.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
}

function handleEnterBatchDelete() {
  batchDeleteMode.value = true
  batchEditMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

function cancelBatchMode() {
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 批量删除
function handleBatchDelete() {
  showDeleteWarning.value = true
}

function handleDeleteConfirm() {
  selectedRows.value.forEach(id => store.deleteWorkLog(id))
  selectedRows.value = []
  showDeleteWarning.value = false
  batchDeleteMode.value = false
  ElMessage.success('删除成功')
}

// 导出
function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

function handleDoExport() {
  const selectedData = filteredData.value.filter(log => selectedRows.value.includes(log.id))
  const headers = ['日志编号', '日期', '工人', '天气', '温度', '作物', '大棚', '生长状况', '工作内容', '问题描述', '处理措施']
  const exportData = selectedData.map(row => ({
    '日志编号': row.code,
    '日期': row.date,
    '工人': row.worker,
    '天气': row.weather,
    '温度': row.temperature,
    '作物': row.crop,
    '大棚': row.greenhouse,
    '生长状况': row.growthStatus,
    '工作内容': row.tasks,
    '问题描述': row.problems,
    '处理措施': row.solutions,
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

  const fileName = `工作日志_${new Date().toISOString().slice(0, 10)}.${extension}`
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
  ElMessage.success('导出成功')
}

// 批量编辑
function handleBatchEdit() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的日志')
    return
  }
  showBatchEditModal.value = true
}

function handleBatchEditConfirm(edited) {
  Object.entries(edited).forEach(([code, updates]) => {
    const log = store.workLogs.find(l => l.code === code)
    if (log) {
      store.updateWorkLog(log.id, updates)
    }
  })
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  ElMessage.success('批量编辑完成')
}
</script>

<!--
  人效分析页面（V1.1 风格 1:1 重写）
  对标 V1.1 src/components/labor/efficiency/EfficiencyPage.tsx (200+ 行)
  功能：完整集成 Dashboard + Chart + Table + Filters + 批量操作 + 导出
-->
<template>
  <div class="space-y-4">
    <!-- 筛选栏 -->
    <EfficiencyFilters
      :filters="filters"
      :departments="departments"
      @change="updateFilters"
      @reset="handleReset"
    />

    <!-- 统计卡片 -->
    <EfficiencyDashboard :metrics="summaryMetrics" />

    <!-- 趋势图 -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">人效趋势</h3>
      <EfficiencyChart :data="trendData" :height="350" />
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 flex items-center justify-between border-b">
        <div class="flex items-center gap-2">
          <el-button v-if="!batchEditMode && !batchDeleteMode && !exportMode" @click="handleExportClick">
            <el-icon><Download /></el-icon>导出
          </el-button>
          <el-button v-if="!batchEditMode && !batchDeleteMode && !exportMode" @click="handleBatchEditClick">
            <el-icon><EditPen /></el-icon>批量编辑
          </el-button>
          <el-button v-if="!batchEditMode && !batchDeleteMode && !exportMode" type="danger" @click="handleBatchDeleteClick">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button v-if="exportMode" type="primary" @click="handleConfirmExport">确认导出</el-button>
          <el-button v-if="batchEditMode" type="primary" @click="setShowBatchEditModal(true)">确认编辑</el-button>
          <el-button v-if="batchDeleteMode" type="danger" @click="setShowDeleteWarning(true)">确认删除</el-button>
          <el-button v-if="batchEditMode || batchDeleteMode || exportMode" @click="handleCancelBatch">取消</el-button>
          <el-button v-if="!batchEditMode && !batchDeleteMode && !exportMode" type="primary" @click="setShowAddModal(true)">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
      </div>
      <EfficiencyTable
        :data="data"
        :batch-edit-mode="batchEditMode"
        :batch-delete-mode="batchDeleteMode"
        :export-mode="exportMode"
        :selected-rows="selectedRows"
        @view="handleViewDetail"
        @select-all="handleSelectAll"
        @select-row="handleSelectRow"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <EfficiencyFormModal v-model="showAddModal" @submit="handleAdd" />
    <EfficiencyFormModal v-model="showEditModal" :record="editingRecord" @submit="handleUpdate" />
    <EfficiencyBatchEditModal v-model="showBatchEditModal" @confirm="handleBatchEditConfirm" />
    <DeleteWarningModal v-model="showDeleteWarning" @confirm="handleConfirmDelete" />
    <ExportFormatModal v-model="showExportModal" @confirm="handleDoExport" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Delete, Download, EditPen, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEfficiency } from '../composables/useEfficiency'
import EfficiencyFilters from './EfficiencyFilters.vue'
import EfficiencyDashboard from './EfficiencyDashboard.vue'
import EfficiencyChart from './EfficiencyChart.vue'
import EfficiencyTable from './EfficiencyTable.vue'
import EfficiencyFormModal from './EfficiencyFormModal.vue'
import EfficiencyBatchEditModal from './EfficiencyBatchEditModal.vue'
import DeleteWarningModal from './DeleteWarningModal.vue'
import ExportFormatModal from './ExportFormatModal.vue'

const { data, trendData, summaryMetrics, filters, departments, updateFilters } = useEfficiency()

const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const editingRecord = ref(null)
const selectedRows = ref([])

const handleReset = () => updateFilters({ startDate: '2023-05', endDate: '2024-04', department: '全部' })

const handleSelectAll = () => {
  if (selectedRows.value.length === data.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = data.value.map((d) => d.id)
  }
}

const handleSelectRow = (id) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter((r) => r !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const handleViewDetail = (record) => {
  editingRecord.value = record
  showEditModal.value = true
}

const handleExportClick = () => { exportMode.value = true; selectedRows.value = [] }
const handleBatchEditClick = () => { batchEditMode.value = true }
const handleBatchDeleteClick = () => { batchDeleteMode.value = true }
const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleDoExport = () => {
  const selectedData = data.value.filter((d) => selectedRows.value.includes(d.id))
  const headers = ['月份', '部门', '总人数', '总产出', '人均产出', '总工时', '工时效率', '任务达成率', '出勤率', '人工成本率', '技能覆盖率']
  const exportData = selectedData.map((row) => ({
    '月份': row.date,
    '部门': row.department,
    '总人数': row.totalWorkers,
    '总产出': row.totalOutput,
    '人均产出': row.avgOutputPerWorker.toFixed(1),
    '总工时': row.totalHours,
    '工时效率': `${(row.avgEfficiency * 100).toFixed(1)}%`,
    '任务达成率': `${(row.taskCompletionRate * 100).toFixed(1)}%`,
    '出勤率': `${(row.attendanceRate * 100).toFixed(1)}%`,
    '人工成本率': `${(row.laborCostRate * 100).toFixed(1)}%`,
    '技能覆盖率': `${(row.skillCoverage * 100).toFixed(1)}%`,
  }))

  const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${exportData.map((row) => `<tr>${headers.map((h) => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `人效分析_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
  ElMessage.success('导出成功')
}

const handleCancelBatch = () => {
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

const handleBatchEditConfirm = () => {
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  ElMessage.success('批量编辑成功')
}

const handleConfirmDelete = () => {
  showDeleteWarning.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
  ElMessage.success('批量删除成功')
}

const setShowBatchEditModal = (val) => { showBatchEditModal.value = val }
const setShowAddModal = (val) => { showAddModal.value = val }
const setShowDeleteWarning = (val) => { showDeleteWarning.value = val }

const handleAdd = (form) => {
  ElMessage.success('新增成功')
  showAddModal.value = false
}

const handleUpdate = (form) => {
  ElMessage.success('更新成功')
  showEditModal.value = false
  editingRecord.value = null
}
</script>
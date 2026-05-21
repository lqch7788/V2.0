<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white">
            <Sprout />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">育苗管理</h1>
          <p class="text-gray-500">管理种苗培育、生长记录和移栽操作</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <SeedlingStats :data="statsData" />

    <!-- 筛选工具栏 -->
    <SeedlingFilter
      :filters="filters"
      :seedling-types="seedlingTypes"
      :sites="sites"
      :status-options="statusOptions"
      @update:filters="handleFiltersChange"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <div v-loading="loading">
      <SeedlingTable
        :data="filteredData"
        :pagination="pagination"
        :selected-rows="selectedRows"
        :loading="loading"
        :export-mode="exportMode"
        :can-create="canCreate"
        :can-edit="canEdit"
        :can-delete="canDelete"
        :can-export="canExport"
        :can-print="canPrint"
        @add="handleAdd"
        @edit="handleEdit"
        @detail="handleDetail"
        @daily-record="handleDailyRecord"
        @transplant="handleTransplant"
        @print="handlePrint"
        @delete="handleDelete"
        @export="handleExportClick"
        @confirm-export="handleExportClickConfirm"
        @cancel-export="handleExportCancel"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 弹窗 -->
    <AddModal
      v-model:visible="addModalVisible"
      @success="loadItems"
    />

    <EditModal
      v-if="currentRecord"
      v-model:visible="editModalVisible"
      :record="currentRecord"
      @success="loadItems"
    />

    <DetailModal
      v-if="currentRecord"
      v-model:visible="detailModalVisible"
      :record="currentRecord"
    />

    <DailyRecordModal
      v-if="currentRecord"
      v-model:visible="dailyRecordModalVisible"
      :record="currentRecord"
      @success="loadItems"
    />

    <TransplantModal
      v-if="currentRecord"
      v-model:visible="transplantModalVisible"
      :record="currentRecord"
      @success="loadItems"
    />

    <PrintLabelModal
      v-if="currentRecord"
      v-model:visible="printModalVisible"
      :record="currentRecord"
    />

    <ImageLightboxModal
      v-model:visible="lightboxVisible"
      :images="currentImages"
    />

    <ExportFormatModal
      v-model:visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @confirm="handleConfirmExport"
      @update:export-file-type="exportFormat = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Crop } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SeedlingStats from '@/components/farm/seedling/components/SeedlingStats.vue'
import SeedlingFilter from '@/components/farm/seedling/components/SeedlingFilter.vue'
import SeedlingTable from '@/components/farm/seedling/components/SeedlingTable.vue'
import AddModal from '@/components/farm/seedling/modals/AddModal.vue'
import EditModal from '@/components/farm/seedling/modals/EditModal.vue'
import DetailModal from '@/components/farm/seedling/modals/DetailModal.vue'
import DailyRecordModal from '@/components/farm/seedling/modals/DailyRecordModal.vue'
import TransplantModal from '@/components/farm/seedling/modals/TransplantModal.vue'
import PrintLabelModal from '@/components/farm/seedling/modals/PrintLabelModal.vue'
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { useSeedlingStore, useSeedSourceStore } from '@/stores'
import {  Seedling, SeedlingFilters  } from '@/types/crop'

// Store
const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()

// 权限 - 已取消，所有人可使用所有功能
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)
const canPrint = ref(true)

// 数据
const loading = computed(() => seedlingStore.isLoading)
const items = computed(() => seedlingStore.items)

// 筛选条件
const filters = ref({
  cropName: '',
  seedlingCode: '',
  sourceCode: '',
  startDate: '',
  endDate: '',
  siteName: '',
  seedlingType: '',
  createBy: '',
  status: ''
})

// 分页
const pagination = ref({ current, pageSize: 10 })

// 选中行
const selectedRows = ref([])

// 导出模式
const exportMode = ref(false)
const exportFormat = ref('xlsx')
const showExportModal = ref(false)

// 弹窗状态
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const detailModalVisible = ref(false)
const dailyRecordModalVisible = ref(false)
const transplantModalVisible = ref(false)
const printModalVisible = ref(false)
const lightboxVisible = ref(false)

// 当前记录
const currentRecord = ref(null)
const currentImages = ref([])

// 静态选项数据
const seedlingTypes = [
  { value: '穴盘育苗', label: '穴盘育苗' },
  { value: '嫁接育苗', label: '嫁接育苗' },
  { value: '组培育苗', label: '组培育苗' },
  { value: '直播育苗', label: '直播育苗' }
]

const sites = [
  { value: '1号大棚', label: '1号大棚' },
  { value: '2号大棚', label: '2号大棚' },
  { value: '3号大棚', label: '3号大棚' },
  { value: '露天场地', label: '露天场地' }
]

const statusOptions = [
  { value: 'in_progress', label: '进行中' },
  { value: 'transplant_ready', label: '待定植' },
  { value: 'completed', label: '已完成' },
  { value: 'abnormal', label: '异常' }
]

// 筛选后的数据
const filteredData = computed(() => {
  return items.value.filter(item => {
    if (filters.value.cropName && !item.cropName.includes(filters.value.cropName)) return false
    if (filters.value.seedlingCode && !item.seedlingCode.includes(filters.value.seedlingCode)) return false
    if (filters.value.sourceCode && !item.sourceCode.includes(filters.value.sourceCode)) return false
    if (filters.value.siteName && filters.value.siteName !== '__all__' && item.siteName !== filters.value.siteName) return false
    if (filters.value.seedlingType && filters.value.seedlingType !== '__all__' && item.seedlingType !== filters.value.seedlingType) return false
    if (filters.value.status && filters.value.status !== '__all__' && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.startDate < filters.value.startDate) return false
    if (filters.value.endDate && item.startDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy.includes(filters.value.createBy)) return false
    return true
  })
})

// 统计数据
const statsData = computed(() => {
  const total = items.value.length
  const inProgress = items.value.filter(s => s.status === 'in_progress').length
  const completed = items.value.filter(s => s.status === 'completed').length
  const monthCount = items.value.filter(item => {
    const date = new Date(item.createTime)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return { total, inProgress, completed, monthCount }
})

// 加载数据
const loadItems = async () => {
  await seedlingStore.loadItems()
}

// 事件处理
const handleFiltersChange = (newFilters) => {
  filters.value = newFilters
}

const handleSearch = () => {
  pagination.value.current = 1
}

const handleReset = () => {
  filters.value = {
    cropName: '',
    seedlingCode: '',
    sourceCode: '',
    startDate: '',
    endDate: '',
    siteName: '',
    seedlingType: '',
    createBy: '',
    status: ''
  }
  pagination.value.current = 1
}

const handleAdd = () => {
  currentRecord.value = null
  addModalVisible.value = true
}

const handleEdit = (record) => {
  currentRecord.value = record
  editModalVisible.value = true
}

const handleDetail = (record) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

const handleDailyRecord = (record) => {
  currentRecord.value = record
  dailyRecordModalVisible.value = true
}

const handleTransplant = (record) => {
  currentRecord.value = record
  transplantModalVisible.value = true
}

const handlePrint = (record) => {
  currentRecord.value = record
  printModalVisible.value = true
}

const handleDelete = async (ids) => {
  try {
    await seedlingStore.deleteItems(ids)
    ElMessage.success('删除成功')
    selectedRows.value = []
  } catch {
    ElMessage.error('删除失败')
  }
}

const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleExportClickConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

const handleConfirmExport = () => {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))
  // 导出逻辑
  const headers = ['育苗批号', '作物名称', '作物品种', '关联种源', '育苗方式', '场地', '开始日期', '预计结束', '初始数量', '成活数量', '已定植', '损耗数量', '成苗率', '状态', '创建人', '创建时间', '备注']
  const exportData = selectedData.map(record => ({
    '育苗批号': record.seedlingCode,
    '作物名称': record.cropName,
    '作物品种': record.cropVariety,
    '关联种源': record.sourceCode,
    '育苗方式': record.seedlingType,
    '场地': record.siteName,
    '开始日期': record.startDate,
    '预计结束': record.expectedEndDate || '',
    '初始数量': record.initialCount,
    '成活数量': record.survivalCount,
    '已定植': record.plantedCount,
    '损耗数量': record.lossCount,
    '成苗率': `${record.survivalRate}%`,
    '状态': record.status === 'in_progress' ? '进行中' : record.status === 'transplant_ready' ? '待定植' : record.status === 'completed' ? '已完成' : '异常',
    '创建人': record.createBy,
    '创建时间': record.createTime,
    '备注': record.remarks || ''
  }))

  let content = ''
  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${row[h] || ''}"`).join(',')
    ).join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `育苗管理_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `育苗管理_${new Date().toISOString().slice(0, 10)}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
  ElMessage.success('导出成功')
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handlePageChange = (page) => {
  pagination.value.current = page
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
}

// 初始化
onMounted(() => {
  loadItems()
})
</script>

<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white">
            <Goods />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">种源管理</h1>
          <p class="text-gray-500">管理种源批次、采购入库和库存记录</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <SeedSourceStats :data="statsData" />

    <!-- 筛选工具栏 -->
    <SeedSourceFilter
      :filters="filters"
      :crop-categories="cropCategories"
      :suppliers="suppliers"
      :status-options="statusOptions"
      @update:filters="handleFiltersChange"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <div v-loading="loading">
      <SeedSourceTable
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
import { Goods } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SeedSourceStats from '@/components/farm/seed-source/components/SeedSourceStats.vue'
import SeedSourceFilter from '@/components/farm/seed-source/components/SeedSourceFilter.vue'
import SeedSourceTable from '@/components/farm/seed-source/components/SeedSourceTable.vue'
import AddModal from '@/components/farm/seed-source/modals/AddModal.vue'
import EditModal from '@/components/farm/seed-source/modals/EditModal.vue'
import DetailModal from '@/components/farm/seed-source/modals/DetailModal.vue'
import PrintLabelModal from '@/components/farm/seed-source/modals/PrintLabelModal.vue'
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { useSeedSourceStore } from '@/stores'
import {  SeedSource, SeedSourceFilters  } from '@/types/crop'

// Store
const seedSourceStore = useSeedSourceStore()

// 权限 - 已取消，所有人可使用所有功能
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)
const canPrint = ref(true)

// 数据
const loading = computed(() => seedSourceStore.isLoading)
const items = computed(() => seedSourceStore.items)

// 筛选条件
const filters = ref({
  cropCategory: '',
  cropName: '',
  seedCode: '',
  sourceType: '',
  supplierName: '',
  startDate: '',
  endDate: '',
  status: '',
  createBy: ''
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
const printModalVisible = ref(false)
const lightboxVisible = ref(false)

// 当前记录
const currentRecord = ref(null)
const currentImages = ref([])

// 静态选项数据
const cropCategories = [
  { value: '蔬菜类', label: '蔬菜类' },
  { value: '茄果类', label: '茄果类' },
  { value: '瓜类', label: '瓜类' },
  { value: '叶菜类', label: '叶菜类' },
  { value: '豆类', label: '豆类' },
  { value: '根茎类', label: '根茎类' }
]

const suppliers = [
  { value: '寿光种业', label: '寿光种业' },
  { value: '农科院种业', label: '农科院种业' },
  { value: '山东蔬菜研究所', label: '山东蔬菜研究所' }
]

const statusOptions = [
  { value: 'sufficient', label: '充足' },
  { value: 'low', label: '不足' },
  { value: 'depleted', label: '耗尽' }
]

// 筛选后的数据
const filteredData = computed(() => {
  return items.value.filter(item => {
    if (filters.value.cropCategory && filters.value.cropCategory !== '__all__' && item.cropCategory !== filters.value.cropCategory) return false
    if (filters.value.cropName && !item.cropName.includes(filters.value.cropName)) return false
    if (filters.value.seedCode && !item.seedCode.includes(filters.value.seedCode)) return false
    if (filters.value.sourceType && filters.value.sourceType !== '__all__' && item.sourceType !== filters.value.sourceType) return false
    if (filters.value.supplierName && filters.value.supplierName !== '__all__' && !item.supplierName.includes(filters.value.supplierName)) return false
    if (filters.value.status && filters.value.status !== '__all__' && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.purchaseDate < filters.value.startDate) return false
    if (filters.value.endDate && item.purchaseDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy.includes(filters.value.createBy)) return false
    return true
  }).sort((a, b) => {
    const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
    const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
    return timeB - timeA
  })
})

// 统计数据
const statsData = computed(() => {
  const total = items.value.length
  const totalQuantity = items.value.reduce((sum, item) => sum + item.availableCount, 0)
  const monthCount = items.value.filter(item => {
    const date = new Date(item.createTime)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const alertCount = items.value.filter(item =>
    item.status === 'low' || item.status === 'depleted'
  ).length
  return { total, totalQuantity, monthCount, alertCount }
})

// 加载数据
const loadItems = async () => {
  await seedSourceStore.loadItems()
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
    cropCategory: '',
    cropName: '',
    seedCode: '',
    sourceType: '',
    supplierName: '',
    startDate: '',
    endDate: '',
    status: '',
    createBy: ''
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

const handlePrint = (record) => {
  currentRecord.value = record
  printModalVisible.value = true
}

const handleDelete = async (ids) => {
  try {
    await seedSourceStore.deleteItems(ids)
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
  const headers = ['种源批号', '种源类型', '作物类别', '作物品种', '供应商', '采购日期', '采购数量', '单位', '单价(元)', '总金额(元)', '初始数量', '可用数量', '库存状态', '创建人', '创建时间', '备注']
  const exportData = selectedData.map(record => ({
    '种源批号': record.seedCode,
    '种源类型': record.sourceType,
    '作物类别': record.cropCategory,
    '作物品种': record.cropVariety,
    '供应商': record.supplierName,
    '采购日期': record.purchaseDate,
    '采购数量': record.quantity,
    '单位': record.unit,
    '单价(元)': record.unitPrice,
    '总金额(元)': record.totalAmount,
    '初始数量': record.initialCount,
    '可用数量': record.availableCount,
    '库存状态': record.status === 'sufficient' ? '充足' : record.status === 'low' ? '不足' : '耗尽',
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
    a.download = `种源管理_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `种源管理_${new Date().toISOString().slice(0, 10)}.xls`
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

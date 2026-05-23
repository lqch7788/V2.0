<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" style="color: white;">
            <TrendCharts />
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

    <!-- 筛选组件 -->
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
        @label-manage="handleLabelManage"
        @image-click="handleImageClick"
        @end="handleEnd"
      />
    </div>

    <!-- 新增弹窗 -->
    <AddModal v-model:visible="addModalVisible" @success="loadItems" />

    <!-- 编辑弹窗 -->
    <EditModal
      v-if="currentRecord"
      v-model:visible="editModalVisible"
      :record="currentRecord"
      @success="loadItems"
    />

    <!-- 详情弹窗 -->
    <DetailModal
      v-if="currentRecord"
      v-model:visible="detailModalVisible"
      :record="currentRecord"
    />

    <!-- 每日记录弹窗 -->
    <DailyRecordModal
      v-if="currentRecord"
      v-model:visible="dailyRecordModalVisible"
      :record="currentRecord"
      @success="loadItems"
    />

    <!-- 定植弹窗 -->
    <TransplantModal
      v-if="currentRecord"
      v-model:visible="transplantModalVisible"
      :record="currentRecord"
      @success="loadItems"
    />

    <!-- 打印标签弹窗 -->
    <PrintLabelModal
      v-if="currentRecord"
      v-model:visible="printModalVisible"
      :record="currentRecord"
    />

    <!-- 图片预览弹窗 -->
    <ImageLightboxModal v-model:visible="lightboxVisible" :images="currentImages" />

    <!-- 标签管理弹窗 -->
    <SeedlingLabelManageModal
      v-if="labelManageRecord"
      v-model:visible="labelManageModalVisible"
      :seedling-id="labelManageRecord.id"
      :seedling-code="labelManageRecord.seedlingCode"
    />

    <!-- 导出格式选择弹窗 -->
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
/**
 * 育苗管理主页面
 */
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TrendCharts } from '@element-plus/icons-vue'
import SeedlingStats from '@/components/farm/seedling/components/SeedlingStats.vue'
import SeedlingFilter from '@/components/farm/seedling/components/SeedlingFilter.vue'
import SeedlingTable from '@/components/farm/seedling/components/SeedlingTable.vue'
import AddModal from '@/components/farm/seedling/modals/AddModal.vue'
import EditModal from '@/components/farm/seedling/modals/EditModal.vue'
import DetailModal from '@/components/farm/seedling/modals/DetailModal.vue'
import DailyRecordModal from '@/components/farm/seedling/modals/DailyRecordModal.vue'
import TransplantModal from '@/components/farm/seedling/modals/TransplantModal.vue'
import PrintLabelModal from '@/components/farm/seedling/modals/PrintLabelModal.vue'
import SeedlingLabelManageModal from '@/components/farm/seedling/modals/SeedlingLabelManageModal.vue'
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { useSeedlingStore } from '@/stores/modules/seedling'

// 权限检查 - 已取消，所有人可使用所有功能
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true
const canPrint = true

// Store
const seedlingStore = useSeedlingStore()

// 状态
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
const pagination = ref({ current: 1, pageSize: 10 })

// 选中的行
const selectedRows = ref([])

// 弹窗状态
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const detailModalVisible = ref(false)
const dailyRecordModalVisible = ref(false)
const transplantModalVisible = ref(false)
const printModalVisible = ref(false)
const lightboxVisible = ref(false)
const labelManageModalVisible = ref(false)
const showExportModal = ref(false)

// 当前操作的记录
const currentRecord = ref(null)
const currentImages = ref([])
const labelManageRecord = ref(null)

// 导出状态
const exportMode = ref(false)
const exportFormat = ref('excel')

// 育苗方式选项
const seedlingTypes = ref([
  { value: '穴盘育苗', label: '穴盘育苗' },
  { value: '嫁接育苗', label: '嫁接育苗' },
  { value: '组培育苗', label: '组培育苗' },
  { value: '直播育苗', label: '直播育苗' }
])

// 场地选项
const sites = ref([
  { value: '1号大棚', label: '1号大棚' },
  { value: '2号大棚', label: '2号大棚' },
  { value: '3号大棚', label: '3号大棚' },
  { value: '露天场地', label: '露天场地' }
])

// 状态选项
const statusOptions = ref([
  { value: 'in_progress', label: '进行中' },
  { value: 'transplant_ready', label: '待定植' },
  { value: 'completed', label: '已完成' },
  { value: 'abnormal', label: '异常' }
])

// 筛选后的数据
const filteredData = computed(() => {
  return items.value.filter(item => {
    // 使用 startsWith 替代 includes，避免误匹配
    if (filters.value.cropName && filters.value.cropName !== '__all__' && !item.cropName?.startsWith(filters.value.cropName)) return false
    if (filters.value.seedlingCode && !item.seedlingCode?.startsWith(filters.value.seedlingCode)) return false
    if (filters.value.sourceCode && !item.sourceCode?.startsWith(filters.value.sourceCode)) return false
    if (filters.value.siteName && filters.value.siteName !== '__all__' && item.siteName !== filters.value.siteName) return false
    if (filters.value.seedlingType && filters.value.seedlingType !== '__all__' && item.seedlingType !== filters.value.seedlingType) return false
    if (filters.value.status && filters.value.status !== '__all__' && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.startDate < filters.value.startDate) return false
    if (filters.value.endDate && item.startDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy?.startsWith(filters.value.createBy)) return false
    return true
  })
})

// 统计卡片数据
const statsData = computed(() => {
  const total = items.value.length
  const inProgress = items.value.filter(s => s.status === 'in_progress').length
  const completed = items.value.filter(s => s.status === 'completed').length
  const monthCount = items.value.filter(s => {
    const date = new Date(s.createTime)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return { total, inProgress, completed, monthCount }
})

// 加载数据
const loadItems = async () => {
  await seedlingStore.loadItems()
}

// 处理筛选条件变化
const handleFiltersChange = (newFilters) => {
  filters.value = { ...newFilters }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
}

// 重置
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

// 新增
const handleAdd = () => {
  currentRecord.value = null
  addModalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  currentRecord.value = record
  editModalVisible.value = true
}

// 详情
const handleDetail = (record) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

// 每日记录
const handleDailyRecord = (record) => {
  currentRecord.value = record
  dailyRecordModalVisible.value = true
}

// 定植
const handleTransplant = (record) => {
  currentRecord.value = record
  transplantModalVisible.value = true
}

// 打印
const handlePrint = (record) => {
  currentRecord.value = record
  printModalVisible.value = true
}

// 删除
const handleDelete = async (ids) => {
  try {
    await ElMessageBox.confirm('确定要删除选中的育苗记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const success = await seedlingStore.deleteItems(ids)
    if (success) {
      ElMessage.success('删除成功')
      selectedRows.value = []
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 导出点击
const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

// 取消导出
const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

// 确认导出
const handleExportClickConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 分页变化
const handlePageChange = (page) => {
  pagination.value.current = page
}

// 每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
}

// 标签管理
const handleLabelManage = (record) => {
  labelManageRecord.value = record
  labelManageModalVisible.value = true
}

// 图片预览
const handleImageClick = (images) => {
  currentImages.value = images
  lightboxVisible.value = true
}

// 结束计划
const handleEnd = async (record, endType) => {
  const planCode = record.productionPlanCode
  if (!planCode || planCode.trim() === '') {
    ElMessage.warning('该育苗没有关联的生产计划，无法结束')
    return
  }

  const completionRate = record.targetSurvivalCount > 0
    ? (record.survivalCount || 0) / record.targetSurvivalCount
    : 0
  const isNormal = endType === 'normal'
  const confirmMsg = isNormal
    ? `确认正常结束此生产计划？\n\n入库完成比例：${Math.round(completionRate * 100)}%\n结束后禁止一切入库和补录操作`
    : `确认异常结束此生产计划？\n\n入库完成比例：${Math.round(completionRate * 100)}%\n结束后如需补录，需提交审核申请`

  try {
    await ElMessageBox.confirm(confirmMsg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 调用 store 的 endItem 方法结束育苗
    const success = await seedlingStore.endItem(record.id, endType)
    if (success) {
      ElMessage.success(isNormal ? '生产计划已正常结束' : '生产计划已异常结束')
      await loadItems()
    } else {
      ElMessage.error('结束生产计划失败')
    }
  } catch {
    // 用户取消
  }
}

// 确认导出
const handleConfirmExport = async () => {
  // 获取选中的数据
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))

  // 导出表头
  const headers = [
    '育苗批号', '作物编码', '关联种源', '作物名称', '作物品种',
    '育苗方式', '场地', '开始日期', '预计结束日期', '实际结束日期',
    '初始数量', '成苗数量', '已定植数量', '损耗数量', '剩余总数',
    '成苗率', '损耗率', '育苗结束', '状态', '品质等级',
    '创建人', '创建时间', '备注'
  ]

  // 计算剩余总数
  const getRemainingCount = (record) => record.initialCount - record.lossCount

  // 获取状态标签
  const getStatusLabel = (status) => {
    const map = {
      'in_progress': '进行中',
      'transplant_ready': '待定植',
      'completed': '已完成',
      'abnormal': '异常'
    }
    return map[status] || status
  }

  // 生成导出数据
  const exportData = selectedData.map(record => ({
    '育苗批号': record.seedlingCode,
    '作物编码': record.cropCode || '',
    '关联种源': record.sourceCode,
    '作物名称': record.cropName,
    '作物品种': record.cropVariety,
    '育苗方式': record.seedlingType || '',
    '场地': record.siteName,
    '开始日期': record.startDate,
    '预计结束日期': record.expectedEndDate || '',
    '实际结束日期': record.endDate || '',
    '初始数量': record.initialCount,
    '成苗数量': record.survivalCount,
    '已定植数量': record.plantedCount,
    '损耗数量': record.lossCount,
    '剩余总数': getRemainingCount(record),
    '成苗率': `${record.survivalRate}%`,
    '损耗率': `${record.lossRate}%`,
    '育苗结束': record.isFinished ? '是' : '否',
    '状态': getStatusLabel(record.status),
    '品质等级': record.qualityGrade || '',
    '创建人': record.createBy,
    '创建时间': record.createTime,
    '备注': record.remarks || ''
  }))

  // 创建内容
  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${row[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  }

  const fileName = `育苗管理_${new Date().toISOString().slice(0, 10)}.${extension}`

  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Export failed:', err)
    ElMessage.error('导出失败')
  }

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

// 初始化
onMounted(async () => {
  // 加载育苗数据
  await loadItems()
})
</script>

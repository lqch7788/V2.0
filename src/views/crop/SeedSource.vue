<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Package class="w-6 h-6 text-white" />
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
      @update:filters="handleFiltersChange"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 (操作按钮已移入表格内部) -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>
    <SeedSourceTable
      v-show="!loading"
      :data="filteredData"
      v-model:pagination="pagination"
      v-model:selected-rows="selectedRows"
      :export-mode="exportMode"
      :operation-mode="operationMode"
      :print-mode="printMode"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-export="canExport"
      :can-print="canPrint"
      @selection-change="handleSelectionChange"
      @add="handleAdd"
      @edit="handleEdit"
      @batch-edit="handleBatchEdit"
      @delete="handleDelete"
      @detail="handleDetail"
      @export="handleExportClick"
      @print="handlePrint"
      @confirm-export="handleExportClickConfirm"
      @export-cancel="handleExportCancel"
      @operation-mode-change="handleOperationModeChange"
      @print-mode-change="handlePrintModeChange"
      @confirm-print="handlePrintConfirm"
      @end="handleEnd"
      @propagation-record="handlePropagationRecord"
      @propagation-stage="handlePropagationStage"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

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

    <BatchEditModal
      v-model:visible="batchEditModalVisible"
      :selected-rows="batchSelectedIds"
      :all-records="items"
      @success="handleBatchEditSuccess"
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

    <!-- 繁殖途径弹窗 -->
    <PropagationRecordModal
      v-if="propagationRecord"
      v-model:visible="propagationRecordVisible"
      :record="propagationRecord"
      @success="loadItems"
    />

    <PropagationStageModal
      v-if="propagationStageRecord"
      v-model:visible="propagationStageVisible"
      :record="propagationStageRecord"
      @success="loadItems"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Package } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import SeedSourceFilter from '@/components/farm/seed-source/components/SeedSourceFilter.vue'
import SeedSourceTable from '@/components/farm/seed-source/components/SeedSourceTable.vue'
import SeedSourceStats from '@/components/farm/seed-source/components/SeedSourceStats.vue'
import AddModal from '@/components/farm/seed-source/modals/AddModal.vue'
import EditModal from '@/components/farm/seed-source/modals/EditModal.vue'
import BatchEditModal from '@/components/farm/seed-source/modals/BatchEditModal.vue'
import DetailModal from '@/components/farm/seed-source/modals/DetailModal.vue'
import PrintLabelModal from '@/components/farm/seed-source/modals/PrintLabelModal.vue'
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import PropagationRecordModal from '@/components/farm/seed-source/modals/PropagationRecordModal.vue'
import PropagationStageModal from '@/components/farm/seed-source/modals/PropagationStageModal.vue'
import { useSeedSourceStore } from '@/stores'
import { enhancedApiClient } from '@/lib/apiClient'
import { SeedSource } from '@/types/crop'

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
  createBy: '',
  cropType: '',
  orgId: '',
  recorderId: '',
  surplusMin: undefined,
  surplusMax: undefined,
  propagationType: undefined,
  propagationStatus: undefined
})

// 分页
const pagination = ref({ current: 1, pageSize: 10 })

// 选中行
const selectedRows = ref([])

// 导出模式
const exportMode = ref(false)
const exportFormat = ref('excel')
const showExportModal = ref(false)

// 弹窗状态
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const batchEditModalVisible = ref(false)
const detailModalVisible = ref(false)
const printModalVisible = ref(false)
const lightboxVisible = ref(false)

// 操作模式状态（用于批量操作：编辑、删除、导出、打印）
const operationMode = ref('normal')

// 打印模式状态
const printMode = ref(false)
const printRecords = ref([])

// 批量编辑选中的ID
const batchSelectedIds = ref([])

// 繁殖途径弹窗状态
const propagationRecordVisible = ref(false)
const propagationStageVisible = ref(false)
const propagationRecord = ref(null)
const propagationStageRecord = ref(null)

// 当前记录
const currentRecord = ref(null)
const currentImages = ref([])

// 筛选后的数据
const filteredData = computed(() => {
  return items.value.filter(item => {
    if (filters.value.cropCategory && filters.value.cropCategory !== '__all__' && item.cropCategory !== filters.value.cropCategory) return false
    if (filters.value.cropName && !item.cropName.includes(filters.value.cropName)) return false
    if (filters.value.cropType && filters.value.cropType !== '__all__' && item.cropCategory !== filters.value.cropType) return false
    if (filters.value.seedCode && !item.seedCode.includes(filters.value.seedCode)) return false
    if (filters.value.sourceType && filters.value.sourceType !== '__all__' && item.sourceType !== filters.value.sourceType) return false
    if (filters.value.supplierName && filters.value.supplierName !== '__all__' && !item.supplierName.includes(filters.value.supplierName)) return false
    if (filters.value.status && filters.value.status !== '__all__' && item.status !== filters.value.status) return false
    if (filters.value.startDate && item.purchaseDate < filters.value.startDate) return false
    if (filters.value.endDate && item.purchaseDate > filters.value.endDate) return false
    if (filters.value.createBy && !item.createBy.includes(filters.value.createBy)) return false
    if (filters.value.surplusMin !== undefined && item.availableCount < filters.value.surplusMin) return false
    if (filters.value.surplusMax !== undefined && item.availableCount > filters.value.surplusMax) return false
    if (filters.value.propagationType) {
      const itemPropType = item.propagationType || 'external'
      if (itemPropType !== filters.value.propagationType) return false
    }
    if (filters.value.propagationStatus) {
      const itemPropStatus = item.propagationStatus
      if (itemPropStatus !== filters.value.propagationStatus) return false
    }
    return true
  }).sort((a, b) => {
    const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
    const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
    return timeB - timeA
  })
})

// 统计数据
const statsData = computed(() => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const total = items.value.length
  const totalQuantity = items.value.reduce((sum, item) => sum + (item.availableCount || 0), 0)
  const monthCount = items.value.filter(item => {
    if (!item.createTime) return false
    const date = new Date(item.createTime)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
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
  seedSourceStore.setFilters(newFilters)
}

const handleSearch = () => {
  pagination.value.current = 1
  seedSourceStore.setFilters(filters.value)
  loadItems()
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
    createBy: '',
    cropType: '',
    orgId: '',
    recorderId: '',
    surplusMin: undefined,
    surplusMax: undefined,
    propagationType: undefined,
    propagationStatus: undefined
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

// 处理批量编辑
const handleBatchEdit = (selectedIds) => {
  // 保存选中的ID到临时变量，防止被后续的selection-change事件清空
  batchSelectedIds.value = selectedIds
  selectedRows.value = selectedIds
  batchEditModalVisible.value = true
}

const handleDetail = (record) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

const handlePrint = (record) => {
  currentRecord.value = record
  printModalVisible.value = true
}

// 处理删除（通过 Store，删除前检查是否有育苗引用）
const handleDelete = async (ids) => {
  for (const id of ids) {
    try {
      const res = await enhancedApiClient.get(`/seed-sources/${id}/check-deletable`)
      if (!res?.deletable) {
        ElMessage.warning(`该种源已被 ${res?.refCount || '多个'} 条育苗记录引用，无法删除。\n请先清理育苗关联后再删除。`)
        return false
      }
    } catch {
      // 降级策略：检查失败时允许继续删除
    }
  }
  const success = await seedSourceStore.deleteItems(ids)
  if (success) {
    selectedRows.value = []
    ElMessage.success('删除成功')
    await loadItems()
    return true
  } else {
    ElMessage.error('删除失败')
    return false
  }
}

// 操作模式变更
const handleOperationModeChange = (mode) => {
  operationMode.value = mode

  // 导出模式
  if (mode === 'export') {
    exportMode.value = true
    selectedRows.value = []
    return
  }

  // 取消导出模式
  if (mode !== 'export') {
    exportMode.value = false
  }

  // 批量编辑模式：多选时打开批量编辑弹窗
  if (mode === 'edit' && selectedRows.value.length > 1) {
    batchEditModalVisible.value = true
    operationMode.value = 'normal'
    selectedRows.value = []
    return
  }

  // 编辑/删除模式不清空选择
  if (mode === 'edit' || mode === 'delete') {
    return
  }

  // 其他模式清空选择
  selectedRows.value = []
}

// 打印模式变更
const handlePrintModeChange = (mode) => {
  printMode.value = mode
  selectedRows.value = []
}

// 确认打印
const handlePrintConfirm = (records) => {
  if (records.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  printRecords.value = records
  currentRecord.value = records[0]
  printModalVisible.value = true
  printMode.value = false
  selectedRows.value = []
}

// 处理结束（正常/异常）
const handleEnd = async (record, endType) => {
  if (!record.productionPlanCode) {
    ElMessage.warning('该种源没有关联的生产计划，无法结束')
    return
  }

  try {
    const batch = await enhancedApiClient.get(`/crop-batch/code/${record.productionPlanCode}`)
    if (!batch) {
      ElMessage.error('未找到关联的生产计划')
      return
    }

    if (batch.batchStatus === 'completed') {
      ElMessage.error('该生产计划已完成结束，不能重复结束')
      return
    }

    const completionRate = record.initialCount > 0 ? record.availableCount / record.initialCount : 0

    const isNormal = endType === 'normal'
    const confirmMsg = isNormal
      ? `确认正常结束此生产计划？\n\n入库完成比例：${Math.round(completionRate * 100)}%\n结束后禁止一切入库和补录操作`
      : `确认异常结束此生产计划？\n\n入库完成比例：${Math.round(completionRate * 100)}%\n结束后如需补录，需提交审核申请`

    const { ElMessageBox } = await import('element-plus')
    try {
      await ElMessageBox.confirm(confirmMsg, '确认结束', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }

    const result = await enhancedApiClient.put(`/crop-batch/${batch.id}/end`, { endType })
    if (result) {
      ElMessage.success(isNormal ? '生产计划已正常结束' : '生产计划已异常结束')
      await loadItems()
    } else {
      ElMessage.error('结束失败')
    }
  } catch (error) {
    console.error('结束生产计划失败:', error)
    ElMessage.error('结束失败')
  }
}

// 批量编辑（V1.1逻辑：选择一条记录进行编辑）
const handleConfirmBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的数据')
    return
  }
  const firstSelectedId = selectedRows.value[0]
  const record = items.value.find(item => item.id === firstSelectedId)

  if (record) {
    const editRecord = {
      id: record.id,
      seedCode: record.seedCode || record.sourceCode || '',
      sourceType: record.sourceType || 'seed',
      sourceOrigin: record.sourceOrigin || 'external_purchase',
      cropCategory: record.cropCategory || '',
      typeName: record.typeName || '',
      varietyName: record.varietyName || '',
      cropName: record.cropName || '',
      cropVariety: record.cropVariety || '',
      cropCode: record.cropCode || '',
      supplierId: record.supplierId || '',
      supplierName: record.supplierName || '',
      purchaseDate: record.purchaseDate || '',
      quantity: record.quantity || 0,
      unit: record.unit || '',
      unitPrice: record.unitPrice || 0,
      initialCount: record.initialCount || 0,
      availableCount: record.availableCount || 0,
      pictures: record.pictures || [],
      remarks: record.remarks || '',
      status: record.status || 'sufficient'
    }
    handleEdit(editRecord)
  } else {
    ElMessage.warning('未找到选中的记录')
  }
  handleOperationModeChange('normal')
  selectedRows.value = []
}

// 批量删除确认
const handleConfirmDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  const result = await handleDelete(selectedRows.value)
  if (result !== false) {
    handleOperationModeChange('normal')
  }
}

// 批量编辑成功
const handleBatchEditSuccess = () => {
  handleOperationModeChange('normal')
  selectedRows.value = []
  loadItems()
}

// 处理繁殖过程记录
const handlePropagationRecord = (record) => {
  propagationRecord.value = record
  propagationRecordVisible.value = true
}

// 处理繁殖阶段推进
const handlePropagationStage = (record) => {
  propagationStageRecord.value = record
  propagationStageVisible.value = true
}

// 导出相关
const handleExportClick = () => {
  exportMode.value = true
  operationMode.value = 'export'
  selectedRows.value = []
}

const handleExportCancel = () => {
  exportMode.value = false
  operationMode.value = 'normal'
  selectedRows.value = []
}

const handleExportClickConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 种源类型中英文映射
const sourceTypeMap = {
  'seed': '种子',
  'seedling': '种苗/实生苗',
  'cutting': '扦插苗',
  'grafting': '嫁接苗',
  'tissue_culture': '组培苗',
  'split': '分株苗',
  'bulb': '种球/球根',
  'other': '其他'
}

// 来源途径中英文映射
const sourceOriginMap = {
  'external_purchase': '外部采购',
  'self_produced': '自产',
  'other': '其他'
}

const handleConfirmExport = () => {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))
  const headers = ['种源批号', '种源类型', '来源途径', '作物类别', '作物品种', '供应商', '采购日期', '采购数量', '单位', '单价(元)', '总金额(元)', '初始数量', '可用数量', '库存状态', '创建人', '创建时间', '备注']
  const exportData = selectedData.map(record => ({
    '种源批号': record.seedCode,
    '种源类型': sourceTypeMap[record.sourceType] || record.sourceType || '',
    '来源途径': sourceOriginMap[record.sourceOrigin] || record.sourceOrigin || '',
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
      headers.map(h => `"${typeof row[h] === 'string' ? row[h].replace(/"/g, '""') : row[h] || ''}"`).join(',')
    ).join('\n')
    const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `种源管理_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } else if (exportFormat.value === 'word') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th style="background-color: #E0E0E0; font-weight: bold;">${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `种源管理_${new Date().toISOString().slice(0, 10)}.doc`
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
  operationMode.value = 'normal'
  selectedRows.value = []
  showExportModal.value = false
  ElMessage.success('导出成功')
}

const handlePageChange = (page) => {
  pagination.value.current = page
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 初始化
onMounted(() => {
  loadItems()
})
</script>

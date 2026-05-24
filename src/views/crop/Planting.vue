<template>
  <div class="p-6 bg-[#F2F6FA] min-h-screen">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- 左侧图标+标题 -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" style="color: white;">
              <Goods />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">种植管理</h1>
            <p class="text-gray-500">管理种植批次、生产计划和技术方案</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <PlantingStats :data="stats" />

    <!-- 筛选工具栏 -->
    <PlantingFilterToolbar
      :filters="filters"
      :areas="areaOptions"
      :status-options="plantingStatusOptions"
      @update:filters="handleFiltersUpdate"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <PlantingTable
      v-else
      :data="filteredData"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-export="canExport"
      :can-print="canPrint"
      :export-mode="exportMode"
      :print-mode="printMode"
      @add="handleAdd"
      @edit="handleEdit"
      @detail="handleDetail"
      @harvest="handleHarvest"
      @delete="handleDelete"
      @print="handlePrintClick"
      @export="handleExportClick"
      @end="handleEnd"
      @label-detail="handleLabelDetail"
      @move="handleMove"
      @mark="handleMark"
      @seed-saving="handleSeedSaving"
      @edit-mode="handleEditMode"
      @delete-mode="handleDeleteMode"
      @export-select-all="handleExportSelectAll"
      @export-confirm="handleExportConfirm"
      @export-cancel="handleExportCancel"
      @print-mode="handlePrintMode"
      @print-cancel="handlePrintCancel"
    />

    <!-- 弹窗组件 -->
    <AddModal
      :is-open="addModalOpen"
      :crop-options="cropOptions"
      :area-options="areaOptions"
      :source-type-options="sourceTypeOptions"
      @close="addModalOpen = false"
      @submit="handleAddSubmit"
    />

    <EditModal
      :is-open="editModalOpen"
      :record="currentRecord"
      @close="editModalOpen = false"
      @submit="handleEditSubmit"
    />

    <DetailModal
      :is-open="detailModalOpen"
      :record="currentRecord"
      @close="detailModalOpen = false"
    />

    <HarvestModal
      :is-open="harvestModalOpen"
      :record="currentRecord"
      @close="harvestModalOpen = false"
      @submit="handleHarvestSubmit"
    />

    <PrintModal
      :is-open="printModalOpen"
      :record="currentRecord"
      @close="printModalOpen = false"
      @print="handlePrint"
      @export="handlePrintExport"
    />

    <ImageLightboxModal
      :is-open="lightboxOpen"
      :images="currentImages"
      @close="lightboxOpen = false"
    />

    <ExportModal
      v-model:export-file-type="exportFormat"
      :is-open="exportModalOpen"
      :selected-count="selectedRows.length"
      @close="exportModalOpen = false"
      @confirm="handleConfirmExport"
    />

    <LabelDetailModal
      :is-open="labelDetailModalOpen"
      :labels="plantLabels"
      :resume-map="labelResumeMap"
      @close="labelDetailModalOpen = false"
    />

    <MoveModal
      :is-open="moveModalOpen"
      :area-options="areaOptions"
      :is-harvested="currentRecord?.isHarvest"
      @close="moveModalOpen = false"
      @submit="handleMoveSubmit"
    />

    <MarkModal
      :is-open="markModalOpen"
      :marks="availableMarks"
      :labels="plantLabels"
      @close="markModalOpen = false"
      @submit="handleMarkSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Goods, Search, Plus, Download, Printer, Edit, Delete, CircleCheck,
  PriceTag, Right, Check, Close, Sunny, Top
} from '@element-plus/icons-vue'
import { usePlantingStore, PlantingStatus, SourceType } from '@/stores/modules/planting'
import PlantingStats from '@/components/farm/planting/components/PlantingStats.vue'
import PlantingFilterToolbar from '@/components/farm/planting/PlantingFilterToolbar.vue'
import PlantingTable from '@/components/farm/planting/PlantingTable.vue'
import AddModal from '@/components/farm/planting/modals/AddModal.vue'
import EditModal from '@/components/farm/planting/modals/EditModal.vue'
import DetailModal from '@/components/farm/planting/modals/DetailModal.vue'
import HarvestModal from '@/components/farm/planting/modals/HarvestModal.vue'
import PrintModal from '@/components/farm/planting/modals/PrintModal.vue'
import ImageLightboxModal from '@/components/farm/planting/modals/ImageLightboxModal.vue'
import ExportModal from '@/components/farm/planting/modals/ExportModal.vue'
import LabelDetailModal from '@/components/farm/planting/modals/LabelDetailModal.vue'
import MoveModal from '@/components/farm/planting/modals/MoveModal.vue'
import MarkModal from '@/components/farm/planting/modals/MarkModal.vue'
import { assignMarkToLabels, getLabels, getLabelResumes, queryLabelByNumber, addLabelResume } from '@/services/apiPlantLabelService'
import { getCropBatchByCode, endCropBatch, getCompletionRate } from '@/services/apiCropBatchService'

// 使用 Store
const plantingStore = usePlantingStore()

// 使用 Router
const router = useRouter()

// ========== 权限控制 ==========
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)
const canPrint = ref(true)

// ========== 状态定义 ==========
const loading = ref(false)
const selectedRows = ref([])
const currentRecord = ref(null)

// 统计数据
const stats = computed(() => plantingStore.stats)

// ========== 筛选条件 ==========
const filters = ref({
  cropName: '',
  plantCode: '',
  sourceCode: '',
  areaName: '',
  isHarvest: '',
  startDate: '',
  endDate: '',
  transplantDate: '',
  createBy: '',
  orgName: '',
  countMin: undefined,
  countMax: undefined
})

// ========== 下拉选项 ==========
// 作物品种选项 - 与V1.1一致，从种植数据中提取唯一品种
const cropOptions = computed(() => {
  const uniqueCropNames = [...new Set(plantingStore.plantings.map(item => item.cropName).filter(Boolean))]
  return uniqueCropNames.sort((a, b) => a.localeCompare(b)).map(name => ({ value: name, label: name }))
})

// 种植区域选项 - 与V1.1一致，从种植数据中提取唯一区域
const areaOptions = computed(() => {
  const uniqueAreas = [...new Set(plantingStore.plantings.map(item => item.areaName).filter(Boolean))]
  return uniqueAreas.sort((a, b) => a.localeCompare(b)).map(name => ({ value: name, label: name }))
})

// 来源类型选项
const sourceTypeOptions = ref([
  { value: 'seed', label: '种子' },
  { value: 'seedling', label: '种苗' }
])

// 种植状态选项
const plantingStatusOptions = ref([
  { value: 'planted', label: '已定植' },
  { value: 'growing', label: '生长期' },
  { value: 'harvested', label: '已采收' },
  { value: 'cancelled', label: '已取消' }
])

// ========== 弹窗状态 ==========
const addModalOpen = ref(false)
const editModalOpen = ref(false)
const detailModalOpen = ref(false)
const harvestModalOpen = ref(false)
const printModalOpen = ref(false)
const lightboxOpen = ref(false)
const exportModalOpen = ref(false)
const labelDetailModalOpen = ref(false)
const moveModalOpen = ref(false)
const markModalOpen = ref(false)

// 导出格式
const exportFormat = ref('xlsx')
const exportMode = ref(false)
const printMode = ref(false)

// ========== 图片相关 ==========
const currentImages = ref([])

// ========== 标签相关 ==========
const plantLabels = ref([])
const labelResumeMap = ref({})
const availableMarks = ref([
  { id: 1, name: '优质', color: '#22c55e', parentId: 0 },
  { id: 2, name: '待观察', color: '#eab308', parentId: 0 },
  { id: 3, name: '有问题', color: '#ef4444', parentId: 0 }
])

// ========== 计算属性 ==========

// 筛选后的数据 - 与V1.1完全一致的筛选逻辑
const filteredData = computed(() => {
  return plantingStore.plantings.filter(item => {
    if (filters.value.cropName && !item.cropName.includes(filters.value.cropName)) return false
    if (filters.value.plantCode && !item.plantCode.includes(filters.value.plantCode)) return false
    if (filters.value.sourceCode && !item.sourceCode.includes(filters.value.sourceCode)) return false
    if (filters.value.areaName && !item.areaName.includes(filters.value.areaName)) return false
    if (filters.value.isHarvest && String(item.isHarvest) !== filters.value.isHarvest) return false
    if (filters.value.startDate && item.plantingDate < filters.value.startDate) return false
    if (filters.value.endDate && item.plantingDate > filters.value.endDate) return false
    if (filters.value.transplantDate && item.transplantDate !== filters.value.transplantDate) return false
    if (filters.value.createBy && !item.createBy.includes(filters.value.createBy)) return false
    if (filters.value.orgName && item.orgName && !item.orgName.includes(filters.value.orgName)) return false
    if (filters.value.countMin !== undefined && item.plantingCount < filters.value.countMin) return false
    if (filters.value.countMax !== undefined && item.plantingCount > filters.value.countMax) return false
    return true
  })
})

// ========== 生命周期 ==========
onMounted(() => {
  loading.value = true
  plantingStore.fetchPlantings().finally(() => {
    loading.value = false
  })
})

// ========== 筛选处理 ==========
const handleFiltersUpdate = (newFilters) => {
  filters.value = { ...newFilters }
}

const handleSearch = () => {
  // 搜索由筛选工具栏触发，这里只是占位
}

const handleReset = () => {
  filters.value = {
    cropName: '',
    plantCode: '',
    sourceCode: '',
    areaName: '',
    isHarvest: '',
    startDate: '',
    endDate: '',
    transplantDate: '',
    createBy: '',
    orgName: '',
    countMin: undefined,
    countMax: undefined
  }
}

// ========== 操作模式处理 - V1.1新增 ==========

// 编辑模式
const handleEditMode = () => {
  // V1.1在编辑模式下需要用户选择一条记录
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请在表格中选择一条记录')
    return
  }
  const record = plantingStore.plantings.find(p => p.id === selectedRows.value[0])
  if (record) {
    currentRecord.value = record
    editModalOpen.value = true
  }
  selectedRows.value = []
}

// 删除模式
const handleDeleteMode = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await plantingStore.deletePlantings(selectedRows.value)
    ElMessage.success('删除成功')
    selectedRows.value = []
  } catch {
    // 用户取消
  }
}

// 导出模式
const handleExportSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

const handleExportConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  exportModalOpen.value = true
}

const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

// 打印模式
const handlePrintMode = () => {
  printMode.value = true
}

const handlePrintCancel = () => {
  printMode.value = false
  selectedRows.value = []
}

// ========== 操作处理 ==========

// 新增
const handleAdd = () => {
  addModalOpen.value = true
}

const handleAddSubmit = async (data) => {
  try {
    await plantingStore.addPlanting(data)
    ElMessage.success('新增成功')
    addModalOpen.value = false
  } catch (error) {
    ElMessage.error('新增失败')
  }
}

// 编辑
const handleEdit = (record) => {
  currentRecord.value = record
  editModalOpen.value = true
}

const handleEditSubmit = async (data) => {
  try {
    await plantingStore.updatePlanting(currentRecord.value.id, data)
    ElMessage.success('修改成功')
    editModalOpen.value = false
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 详情
const handleDetail = (record) => {
  currentRecord.value = record
  detailModalOpen.value = true
}

// 采收
const handleHarvest = (record) => {
  currentRecord.value = record
  harvestModalOpen.value = true
}

const handleHarvestSubmit = async (data) => {
  try {
    await plantingStore.harvestPlanting(currentRecord.value.id, data.harvestDate, data.harvestQuantity)
    ElMessage.success('采收登记成功')
    harvestModalOpen.value = false
  } catch (error) {
    ElMessage.error('采收登记失败')
  }
}

// 删除
const handleDelete = async (ids) => {
  try {
    await ElMessageBox.confirm('确定要删除选中的记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await plantingStore.deletePlantings(ids)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

// 导出 - V1.1在exportMode下由handleExportConfirm处理
const handleExportClick = () => {
  // 正常模式下点击导出按钮，进入导出模式
  exportMode.value = true
  selectedRows.value = []
}

const handleConfirmExport = async (format) => {
  // 获取选中的数据
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))

  // 导出表头 - 与V1.1完全一致
  const headers = ['种植批号', '来源类型', '来源批号', '作物品种', '品种', '种植区域', '大棚名称', '种植数量', '种植日期', '土壤PH', '土壤EC', '移栽数量', '移栽日期', '是否采收', '采收日期', '损耗率', '溯源码', '状态', '创建人', '创建时间', '备注']

  // 获取来源类型标签
  const getSourceTypeLabel = (sourceType) => {
    return sourceType === SourceType.SEED ? '种子' : '种苗'
  }

  // 生成导出数据 - 与V1.1完全一致
  const exportData = selectedData.map(record => ({
    '种植批号': record.plantCode || '',
    '来源类型': getSourceTypeLabel(record.sourceType),
    '来源批号': record.sourceCode || '',
    '作物品种': record.cropName || '',
    '品种': record.cropVariety || '',
    '种植区域': record.areaName || '',
    '大棚名称': record.rootName || '',
    '种植数量': record.plantingCount || 0,
    '种植日期': record.plantingDate || '',
    '土壤PH': record.soilPH || '',
    '土壤EC': record.soilEC || '',
    '移栽数量': record.transplantCount || '',
    '移栽日期': record.transplantDate || '',
    '是否采收': record.isHarvest ? '是' : '否',
    '采收日期': record.harvestDate || '',
    '损耗率': `${record.attritionRate}%`,
    '溯源码': record.traceabilityCode || '',
    '状态': record.status === PlantingStatus.PLANTED ? '已定植' : record.status === PlantingStatus.GROWING ? '生长期' : record.status === PlantingStatus.HARVESTED ? '已采收' : '已取消',
    '创建人': record.createBy || '',
    '创建时间': record.createTime || '',
    '备注': record.remarks || ''
  }))

  // 创建内容
  let content = ''
  let mimeType = ''
  let extension = ''

  if (format === 'csv') {
    // CSV格式：使用UTF-8编码以支持中文
    const BOM = '﻿' // UTF-8 BOM
    content = BOM + headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else {
    // Excel格式（HTML表格）
    content = `<html><head><meta charset="utf-8"><style>
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #4CAF50; color: white; }
      tr:nth-child(even) { background-color: #f2f2f2; }
    </style></head><body><table border="1">
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      ${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}
    </table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  }

  const fileName = `种植管理_${new Date().toISOString().slice(0, 10)}.${extension}`

  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success(`已成功导出 ${selectedData.length} 条数据`)
  } catch (err) {
    console.error('Export failed:', err)
    ElMessage.error('导出失败')
  }

  exportModalOpen.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 打印
const handlePrintClick = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  const record = plantingStore.plantings.find(p => p.id === selectedRows.value[0])
  if (record) {
    currentRecord.value = record
    printModalOpen.value = true
  }
}

const handlePrint = (data) => {
  ElMessage.success('打印功能已触发')
  printModalOpen.value = false
}

const handlePrintExport = (data) => {
  ElMessage.success('导出Excel功能已触发')
}

// 标签详情 - 调用真实API获取数据
const handleLabelDetail = async (record) => {
  currentRecord.value = record
  labelDetailModalOpen.value = true

  try {
    // 调用真实API获取该种植记录的标签数据
    const labelsResult = await getLabels({ plantingId: record.id })

    if (labelsResult.data && labelsResult.data.length > 0) {
      plantLabels.value = labelsResult.data

      // 批量获取每个标签的履历信息
      const resumePromises = labelsResult.data.map(async (label) => {
        try {
          const resumes = await getLabelResumes(label.id)
          return { labelId: label.id, resumes }
        } catch {
          return { labelId: label.id, resumes: [] }
        }
      })

      const resumeResults = await Promise.all(resumePromises)
      const resumeMap = {}
      resumeResults.forEach(({ labelId, resumes }) => {
        resumeMap[labelId] = resumes
      })
      labelResumeMap.value = resumeMap
    } else {
      // 没有标签数据时使用空数组
      plantLabels.value = []
      labelResumeMap.value = {}
    }
  } catch (error) {
    console.error('获取标签详情失败:', error)
    ElMessage.error('获取标签详情失败')
    // 出错时使用空数据
    plantLabels.value = []
    labelResumeMap.value = {}
  }
}

// 移动
const handleMove = (record) => {
  currentRecord.value = record
  moveModalOpen.value = true
}

const handleMoveSubmit = async (data) => {
  try {
    // 通过标签编号查找标签
    const label = await queryLabelByNumber(data.labelNumber)
    if (!label) {
      ElMessage.error('未找到对应标签，请检查标签编号')
      return false
    }

    // 构建履历数据
    const resumeData = {
      operationType: data.operationType,
      fromAreaName: data.operationType === 'move_out' ? label.moveInAreaName || '' : '',
      toAreaName: data.operationType === 'move_in' ? data.targetArea : '',
      operationDate: data.operationDate || new Date().toISOString().slice(0, 10),
      remarks: data.remarks || ''
    }

    // 添加标签履历
    const success = await addLabelResume(label.id, resumeData)
    if (success) {
      ElMessage.success('移动操作成功')
      moveModalOpen.value = false
      return true
    } else {
      ElMessage.error('移动操作失败')
      return false
    }
  } catch (error) {
    console.error('移动操作失败:', error)
    ElMessage.error('移动操作失败')
    return false
  }
}

// 标记
const handleMark = async (record) => {
  currentRecord.value = record
  // 从API加载该种植的标签数据
  try {
    const labelsResult = await getLabels({ plantingId: record.id })
    if (labelsResult.data && labelsResult.data.length > 0) {
      plantLabels.value = labelsResult.data
    } else {
      // 没有标签时使用空数组
      plantLabels.value = []
    }
  } catch (error) {
    console.error('获取标签数据失败:', error)
    plantLabels.value = []
  }
  markModalOpen.value = true
}

const handleMarkSubmit = async (data) => {
  try {
    // data 包含: { markId: string, labelIds: number[] }
    // API 需要 number 类型，进行转换
    await assignMarkToLabels(Number(data.markId), data.labelIds.map(id => Number(id)))
    ElMessage.success('标记分配成功')
    markModalOpen.value = false
  } catch (error) {
    console.error('标记分配失败:', error)
    ElMessage.error('标记分配失败')
  }
}

// 结束计划（正常结束/异常结束）
const handleEnd = async (record, endType) => {
  if (!record.productionPlanCode) {
    ElMessage.warning('该种植没有关联的生产计划，无法结束')
    return
  }

  // 获取生产计划信息
  const batch = await getCropBatchByCode(record.productionPlanCode)
  if (!batch) {
    ElMessage.error('未找到关联的生产计划')
    return
  }

  if (batch.batchStatus === 'completed') {
    ElMessage.error('该生产计划已完成结束，不能重复结束')
    return
  }

  const completionRate = getCompletionRate(batch, record.harvestQuantity || 0)
  const isNormal = endType === 'normal'
  const confirmMsg = isNormal
    ? `确认正常结束此生产计划？\n\n采收完成比例：${Math.round(completionRate * 100)}%\n结束后禁止一切入库和补录操作`
    : `确认异常结束此生产计划？\n\n采收完成比例：${Math.round(completionRate * 100)}%\n结束后如需补录，需提交审核申请`
  try {
    await ElMessageBox.confirm(confirmMsg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: isNormal ? 'warning' : 'error'
    })
    // 调用生产批次的结束API
    const success = await endCropBatch(batch.id, endType)
    if (success) {
      // 同时更新本地store
      await plantingStore.endPlanting(record.id, endType)
      ElMessage.success(isNormal ? '生产计划已正常结束' : '生产计划已异常结束')
    } else {
      ElMessage.error('结束生产计划失败')
    }
  } catch {
    // 用户取消
  }
}

// 留种
const handleSeedSaving = (record) => {
  // 跳转到种源管理页面，并传递留种相关参数
  const params = new URLSearchParams({
    action: 'seed-saving',
    plantingId: record.id,
    plantingCode: record.plantCode || '',
    cropName: record.cropName || ''
  })
  router.push(`/crop/seed-source?${params.toString()}`)
}
</script>

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
      :is-open="exportModalOpen"
      :selected-count="selectedRows.length"
      :export-format="exportFormat"
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

// 使用 Store
const plantingStore = usePlantingStore()

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
// 作物品种选项 - 从store获取或使用默认值
const cropOptions = ref([
  { value: '番茄', label: '番茄' },
  { value: '黄瓜', label: '黄瓜' },
  { value: '辣椒', label: '辣椒' },
  { value: '茄子', label: '茄子' },
  { value: '草莓', label: '草莓' }
])

// 种植区域选项
const areaOptions = ref([
  { value: '1号棚', label: '1号棚' },
  { value: '2号棚', label: '2号棚' },
  { value: '3号棚', label: '3号棚' },
  { value: '4号棚', label: '4号棚' }
])

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

// 导出
const handleExportClick = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  exportModalOpen.value = true
}

const handleConfirmExport = (format) => {
  exportFormat.value = format
  // 导出逻辑
  ElMessage.success(`将以 ${format} 格式导出`)
  exportModalOpen.value = false
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

// 标签详情
const handleLabelDetail = (record) => {
  currentRecord.value = record
  // 模拟标签数据
  plantLabels.value = [
    { id: 1, labelNumber: `${record.plantCode}-0001`, moveInAreaName: record.areaName, moveInDate: record.plantingDate, moveOutAreaName: '', moveOutDate: '', markName: '', markColor: '' },
    { id: 2, labelNumber: `${record.plantCode}-0002`, moveInAreaName: record.areaName, moveInDate: record.plantingDate, moveOutAreaName: '', moveOutDate: '', markName: '优质', markColor: 'green' }
  ]
  labelResumeMap.value = {
    1: [
      { id: 1, operationType: 'move_in', fromAreaName: '', toAreaName: record.areaName, operationDate: record.plantingDate, operatorName: '陆启闯' }
    ],
    2: [
      { id: 2, operationType: 'move_in', fromAreaName: '', toAreaName: record.areaName, operationDate: record.plantingDate, operatorName: '陆启闯' },
      { id: 3, operationType: 'mark', fromAreaName: '', toAreaName: '', operationDate: '2024-06-01', operatorName: '张三', markName: '优质', markColor: 'green' }
    ]
  }
  labelDetailModalOpen.value = true
}

// 移动
const handleMove = (record) => {
  currentRecord.value = record
  moveModalOpen.value = true
}

const handleMoveSubmit = async (data) => {
  ElMessage.success('移动操作成功')
  moveModalOpen.value = false
}

// 标记
const handleMark = (record) => {
  currentRecord.value = record
  plantLabels.value = [
    { id: 1, labelNumber: `${record.plantCode}-0001`, currentMarkName: '' },
    { id: 2, labelNumber: `${record.plantCode}-0002`, currentMarkName: '优质' }
  ]
  markModalOpen.value = true
}

const handleMarkSubmit = async (data) => {
  ElMessage.success('标记分配成功')
  markModalOpen.value = false
}

// 结束计划（正常结束/异常结束）
const handleEnd = async (record, endType) => {
  if (!record.productionPlanCode) {
    ElMessage.warning('该种植没有关联的生产计划，无法结束')
    return
  }
  const isNormal = endType === 'normal'
  const confirmMsg = isNormal
    ? `确认正常结束此生产计划？\n\n结束后禁止一切入库和补录操作`
    : `确认异常结束此生产计划？\n\n结束后如需补录，需提交审核申请`
  try {
    await ElMessageBox.confirm(confirmMsg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: isNormal ? 'warning' : 'error'
    })
    ElMessage.success(isNormal ? '生产计划已正常结束' : '生产计划已异常结束')
  } catch {
    // 用户取消
  }
}

// 留种
const handleSeedSaving = (record) => {
  ElMessage.info('留种功能跳转')
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <HarvestPageHeader />

    <!-- 统计卡片 -->
    <HarvestStatsCards :records="harvestRecords" />

    <!-- 筛选工具栏 -->
    <HarvestFilterToolbar
      :filters="searchFilters"
      :greenhouses="greenhouses"
      :warehouse-options="warehouseOptions"
      @update:filters="searchFilters = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格区域 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 表格工具栏 -->
      <HarvestTableToolbar
        :can-create="canCreate"
        :can-edit="canEdit"
        :can-delete="canDelete"
        :can-export="canExport"
        :export-mode="exportMode"
        :batch-edit-mode="batchEditMode"
        :batch-delete-mode="batchDeleteMode"
        :selected-rows="selectedRows"
        @create="isCreateModalOpen = true"
        @batch-edit="handleBatchEdit"
        @batch-delete="handleBatchDelete"
        @export="handleExport"
        @confirm-export="handleConfirmExport"
        @cancel-export="handleCancelExport"
        @confirm-batch-edit="handleConfirmBatchEdit"
        @cancel-batch-edit="handleCancelBatchEdit"
        @confirm-batch-delete="handleConfirmBatchDelete"
        @cancel-batch-delete="handleCancelBatchDelete"
      />

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-500">加载中...</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <HarvestTable
        v-else
        :records="filteredRecords"
        :current-page="currentPage"
        :page-size="pageSize"
        @view-detail="handleViewDetail"
      />

      <!-- 批量操作底部提示栏 -->
      <div v-if="(exportMode || batchEditMode || batchDeleteMode) && selectedRows.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <el-button link size="sm" @click="handleSelectAll">
            {{ selectedRows.length === filteredRecords.length ? '全不选' : '全选' }}
          </el-button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredRecords.length"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增采收记录弹窗 -->
    <AddModal
      :is-open="isCreateModalOpen"
      :crop-batches="cropBatches"
      :greenhouses="greenhouses"
      :warehouse-options="warehouseOptions"
      :users="users"
      @close="isCreateModalOpen = false"
      @save="handleAddModalSave"
    />

    <!-- 详情弹窗 -->
    <DetailModal
      :is-open="showDetailModal"
      :record="selectedDetailRecord"
      @close="showDetailModal = false"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportModal
      :is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @close="showExportModal = false"
      @confirm="handleDoExport"
      @format-change="exportFormat = $event"
    />

    <!-- 删除确认弹窗 -->
    <DeleteModal
      :is-open="showDeleteWarning"
      :selected-count="selectedRows.length"
      @close="showDeleteWarning = false"
      @confirm="handleConfirmBatchDelete"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      :is-open="showBatchEditModal"
      :selected-rows="selectedRows"
      :records="filteredRecords"
      :edited-record-ids="editedRecordIds"
      :edited-records="editedRecords"
      :selected-record-id="selectedRecordId"
      :greenhouses="greenhouses"
      :warehouses="warehouseOptions"
      :users="users"
      :crop-batches="cropBatches"
      @close="showBatchEditModal = false"
      @confirm="handleConfirmBatchEdit"
      @update:selectedRecordId="selectedRecordId = $event"
      @update:editedRecords="editedRecords = $event"
      @update:editedRecordIds="editedRecordIds = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import HarvestPageHeader from '@/components/farm/harvest/components/HarvestPageHeader.vue'
import HarvestStatsCards from '@/components/farm/harvest/components/HarvestStatsCards.vue'
import HarvestFilterToolbar from '@/components/farm/harvest/HarvestFilterToolbar.vue'
import HarvestTableToolbar from '@/components/farm/harvest/components/HarvestTableToolbar.vue'
import HarvestTable from '@/components/farm/harvest/HarvestTable.vue'
import { AddModal, DetailModal, ExportModal, DeleteModal, BatchEditModal } from '@/components/farm/harvest/modals'

// 权限设置（已取消，直接设置为 true）
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)

// 搜索筛选
const searchFilters = ref({
  harvestCode: '',
  batchCode: '',
  greenhouseId: '',
  cropName: '',
  grade: '',
  harvesterName: '',
  warehouseId: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 加载状态
const loading = ref(false)

// 弹窗状态
const isCreateModalOpen = ref(false)
const showDetailModal = ref(false)
const showExportModal = ref(false)
const showDeleteWarning = ref(false)
const showBatchEditModal = ref(false)

// 选中行
const selectedRows = ref([])

// 批量操作模式
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)

// 批量编辑状态
const editedRecordIds = ref([])
const editedRecords = ref({})
const selectedRecordId = ref('')

// 导出格式
const exportFormat = ref('excel')

// 下拉选项
const greenhouses = ref([
  { id: 'G001', name: '1号棚' },
  { id: 'G002', name: '2号棚' },
  { id: 'G003', name: '3号棚' },
])

const warehouseOptions = ref([
  { value: 'W001', label: '成品仓库' },
  { value: 'W002', label: '原料仓库' },
])

const users = ref([
  { id: 'U001', name: '张三' },
  { id: 'U002', name: '李四' },
  { id: 'U003', name: '王五' },
])

const cropBatches = ref([
  { batchCode: 'PC202405001', cropName: '番茄', variety: '大红番茄', plantingMode: '温室', planType: 'planting' },
  { batchCode: 'PC202405002', cropName: '黄瓜', variety: '水果黄瓜', plantingMode: '温室', planType: 'planting' },
])

// 详情记录
const selectedDetailRecord = ref(null)

// 采收记录数据
const harvestRecords = ref([
  {
    id: '1',
    harvestCode: 'HS20240521001',
    batchCode: 'PC202405001',
    cropName: '番茄',
    greenhouseId: 'G001',
    greenhouseName: '1号棚',
    harvestDate: '2024-05-21 10:30',
    harvestQuantity: 100,
    unit: 'kg',
    grade: 'A',
    warehouseId: 'W001',
    warehouseName: '成品仓库',
    harvesterIds: ['U001', 'U002'],
    harvesterNames: ['张三', '李四'],
    status: 'harvested',
    remarks: '',
    auditor: '管理员',
    variety: '大红番茄',
    plantingMode: '温室',
    targetYield: 500,
    unitPrice: 3.5,
    totalAmount: 1750
  },
  {
    id: '2',
    harvestCode: 'HS20240520002',
    batchCode: 'PC202405002',
    cropName: '黄瓜',
    greenhouseId: 'G002',
    greenhouseName: '2号棚',
    harvestDate: '2024-05-20 15:00',
    harvestQuantity: 100,
    unit: 'kg',
    grade: 'A',
    warehouseId: 'W001',
    warehouseName: '成品仓库',
    harvesterIds: ['U003'],
    harvesterNames: ['王五'],
    status: 'stored',
    remarks: '',
    auditor: '管理员',
    variety: '水果黄瓜',
    plantingMode: '温室',
    targetYield: 500,
    unitPrice: 2.8,
    totalAmount: 840
  }
])

// 筛选后的记录
const filteredRecords = computed(() => {
  return harvestRecords.value.filter(record => {
    if (searchFilters.value.harvestCode && !record.harvestCode.startsWith(searchFilters.value.harvestCode)) return false
    if (searchFilters.value.batchCode && !record.batchCode.startsWith(searchFilters.value.batchCode)) return false
    if (searchFilters.value.greenhouseId && record.greenhouseId !== searchFilters.value.greenhouseId) return false
    if (searchFilters.value.cropName && !record.cropName.startsWith(searchFilters.value.cropName)) return false
    if (searchFilters.value.grade && record.grade !== searchFilters.value.grade) return false
    if (searchFilters.value.warehouseId && record.warehouseId !== searchFilters.value.warehouseId) return false
    if (searchFilters.value.status && record.status !== searchFilters.value.status) return false
    return true
  })
})

// 生命周期
onMounted(() => {
  // 初始化
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  searchFilters.value = {
    harvestCode: '',
    batchCode: '',
    greenhouseId: '',
    cropName: '',
    grade: '',
    harvesterName: '',
    warehouseId: '',
    status: ''
  }
  currentPage.value = 1
}

// 详情
const handleViewDetail = (record) => {
  selectedDetailRecord.value = record
  showDetailModal.value = true
}

// 批量编辑
const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  batchEditMode.value = true
  showBatchEditModal.value = true
}

// AddModal 保存回调
const handleAddModalSave = (record) => {
  harvestRecords.value.unshift({
    id: Date.now().toString(),
    ...record
  })
  isCreateModalOpen.value = false
  ElMessage.success('新增成功')
}

// 确认批量编辑
const handleConfirmBatchEdit = async () => {
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  editedRecordIds.value = []
  editedRecords.value = {}
  selectedRecordId.value = ''
  ElMessage.success('批量编辑成功')
}

// 取消批量编辑
const handleCancelBatchEdit = () => {
  batchEditMode.value = false
  selectedRows.value = []
  editedRecordIds.value = []
  editedRecords.value = {}
  selectedRecordId.value = ''
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  batchDeleteMode.value = true
  showDeleteWarning.value = true
}

// 确认批量删除
const handleConfirmBatchDelete = async () => {
  // 删除逻辑
  showDeleteWarning.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
  ElMessage.success('删除成功')
}

// 取消批量删除
const handleCancelBatchDelete = () => {
  batchDeleteMode.value = false
  selectedRows.value = []
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  exportMode.value = true
  showExportModal.value = true
}

// 确认导出
const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 取消导出
const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

// 执行导出
const handleDoExport = () => {
  ElMessage.info('导出格式: ' + exportFormat.value)
  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 全选/取消全选
const handleSelectAll = () => {
  if (selectedRows.value.length === filteredRecords.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredRecords.value.map((_, index) => index)
  }
}
</script>

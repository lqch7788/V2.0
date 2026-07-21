<!--
  病虫害管理主页面（完全重写 - 1:1 对齐 V1.1 PestControlPage.tsx L1-265）
  V1.1源文件：src/components/farm/pest-control/PestControlPage.tsx
  功能：筛选 + 统计卡片 + 表格 + CRUD + 详情 + 删除 + 导出
-->
<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
          <el-icon :size="24" style="color: white;"><WarnTriangleFilled /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">病虫害管理</h1>
          <p class="text-gray-500">记录和管理农作物病虫害防治情况</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片（对齐 V1.1 Page）-->
    <PestControlStatsCards
      :control-count="stats.controlCount"
      :disease-count="stats.diseaseCount"
      :pesticide-used="stats.pesticideUsed"
      :loss-rate="stats.lossRate"
    />

    <!-- 筛选 -->
    <PestControlFilter
      :filters="filters"
      @update:filters="(f) => Object.assign(filters, f)"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格 -->
    <PestControlTable
      :data="items"
      :pagination="pagination"
      :selected-rows="selectedRows"
      :operation-mode="operationMode"
      :can-create="canCreate"
      :can-delete="canDelete"
      :can-export="canExport"
      @update:pagination="(p) => pagination = p"
      @update:selected-rows="(r) => selectedRows = r"
      @add="handleAdd"
      @edit="handleEdit"
      @detail="handleDetail"
      @delete="handleDelete"
      @export="handleExport"
      @operation-mode-change="(m) => operationMode = m"
    />

    <!-- 弹窗区 -->
    <AddPestControlModal
      :visible="addModalVisible"
      @close="addModalVisible = false"
      @success="handleAddSuccess"
    />
    <EditPestControlModal
      :visible="editModalVisible"
      :record="currentRecord"
      @close="editModalVisible = false"
      @success="handleEditSuccess"
    />
    <PestControlDetailModal
      :visible="detailModalVisible"
      :record="currentRecord"
      @close="detailModalVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarnTriangleFilled } from '@element-plus/icons-vue'
import PestControlStatsCards from './PestControlStatsCards.vue'
import PestControlFilter from './components/PestControlFilter.vue'
import PestControlTable from './components/PestControlTable.vue'
import AddPestControlModal from './modals/AddPestControlModal.vue'
import EditPestControlModal from './modals/EditPestControlModal.vue'
import PestControlDetailModal from './modals/PestControlDetailModal.vue'
import { usePestControlStore } from '@/stores/modules/pestControl'

const pestStore = usePestControlStore()

// 权限
const canCreate = true
const canDelete = true
const canExport = true

// 状态
const items = computed(() => pestStore.items)
const pagination = ref({ page: 1, limit: 20, total: 0 })
const selectedRows = ref([])
const filters = ref({
  pesticideType: '', cropName: '', greenhouseName: '',
  targetPest: '', startDate: '', endDate: '', operatorName: ''
})

const addModalVisible = ref(false)
const editModalVisible = ref(false)
const detailModalVisible = ref(false)
const currentRecord = ref(null)
const operationMode = ref('normal')

// 统计
const stats = ref({ controlCount: 0, diseaseCount: 0, pesticideUsed: 0, lossRate: 0 })

// 加载数据
const loadItems = async () => {
  pestStore.pagination.page = pagination.value.page
  pestStore.pagination.limit = pagination.value.limit
  await pestStore.loadItems()
  pagination.value.total = pestStore.pagination.total
}

const loadStats = async () => {
  stats.value = {
    controlCount: items.value.length,
    diseaseCount: items.value.filter(i => (i.pesticideType || []).length > 0).length,
    pesticideUsed: items.value.reduce((sum, i) => sum + (i.dosage || 0), 0),
    lossRate: 0
  }
}

// 操作
const handleSearch = () => {
  pagination.value.page = 1
  pestStore.filters = { ...filters.value }
  loadItems()
}

const handleReset = () => {
  filters.value = { pesticideType: '', cropName: '', greenhouseName: '', targetPest: '', startDate: '', endDate: '', operatorName: '' }
  pestStore.resetFilters()
  pagination.value.page = 1
  loadItems()
}

const handleAdd = () => { addModalVisible.value = true }
const handleAddSuccess = async () => {
  addModalVisible.value = false
  await loadItems()
  await loadStats()
}

const handleEdit = (record) => { currentRecord.value = record; editModalVisible.value = true }
const handleEditSuccess = async () => {
  editModalVisible.value = false
  await loadItems()
  await loadStats()
}

const handleDetail = (record) => { currentRecord.value = record; detailModalVisible.value = true }

const handleDelete = async (ids) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${ids.length} 条防治记录吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
  } catch { return }
  const ok = await pestStore.deleteItems(ids)
  if (ok) {
    ElMessage.success('删除成功')
    selectedRows.value = []
    operationMode.value = 'normal'
    await loadItems()
    await loadStats()
  } else {
    ElMessage.error('删除失败')
  }
}

const handleExport = () => {
  if (items.value.length === 0) {
    ElMessage.warning('没有记录可导出')
    return
  }
  const headers = ['记录编号', '防治日期', '药剂类型', '作物', '温室', '药剂名称', '用药量', '稀释比例', '防治对象', '操作员']
  const rows = items.value.map(r => [
    r.recordCode,
    (r.sprayTime || '').slice(0, 16),
    Array.isArray(r.pesticideType) ? r.pesticideType.join('/') : (r.pesticideType || ''),
    r.cropName,
    r.greenhouseName || '',
    r.pesticideName || '',
    `${r.dosage || ''}${r.dosageUnit || ''}`,
    r.dilutionRatio || '',
    Array.isArray(r.targetPest) ? r.targetPest.join('/') : '',
    r.operatorName || ''
  ])
  const csv = '﻿' + headers.join(',') + '\n' + rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `病虫害防治记录_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(async () => {
  await loadItems()
  await loadStats()
})
</script>
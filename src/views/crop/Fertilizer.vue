<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Sprout class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">施肥管理</h1>
            <p class="text-gray-500">管理施肥记录、追踪肥料使用和成本分析</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <FertilizerFilter
      :filters="filters"
      @update:filters="handleFiltersChange"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sprout class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-lg font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-xs text-gray-500">总记录数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Sprout class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-lg font-bold text-gray-900">{{ stats.totalQuantity.toLocaleString() }} kg</p>
            <p class="text-xs text-gray-500">施肥总量</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Sprout class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-lg font-bold text-gray-900">{{ stats.totalCost.toLocaleString() }} 元</p>
            <p class="text-xs text-gray-500">总成本</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Sprout class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-lg font-bold text-gray-900">{{ stats.iotCount }}</p>
            <p class="text-xs text-gray-500">IoT记录数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量删除操作栏 -->
    <div
      v-if="operationMode === 'delete' && selectedIds.length > 0"
      class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      <span class="text-sm text-red-700">已选择 {{ selectedIds.length }} 条记录</span>
      <el-button size="small" type="danger" @click="handleBatchDelete">
        <el-icon class="mr-1"><Delete /></el-icon>
        确认删除
      </el-button>
      <el-button size="small" @click="handleCancelBatchDelete">
        取消
      </el-button>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
    >
      加载出错：{{ error }}
    </div>

    <!-- 数据表格 -->
    <FertilizerTable
      :data="items"
      :isLoading="loading"
      :operation-mode="operationMode"
      :selected-ids="selectedIds"
      :iot-devices="iotDevices"
      :iot-loading="iotLoading"
      :show-stats="showStats"
      @update:selectedIds="handleSelectionChange"
      @add="handleAdd"
      @edit="handleEdit"
      @detail="handleDetail"
      @delete="handleDelete"
      @batchDeleteMode="handleBatchDeleteMode"
      @exportMode="handleExportMode"
      @toggleStats="handleToggleStats"
    />

    <!-- 统计面板（可折叠） -->
    <FertilizerStatsPanel
      v-if="showStats"
      :filters="filters"
    />

    <!-- 弹窗 -->
    <FertilizerAddModal
      :is-open="addModalVisible"
      @close="addModalVisible = false"
      @saved="handleAddSuccess"
    />

    <FertilizerEditModal
      :is-open="editModalVisible"
      :record="currentRecord"
      @close="handleEditClose"
      @saved="handleEditSuccess"
    />

    <FertilizerDetailModal
      :is-open="detailModalVisible"
      :record="currentRecord"
      @close="detailModalVisible = false"
    />

    <FertilizerBatchDeleteModal
      :is-open="batchDeleteModalVisible"
      :count="selectedIds.length"
      :selected-items="selectedItems"
      @close="batchDeleteModalVisible = false"
      @confirm="handleConfirmBatchDelete"
    />

    <FertilizerExportModal
      :is-open="exportModalVisible"
      :selected-count="selectedIds.length > 0 ? selectedIds.length : items.length"
      @close="exportModalVisible = false"
      @confirm="handleConfirmExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { Sprout } from 'lucide-vue-next'
import FertilizerFilter from '@/views/crop/fertilizer/FertilizerFilter.vue'
import FertilizerTable from '@/views/crop/fertilizer/FertilizerTable.vue'
import FertilizerStatsPanel from '@/views/crop/fertilizer/FertilizerStatsPanel.vue'
import FertilizerAddModal from '@/views/crop/fertilizer/FertilizerAddModal.vue'
import FertilizerEditModal from '@/views/crop/fertilizer/FertilizerEditModal.vue'
import FertilizerDetailModal from '@/views/crop/fertilizer/FertilizerDetailModal.vue'
import FertilizerBatchDeleteModal from '@/views/crop/fertilizer/FertilizerBatchDeleteModal.vue'
import FertilizerExportModal from '@/views/crop/fertilizer/FertilizerExportModal.vue'
import { useFertilizerStore } from '@/stores/modules/fertilizer'
import { useIotStore } from '@/stores/modules/iot'

// Store
const fertilizerStore = useFertilizerStore()
const iotStore = useIotStore()

// 统计数据
const stats = computed(() => fertilizerStore.stats)

// 加载状态
const loading = computed(() => fertilizerStore.isLoading)

// 错误信息
const error = computed(() => fertilizerStore.error)

// 数据
const items = computed(() => fertilizerStore.items)

// 筛选条件
const filters = ref({})

// 操作模式
const operationMode = ref('normal')

// 统计面板显示状态
const showStats = ref(false)

// IoT设备列表（从施肥记录中提取auto_iot记录）
const iotDevices = computed(() => {
  const deviceMap = new Map()
  items.value.filter(it => it.dataSource === 'auto_iot').forEach((it) => {
    const key = it.iotDeviceId || 'unknown'
    const existing = deviceMap.get(key)
    if (existing) {
      existing.count++
      if (it.fertilizeTime > existing.lastActive) existing.lastActive = it.fertilizeTime
    } else {
      deviceMap.set(key, {
        deviceName: it.iotDeviceId || '未知IoT设备',
        count: 1,
        lastActive: it.fertilizeTime
      })
    }
  })
  return Array.from(deviceMap.entries()).map(([id, d]) => ({
    device_id: id,
    device_name: d.deviceName,
    record_count: d.count,
    last_active: d.lastActive || undefined,
  }))
})

// IoT加载状态
const iotLoading = computed(() => loading.value)

// 选中行
const selectedIds = ref([])

// 选中的记录
const selectedItems = computed(() => {
  return items.value.filter(it => selectedIds.value.includes(it.id))
})

// 弹窗状态
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const detailModalVisible = ref(false)
const batchDeleteModalVisible = ref(false)
const exportModalVisible = ref(false)

// 当前记录
const currentRecord = ref(null)

// 筛选变化
const handleFiltersChange = (newFilters) => {
  filters.value = newFilters
}

// 搜索
const handleSearch = () => {
  fertilizerStore.fetchItems(filters.value)
  selectedIds.value = []
  operationMode.value = 'normal'
}

// 重置
const handleReset = () => {
  filters.value = {}
  fertilizerStore.fetchItems({})
  selectedIds.value = []
  operationMode.value = 'normal'
}

// 加载数据
const loadItems = async () => {
  await fertilizerStore.fetchItems(filters.value)
}

// 新增
const handleAdd = () => {
  addModalVisible.value = true
}

// 新增成功
const handleAddSuccess = () => {
  addModalVisible.value = false
  loadItems()
}

// 编辑
const handleEdit = (record) => {
  currentRecord.value = record
  editModalVisible.value = true
}

// 编辑关闭
const handleEditClose = () => {
  editModalVisible.value = false
  currentRecord.value = null
}

// 编辑成功
const handleEditSuccess = () => {
  editModalVisible.value = false
  currentRecord.value = null
  loadItems()
}

// 详情
const handleDetail = (record) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

// 删除
const handleDelete = (id) => {
  fertilizerStore.deleteItem(id)
}

// 选择变化
const handleSelectionChange = (ids) => {
  selectedIds.value = ids
}

// 批量删除模式
const handleBatchDeleteMode = () => {
  operationMode.value = operationMode.value === 'delete' ? 'normal' : 'delete'
  selectedIds.value = []
}

// 取消批量删除
const handleCancelBatchDelete = () => {
  operationMode.value = 'normal'
  selectedIds.value = []
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return
  batchDeleteModalVisible.value = true
}

// 确认批量删除
const handleConfirmBatchDelete = async () => {
  await fertilizerStore.deleteItems(selectedIds.value)
  batchDeleteModalVisible.value = false
  selectedIds.value = []
  operationMode.value = 'normal'
  loadItems()
}

// 导出模式
const handleExportMode = () => {
  const toExport = selectedIds.value.length > 0
    ? items.value.filter((it) => selectedIds.value.includes(it.id))
    : items.value
  if (toExport.length === 0) return
  exportModalVisible.value = true
}

// 确认导出
const handleConfirmExport = (format) => {
  const toExport = selectedIds.value.length > 0
    ? items.value.filter((it) => selectedIds.value.includes(it.id))
    : items.value

  const headers = ['施肥编号', '肥料名称', '肥料类型', '作物品种', '温室位置', '稀释比例', '施肥量(kg)', '总成本', '施肥时间', '数据来源', '操作员']
  const rows = toExport.map((it) => [
    it.fertilizerCode,
    it.fertilizerName,
    it.fertilizerType,
    it.cropName,
    it.greenhouseName,
    it.dilutionRatio,
    it.quantity,
    it.totalCost,
    it.fertilizeTime,
    it.dataSource === 'auto_iot' ? 'IoT自动' : '手动',
    it.operatorName || '',
  ])

  if (format === 'csv') {
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `施肥记录_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } else if (format === 'xlsx' || format === 'word') {
    // 生成简单的 HTML 表格，能被 Excel/Word 打开
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>施肥记录</title>
<style>table{border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}th{background:#059669;color:#fff}</style>
</head><body><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`
    const blob = new Blob(['﻿' + html], { type: format === 'xlsx' ? 'application/vnd.ms-excel' : 'application/msword' })
    const ext = format === 'xlsx' ? '.xls' : '.doc'
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `施肥记录_${new Date().toISOString().slice(0, 10)}${ext}`
    link.click()
    URL.revokeObjectURL(url)
  }

  exportModalVisible.value = false
  selectedIds.value = []
  operationMode.value = 'normal'
}

// 切换统计面板
const handleToggleStats = () => {
  showStats.value = !showStats.value
}

// 初始化
onMounted(() => {
  loadItems()
  iotStore.fetchDevices()
})
</script>

<style scoped>
/* V1.1样式保持 */
</style>

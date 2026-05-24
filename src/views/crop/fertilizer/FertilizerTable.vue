<template>
  <!-- 施肥数据表格组件 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 表头操作栏 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-gray-900">施肥记录列表</h3>
        <IotDataIndicator :devices="iotDevices" :loading="iotLoading" />
        <el-button v-if="onToggleStats" size="small" @click="onToggleStats">
          <el-icon class="mr-1"><DataAnalysis /></el-icon>
          统计分析
          <el-icon class="ml-1"><ArrowUp v-if="showStats" /><ArrowDown v-if="!showStats" /></el-icon>
        </el-button>
      </div>
      <div class="flex items-center gap-2">
        <el-button size="small" type="primary" @click="onAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增
        </el-button>
        <el-button
          size="small"
          type="danger"
          :class="{ 'bg-red-700': operationMode === 'delete' }"
          @click="onBatchDeleteMode"
        >
          <el-icon class="mr-1"><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button size="small" @click="onExportMode">
          <el-icon class="mr-1"><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto">
      <el-table
        v-loading="isLoading"
        :data="currentData"
        :row-class-name="tableRowClassName"
        style="width: 100%"
        empty-text="暂无施肥记录"
      >
        <!-- 复选框列 -->
        <el-table-column v-if="showCheckbox" width="50" align="center">
          <template #header>
            <el-checkbox
              :model-value="currentData.length > 0 && selectedIds.length === currentData.length"
              @change="handleSelectAll"
            />
          </template>
          <template #default="{ row }">
            <el-checkbox
              :model-value="selectedIds.includes(row.id)"
              @change="handleSelectRow(row.id, $event)"
            />
          </template>
        </el-table-column>

        <!-- 施肥编号 -->
        <el-table-column prop="fertilizerCode" label="施肥编号" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" class="font-mono" @click="onDetail(row)">
              {{ row.fertilizerCode }}
            </el-button>
          </template>
        </el-table-column>

        <!-- 肥料名称 -->
        <el-table-column prop="fertilizerName" label="肥料名称" width="140" align="center">
          <template #default="{ row }">
            <span class="font-bold text-gray-900">{{ row.fertilizerName }}</span>
          </template>
        </el-table-column>

        <!-- 肥料类型 -->
        <el-table-column prop="fertilizerType" label="肥料类型" width="100" align="center">
          <template #default="{ row }">
            <span :class="getTypeBadgeClass(row.fertilizerType)">
              {{ getFertilizerTypeName(row.fertilizerType) }}
            </span>
          </template>
        </el-table-column>

        <!-- 作物品种 -->
        <el-table-column prop="cropName" label="作物品种" width="100" align="center">
          <template #default="{ row }">
            {{ row.cropName || '-' }}
          </template>
        </el-table-column>

        <!-- 温室位置 -->
        <el-table-column prop="greenhouseName" label="温室位置" width="140" align="center">
          <template #default="{ row }">
            {{ row.greenhouseName || '-' }}
          </template>
        </el-table-column>

        <!-- 稀释比例 -->
        <el-table-column prop="dilutionRatio" label="稀释比例" width="100" align="center">
          <template #default="{ row }">
            {{ row.dilutionRatio || '-' }}
          </template>
        </el-table-column>

        <!-- 施肥量 -->
        <el-table-column prop="quantity" label="施肥量" width="120" align="center">
          <template #default="{ row }">
            <span class="font-bold text-emerald-600">
              {{ formatNumber(row.quantity) }} {{ row.unit || 'kg' }}
            </span>
          </template>
        </el-table-column>

        <!-- 总成本 -->
        <el-table-column prop="totalCost" label="总成本" width="120" align="center">
          <template #default="{ row }">
            <span class="font-medium text-amber-600">
              {{ formatNumber(row.totalCost) }} 元
            </span>
          </template>
        </el-table-column>

        <!-- 施肥时间 -->
        <el-table-column prop="fertilizeTime" label="施肥时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.fertilizeTime || '-' }}
          </template>
        </el-table-column>

        <!-- 数据来源 -->
        <el-table-column prop="dataSource" label="数据来源" width="100" align="center">
          <template #default="{ row }">
            <span :class="getSourceBadgeClass(row.dataSource)">
              <span class="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
              {{ row.dataSource === 'auto_iot' ? 'IoT自动' : '手动' }}
            </span>
          </template>
        </el-table-column>

        <!-- 操作员 -->
        <el-table-column prop="operatorName" label="操作员" width="100" align="center">
          <template #default="{ row }">
            {{ row.operatorName || '-' }}
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1 justify-center">
              <el-button
                link
                type="info"
                class="text-gray-500 hover:text-blue-600"
                title="查看详情"
                @click="onDetail(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
              <template v-if="row.dataSource !== 'auto_iot'">
                <el-button
                  link
                  type="warning"
                  class="text-gray-500 hover:text-amber-600"
                  title="编辑"
                  @click="onEdit(row)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  link
                  type="danger"
                  class="text-gray-500 hover:text-red-600"
                  title="删除"
                  @click="onDelete(row.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div class="text-sm text-gray-500">
        共 {{ data.length }} 条记录
      </div>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="data.length"
        layout="sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Delete, Download, View, Edit, DataAnalysis, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import IotDataIndicator from './IotDataIndicator.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  operationMode: {
    type: String,
    default: 'normal'
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  iotDevices: {
    type: Array,
    default: () => []
  },
  iotLoading: {
    type: Boolean,
    default: false
  },
  showStats: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:selectedIds',
  'detail',
  'edit',
  'delete',
  'add',
  'batchDeleteMode',
  'exportMode',
  'toggleStats'
])

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 计算当前页数据
const totalPages = computed(() => Math.ceil(props.data.length / pageSize.value) || 1)
const startIdx = computed(() => (currentPage.value - 1) * pageSize.value)
const currentData = computed(() => props.data.slice(startIdx.value, startIdx.value + pageSize.value))

// 是否显示复选框
const showCheckbox = computed(() => props.operationMode === 'delete')

// 监听总页数变化，重置到第一页
watch(() => props.data.length, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})

// 全选/取消
const handleSelectAll = (checked) => {
  if (checked) {
    emit('update:selectedIds', props.data.map(it => it.id))
  } else {
    emit('update:selectedIds', [])
  }
}

// 选择行
const handleSelectRow = (id, checked) => {
  if (checked) {
    emit('update:selectedIds', [...props.selectedIds, id])
  } else {
    emit('update:selectedIds', props.selectedIds.filter(k => k !== id))
  }
}

// 表格行样式 - IoT记录有绿色左边框
const tableRowClassName = ({ row }) => {
  if (row.dataSource === 'auto_iot') {
    return 'border-l-4 border-l-green-400 bg-emerald-50/30'
  }
  return ''
}

// 获取肥料类型显示名称
const getFertilizerTypeName = (type) => {
  const typeMap = {
    organic: '有机肥',
    inorganic: '无机肥',
    biological: '生物肥',
    compound: '复合肥',
    trace: '微量元素肥'
  }
  return typeMap[type] || type || '-'
}

// 肥料类型Badge样式
const getTypeBadgeClass = (type) => {
  const colorMap = {
    organic: 'bg-emerald-100 text-emerald-700',
    inorganic: 'bg-blue-100 text-blue-700',
    biological: 'bg-purple-100 text-purple-700',
    compound: 'bg-amber-100 text-amber-700',
    trace: 'bg-cyan-100 text-cyan-700'
  }
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[type] || 'bg-gray-100 text-gray-700'}`
}

// 数据来源Badge样式
const getSourceBadgeClass = (source) => {
  if (source === 'auto_iot') {
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700'
  }
  return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700'
}

// 格式化数字
const formatNumber = (num) => {
  if (num == null) return '0'
  return num.toLocaleString()
}

// 事件处理
const onDetail = (record) => emit('detail', record)
const onEdit = (record) => emit('edit', record)
const onDelete = (id) => emit('delete', id)
const onAdd = () => emit('add')
const onBatchDeleteMode = () => emit('batchDeleteMode')
const onExportMode = () => emit('exportMode')
const onToggleStats = () => emit('toggleStats')
</script>

<style scoped>
/* V1.1样式保持 */
:deep(.el-table th.el-table__cell) {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  font-weight: 600;
  padding: 10px 8px;
}
:deep(.el-table th.el-table__cell .cell) {
  white-space: nowrap;
}
:deep(.el-table .el-table__row) {
  transition: background-color 0.2s;
}
:deep(.el-table .el-table__row:hover) {
  background-color: #f0fdf4;
}
</style>

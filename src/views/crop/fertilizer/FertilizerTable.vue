<template>
  <!-- 施肥数据表格组件 - 与种源管理SeedSourceTable.vue结构完全一致 -->
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
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="onAdd"
        >
          新增
        </button>
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 text-white hover:bg-red-700"
          :class="operationMode === 'delete' ? 'bg-red-700' : 'bg-red-600'"
          @click="onBatchDeleteMode"
        >
          批量删除
        </button>
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="onExportMode"
        >
          导出
        </button>
      </div>
    </div>

    <!-- 表格 - 使用原生table结构，与种源管理完全一致 -->
    <div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)]">
      <table class="min-w-[1400px] w-full table-fixed">
        <colgroup>
          <col v-if="showCheckbox" class="w-12" />
          <col class="w-36" />
          <col class="w-32" />
          <col class="w-24" />
          <col class="w-24" />
          <col class="w-32" />
          <col class="w-24" />
          <col class="w-28" />
          <col class="w-28" />
          <col class="w-36" />
          <col class="w-24" />
          <col class="w-24" />
          <col class="w-32" />
        </colgroup>
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-center text-sm font-semibold text-white whitespace-nowrap w-12">
              <el-checkbox
                :model-value="currentData.length > 0 && selectedIds.length === currentData.length"
                class="fert-checkbox"
                @change="handleSelectAll"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-36">施肥编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-32">肥料名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">肥料类型</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">作物品种</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-32">温室位置</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">稀释比例</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-28">施肥量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-28">总成本</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-36">施肥时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">数据来源</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">操作员</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-32">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="currentData.length === 0">
            <td :colspan="showCheckbox ? 13 : 12" class="px-4 py-8 text-center text-gray-500">
              暂无施肥记录
            </td>
          </tr>
          <tr
            v-for="record in currentData"
            :key="record.id"
            :class="[
              'hover:bg-emerald-50 transition-colors',
              record.dataSource === 'auto_iot' ? 'border-l-4 border-l-green-400 bg-emerald-50/30' : ''
            ]"
          >
            <td v-if="showCheckbox" class="px-4 py-3 text-center w-12">
              <el-checkbox
                :model-value="selectedIds.includes(record.id)"
                class="fert-checkbox"
                @change="handleSelectRow(record.id, $event)"
              />
            </td>
            <td class="px-4 py-3 text-sm w-36 whitespace-nowrap">
              <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline font-mono" title="点击查看详情" @click="onDetail(record)">
                {{ record.fertilizerCode }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm w-32 whitespace-nowrap">
              <span class="font-bold text-gray-900">{{ record.fertilizerName || '-' }}</span>
            </td>
            <td class="px-4 py-3 text-sm w-24 whitespace-nowrap">
              <span :class="getTypeBadgeClass(record.fertilizerType)">
                {{ getFertilizerTypeName(record.fertilizerType) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm w-24 whitespace-nowrap text-gray-700">{{ record.cropName || '-' }}</td>
            <td class="px-4 py-3 text-sm w-32 whitespace-nowrap text-gray-700">{{ record.greenhouseName || '-' }}</td>
            <td class="px-4 py-3 text-sm w-24 whitespace-nowrap text-gray-700">{{ record.dilutionRatio || '-' }}</td>
            <td class="px-4 py-3 text-sm w-28 whitespace-nowrap">
              <span class="font-bold text-emerald-600">
                {{ formatNumber(record.quantity) }} {{ record.unit || 'kg' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm w-28 whitespace-nowrap">
              <span class="font-medium text-amber-600">
                {{ formatNumber(record.totalCost) }} 元
              </span>
            </td>
            <td class="px-4 py-3 text-sm w-36 whitespace-nowrap text-gray-700">{{ record.fertilizeTime || '-' }}</td>
            <td class="px-4 py-3 text-sm w-24 whitespace-nowrap">
              <span :class="getSourceBadgeClass(record.dataSource)">
                <span class="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                {{ record.dataSource === 'auto_iot' ? 'IoT自动' : '手动' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm w-24 whitespace-nowrap text-gray-700">{{ record.operatorName || '-' }}</td>
            <td class="px-4 py-3 w-32 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="查看详情"
                  @click="onDetail(record)"
                >
                  👁️
                </button>
                <template v-if="record.dataSource !== 'auto_iot'">
                  <button
                    class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    title="编辑"
                    @click="onEdit(record)"
                  >
                    ✏️
                  </button>
                  <button
                    class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="删除"
                    @click="onDelete(record.id)"
                  >
                    🗑️
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
import { DataAnalysis, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
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
/* 加深复选框默认边框颜色 - 与种源管理表格一致 */
:deep(.fert-checkbox .el-checkbox__inner) {
  border-color: #374151;
}

:deep(.fert-checkbox:hover .el-checkbox__inner) {
  border-color: #059669;
}
</style>

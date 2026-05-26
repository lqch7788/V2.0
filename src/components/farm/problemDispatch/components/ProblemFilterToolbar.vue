<template>
  <!-- 问题分派筛选工具栏 - 从V1.1 ProblemFilterToolbar.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-center gap-4 flex-wrap">
      <!-- 时间筛选 -->
      <div class="flex items-center gap-2">
        <div class="flex rounded-lg overflow-hidden border border-gray-200">
          <button v-for="opt in timeOptions" :key="opt.value"
            class="px-3 py-1.5 text-sm border-none cursor-pointer transition-colors"
            :class="timeFilter === opt.value ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'"
            @click="$emit('timeFilterChange', opt.value)">
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 自定义时间段 -->
      <div v-if="timeFilter === 'custom'" class="flex items-center gap-2">
        <el-date-picker :model-value="dateRange.start" @update:model-value="handleStartDate"
          type="date" size="small" class="w-36" />
        <span class="text-sm text-gray-400">至</span>
        <el-date-picker :model-value="dateRange.end" @update:model-value="handleEndDate"
          type="date" size="small" class="w-36" />
      </div>

      <!-- 状态筛选 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">状态：</span>
        <el-select :model-value="statusFilter" @update:model-value="(v) => $emit('statusFilterChange', v)"
          size="small" class="w-auto">
          <el-option v-for="o in statusOptions" :key="o.value" :value="o.value" :label="o.label" />
        </el-select>
      </div>

      <!-- 严重程度筛选 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">严重程度：</span>
        <el-select :model-value="severityFilter" @update:model-value="(v) => $emit('severityFilterChange', v)"
          size="small" class="w-auto">
          <el-option v-for="o in severityOptions" :key="o.value" :value="o.value" :label="o.label" />
        </el-select>
      </div>

      <!-- 来源模块筛选 -->
      <SourceFilter :value="sourceModuleFilter" @change="(v) => $emit('sourceModuleChange', v)" />

      <!-- 操作按钮 -->
      <div v-if="exportMode" class="flex gap-2 ml-auto">
        <el-button size="small" type="primary" @click="$emit('confirmExport')">
          <el-icon><Download /></el-icon>确认导出
        </el-button>
        <el-button size="small" @click="$emit('cancelExport')">取消</el-button>
      </div>
      <div v-else-if="batchDeleteMode" class="flex gap-2 ml-auto">
        <el-button size="small" type="danger" :disabled="selectedRowsLength === 0" @click="$emit('confirmDelete')">
          <el-icon><Delete /></el-icon>确认删除
        </el-button>
        <el-button size="small" @click="$emit('cancelBatchDelete')">取消</el-button>
      </div>
      <div v-else-if="batchDispatchMode" class="flex gap-2 ml-auto">
        <el-button size="small" type="warning" :disabled="selectedProblemsLength === 0" @click="$emit('confirmDispatch')">
          <el-icon><Promotion /></el-icon>确认分派
        </el-button>
        <el-button size="small" @click="$emit('cancelBatchDispatch')">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Download, Delete, Promotion } from '@element-plus/icons-vue'
import SourceFilter from './SourceFilter.vue'

defineProps({
  timeFilter: { type: String, default: 'all' },
  dateRange: { type: Object, default: () => ({ start: '', end: '' }) },
  statusFilter: { type: String, default: 'all' },
  severityFilter: { type: String, default: 'all' },
  sourceModuleFilter: { type: String, default: 'all' },
  exportMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  batchDispatchMode: { type: Boolean, default: false },
  selectedRowsLength: { type: Number, default: 0 },
  selectedProblemsLength: { type: Number, default: 0 },
})

const emit = defineEmits([
  'timeFilterChange', 'dateRangeChange', 'statusFilterChange', 'severityFilterChange',
  'sourceModuleChange', 'confirmExport', 'cancelExport', 'confirmDelete', 'cancelBatchDelete',
  'confirmDispatch', 'cancelBatchDispatch',
])

const timeOptions = [
  { value: 'all', label: '全部' }, { value: 'week', label: '本周' },
  { value: 'month', label: '本月' }, { value: 'year', label: '本年' },
  { value: 'custom', label: '时间段' },
]

const statusOptions = [
  { value: 'all', label: '全部' }, { value: 'pending', label: '待分派' },
  { value: 'dispatched', label: '已分派' }, { value: 'handled', label: '已处理' },
]

const severityOptions = [
  { value: 'all', label: '全部' }, { value: '轻微', label: '轻微' },
  { value: '中等', label: '中等' }, { value: '严重', label: '严重' },
]

const handleStartDate = (date) => {
  if (date) {
    const d = new Date(date)
    emit('dateRangeChange', { ...arguments[1], start: d.toISOString().split('T')[0] })
  }
}

const handleEndDate = (date) => {
  if (date) {
    const d = new Date(date)
    emit('dateRangeChange', { ...arguments[1], end: d.toISOString().split('T')[0] })
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="flex border-b border-gray-200">
      <button
        type="button"
        :class="[
          'px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors rounded-none bg-transparent',
          taskFilter === 'all'
            ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
        @click="onFilterChange('all')"
      >
        全部任务
        <span class="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
          {{ taskCounts.all }}
        </span>
      </button>
      <button
        type="button"
        :class="[
          'px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors rounded-none bg-transparent',
          taskFilter === 'production'
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
        @click="onFilterChange('production')"
      >
        农事任务处理
        <span class="px-2 py-0.5 bg-blue-200 text-blue-600 rounded-full text-xs">
          {{ taskCounts.production }}
        </span>
      </button>
      <button
        type="button"
        :class="[
          'px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors rounded-none bg-transparent',
          taskFilter === 'temp'
            ? 'border-orange-500 text-orange-600 bg-orange-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
        @click="onFilterChange('temp')"
      >
        临时任务处理
        <span class="px-2 py-0.5 bg-orange-200 text-orange-600 rounded-full text-xs">
          {{ taskCounts.temp }}
        </span>
      </button>
      <button
        type="button"
        :class="[
          'px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors rounded-none bg-transparent',
          taskFilter === 'problem'
            ? 'border-orange-500 text-orange-600 bg-orange-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
        @click="onFilterChange('problem')"
      >
        巡查反馈处理
        <span class="px-2 py-0.5 bg-orange-200 text-orange-600 rounded-full text-xs">
          {{ taskCounts.problem }}
        </span>
      </button>
      <button
        type="button"
        :class="[
          'px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors rounded-none bg-transparent',
          taskFilter === 'worklog'
            ? 'border-purple-500 text-purple-600 bg-purple-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
        @click="onFilterChange('worklog')"
      >
        <el-icon class="w-4 h-4"><Notebook /></el-icon>
        工作日志
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * 任务类型 Tab 筛选组件
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/TaskFilterTabs.tsx
 *
 * Props:
 *   taskFilter - 当前筛选类型
 *   taskCounts - 各类型任务数量
 *   onFilterChange - 切换回调
 */
import { Notebook } from '@element-plus/icons-vue'

defineProps({
  taskFilter: {
    type: String,
    required: true,
  },
  taskCounts: {
    type: Object,
    required: true,
  },
  onFilterChange: {
    type: Function,
    required: true,
  },
})
</script>
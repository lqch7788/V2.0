<template>
  <div class="space-y-4">
    <!-- 筛选栏 -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">状态:</span>
        <el-select
          :model-value="filters.status"
          @change="(val) => onFilterChange('status', val)"
          placeholder="全部状态"
          class="min-w-[120px]"
        >
          <el-option label="全部状态" value="all" />
          <el-option label="待执行" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </div>

      <!-- 视图切换 -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
        <el-button
          :type="viewMode === 'list' ? 'primary' : ''"
          size="small"
          @click="viewMode = 'list'"
        >
          列表
        </el-button>
        <el-button
          :type="viewMode === 'calendar' ? 'primary' : ''"
          size="small"
          @click="viewMode = 'calendar'"
        >
          日历
        </el-button>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="bg-white rounded-lg p-4">
      <p class="text-gray-500 text-center py-8">任务表格组件 - 待实现</p>
    </div>

    <!-- 日历视图 -->
    <div v-else class="bg-white rounded-lg p-4">
      <p class="text-gray-500 text-center py-8">日历视图组件 - 待实现</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
  selectedIds
  filters: { status: string; type: string; area: string; search: string; assignee: string; batchCode: string }
  onFilterChange: (key, value) => void
  onResetFilters: () => void
}

defineProps({})

const viewMode = ref('list')
</script>

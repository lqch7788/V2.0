<template>
  <div class="bg-[#F2F6FA] rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    <div class="flex flex-wrap items-end gap-4">
      <!-- 筛选条件 - 均匀分布 grid -->
      <div class="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
        <!-- 任务ID搜索 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">任务ID</label>
          <el-input
            :model-value="taskIdSearch"
            @update:model-value="onTaskIdChange"
            placeholder="搜索任务ID"
            size="default"
            class="filter-input"
          />
        </div>

        <!-- 时间范围筛选 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">时间范围</label>
          <el-select
            :model-value="timeFilter"
            @update:model-value="onTimeFilterChange"
            placeholder="全部"
            size="default"
            class="w-full"
          >
            <el-option
              v-for="opt in TIME_FILTER_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <!-- 任务区域筛选 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">任务区域编号</label>
          <el-select
            :model-value="fieldFilter"
            @update:model-value="onFieldFilterChange"
            placeholder="全部任务区域"
            size="default"
            class="w-full"
          >
            <el-option value="all" label="全部任务区域" />
            <el-option
              v-for="f in fields"
              :key="f.id"
              :label="`${f.name} (${f.crop})`"
              :value="f.name"
            />
          </el-select>
        </div>

        <!-- 执行人筛选 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">执行人</label>
          <el-select
            :model-value="assigneeFilter"
            @update:model-value="onAssigneeFilterChange"
            placeholder="全部人员"
            size="default"
            class="w-full"
          >
            <el-option value="all" label="全部人员" />
            <el-option
              v-for="s in staff"
              :key="s.id"
              :label="s.name"
              :value="s.name"
            />
          </el-select>
        </div>

        <!-- 状态筛选 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">状态</label>
          <el-select
            :model-value="statusFilter"
            @update:model-value="onStatusFilterChange"
            placeholder="全部状态"
            size="default"
            class="w-full"
          >
            <el-option
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <el-button size="small" @click="onResetFilters">
          重置
        </el-button>
        <el-button v-if="canImport" size="small" @click="onImport">
          <el-icon class="mr-1"><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button
          v-if="canSmartRecommend"
          size="small"
          class="smart-recommend-btn"
          @click="onSmartRecommend"
        >
          <el-icon class="mr-1"><MagicStick /></el-icon>
          智能推荐
        </el-button>

        <!-- 视图切换 -->
        <div class="flex border border-gray-200 rounded-lg overflow-hidden ml-2">
          <el-button
            :class="viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'"
            size="small"
            @click="onViewModeChange('list')"
            class="view-toggle-btn"
          >
            <el-icon class="mr-1"><List /></el-icon>
            列表
          </el-button>
          <el-button
            :class="viewMode === 'calendar' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'"
            size="small"
            @click="onViewModeChange('calendar')"
            class="view-toggle-btn"
          >
            <el-icon class="mr-1"><Calendar /></el-icon>
            日历
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Upload, MagicStick, List, Calendar } from '@element-plus/icons-vue'
import { STATUS_OPTIONS, TIME_FILTER_OPTIONS } from '@/constants/taskDispatch'

defineProps({
  // 筛选值
  taskIdSearch: { type: String, default: '' },
  timeFilter: { type: String, default: 'all' },
  fieldFilter: { type: String, default: 'all' },
  assigneeFilter: { type: String, default: 'all' },
  statusFilter: { type: String, default: 'all' },
  // 数据
  fields: { type: Array, default: () => [] },
  staff: { type: Array, default: () => [] },
  // 视图模式
  viewMode: { type: String, default: 'list' },
  // 权限控制
  canImport: { type: Boolean, default: true },
  canSmartRecommend: { type: Boolean, default: true },
  // 操作回调
  onTaskIdChange: { type: Function, default: () => {} },
  onTimeFilterChange: { type: Function, default: () => {} },
  onFieldFilterChange: { type: Function, default: () => {} },
  onAssigneeFilterChange: { type: Function, default: () => {} },
  onStatusFilterChange: { type: Function, default: () => {} },
  onResetFilters: { type: Function, default: () => {} },
  onImport: { type: Function, default: () => {} },
  onSmartRecommend: { type: Function, default: () => {} },
  onViewModeChange: { type: Function, default: () => {} }
})
</script>

<style scoped>
.filter-input :deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  border-color: #9ca3af;
  box-shadow: none;
}
.filter-input :deep(.el-input__wrapper:focus),
.filter-input :deep(.el-input__wrapper.is-focus) {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.smart-recommend-btn {
  background: linear-gradient(135deg, #7c3aed, #9333ea, #db2777);
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.3);
  transition: all 0.3s;
}
.smart-recommend-btn:hover {
  background: linear-gradient(135deg, #8b5cf6, #a855f7, #e879f9);
  box-shadow: 0 6px 12px -2px rgba(168, 85, 247, 0.5);
}

.view-toggle-btn {
  border: none;
  border-radius: 0;
}
.view-toggle-btn:hover {
  background-color: rgb(243 244 246);
}
</style>

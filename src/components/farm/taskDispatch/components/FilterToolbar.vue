<template>
  <div class="bg-[#F2F6FA] rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    <div class="flex flex-wrap items-end gap-4">
      <!-- 筛选条件 -->
      <div class="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
        <!-- 任务ID搜索 -->
        <div>
          <span class="text-xs text-gray-500 block mb-1">任务ID</span>
          <el-input
            :model-value="taskIdSearch"
            @input="onTaskIdChange"
            placeholder="搜索任务ID"
          />
        </div>

        <!-- 时间范围筛选 -->
        <div>
          <span class="text-xs text-gray-500 block mb-1">时间范围</span>
          <el-select
            :model-value="timeFilter"
            @change="onTimeFilterChange"
            placeholder="全部"
            class="w-full"
          >
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="全部" value="all" />
          </el-select>
        </div>

        <!-- 任务区域筛选 -->
        <div>
          <span class="text-xs text-gray-500 block mb-1">任务区域编号</span>
          <el-select
            :model-value="fieldFilter"
            @change="onFieldFilterChange"
            placeholder="全部任务区域"
            class="w-full"
          >
            <el-option label="全部任务区域" value="all" />
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
          <span class="text-xs text-gray-500 block mb-1">执行人</span>
          <el-select
            :model-value="assigneeFilter"
            @change="onAssigneeFilterChange"
            placeholder="全部人员"
            class="w-full"
          >
            <el-option label="全部人员" value="all" />
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
          <span class="text-xs text-gray-500 block mb-1">状态</span>
          <el-select
            :model-value="statusFilter"
            @change="onStatusFilterChange"
            placeholder="全部状态"
            class="w-full"
          >
            <el-option label="全部状态" value="all" />
            <el-option label="待执行" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <el-button @click="onResetFilters">重置</el-button>
        <el-button type="primary" @click="onImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button
          type="primary"
          @click="onSmartRecommend"
          class="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
        >
          <el-icon><MagicStick /></el-icon>
          智能推荐
        </el-button>

        <!-- 视图切换 -->
        <div class="flex border border-gray-200 rounded-lg overflow-hidden ml-2">
          <el-button
            @click="() => onViewModeChange('list')"
            :type="viewMode === 'list' ? 'primary' : ''"
            class="rounded-none"
          >
            <el-icon><List /></el-icon>
            列表
          </el-button>
          <el-button
            @click="() => onViewModeChange('calendar')"
            :type="viewMode === 'calendar' ? 'primary' : ''"
            class="rounded-none"
          >
            <el-icon><Calendar /></el-icon>
            日历
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Upload, MagicStick, List, Calendar } from '@element-plus/icons-vue'

defineProps({})
</script>

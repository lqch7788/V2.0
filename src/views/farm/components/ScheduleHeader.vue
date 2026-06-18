<!--
  ScheduleHeader.vue - 排班页面标题 + 快捷操作栏
  V1.1 SchedulePage.tsx 顶部 1:1 对齐
  从 Schedule.vue 提取
-->
<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Calendar /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">排班调度</h1>
          <p class="text-gray-500">员工排班管理与调班申请</p>
        </div>
      </div>
    </div>

    <!-- 快捷操作栏 -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <el-button :type="displayMode === 'calendar' ? 'primary' : ''" size="small" @click="$emit('update:displayMode', 'calendar')">
            <el-icon><Calendar /></el-icon>
            日历视图
          </el-button>
          <el-button :type="displayMode === 'table' ? 'primary' : ''" size="small" @click="$emit('update:displayMode', 'table')">
            <el-icon><List /></el-icon>
            表格视图
          </el-button>
        </div>

        <div class="flex items-center gap-2">
          <el-button size="small" class="!bg-purple-600 !border-purple-600 !text-white hover:!bg-purple-700" @click="$emit('openSwap')">
            <el-icon><User /></el-icon>
            调班申请
          </el-button>
          <el-button size="small" class="!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700" @click="$emit('openShiftEditor')">
            <el-icon><Setting /></el-icon>
            班次设置
          </el-button>
          <el-button type="primary" size="small" @click="$emit('openAdd')">
            <el-icon><Plus /></el-icon>
            新增排班
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, List, User, Setting, Plus } from '@element-plus/icons-vue'

defineProps({
  displayMode: { type: String, default: 'calendar' },
})

defineEmits(['update:displayMode', 'openSwap', 'openShiftEditor', 'openAdd'])
</script>

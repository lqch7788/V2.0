<!--
  ScheduleSidebar.vue - 排班侧边栏
  V1.1 SchedulePage.tsx 1:1 对齐：排班详情 + 调班申请列表 + 班次图例
  从 Schedule.vue 提取
-->
<template>
  <div class="space-y-4">
    <!-- 排班详情 -->
    <div v-if="selectedSchedule" class="bg-white rounded-lg shadow p-4">
      <h3 class="font-medium text-gray-800 mb-3">排班详情</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">员工:</span>
          <span class="font-medium text-gray-800">{{ selectedSchedule.staffName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">日期:</span>
          <span class="text-gray-800">{{ selectedSchedule.date }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">班次:</span>
          <span class="font-medium text-gray-800">{{ selectedSchedule.shift }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">工作区:</span>
          <span class="text-gray-800">{{ selectedSchedule.workZone }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">状态:</span>
          <span :class="[
            'px-2 py-0.5 rounded text-xs',
            selectedSchedule.status === '已排班' ? 'bg-blue-100 text-blue-700' : '',
            selectedSchedule.status === '已执行' ? 'bg-green-100 text-green-700' : '',
            selectedSchedule.status === '已取消' ? 'bg-gray-100 text-gray-600' : '',
          ]">{{ selectedSchedule.status }}</span>
        </div>
        <div v-if="selectedSchedule.checkIn" class="flex justify-between">
          <span class="text-gray-500">签到:</span>
          <span class="text-green-600">{{ selectedSchedule.checkIn }}</span>
        </div>
        <div v-if="selectedSchedule.checkOut" class="flex justify-between">
          <span class="text-gray-500">签退:</span>
          <span class="text-red-600">{{ selectedSchedule.checkOut }}</span>
        </div>
      </div>
      <el-button
        v-if="selectedSchedule.status === '已排班'"
        size="small"
        class="w-full mt-4 !border-red-200 !text-red-600 hover:!bg-red-50"
        @click="emit('cancelSchedule', selectedSchedule)"
      >
        <el-icon><Close /></el-icon>取消排班
      </el-button>
    </div>

    <!-- 调班申请列表 -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-medium text-gray-800">调班申请</h3>
        <span class="text-xs text-gray-500">{{ pendingSwapCount }} 待处理</span>
      </div>
      <div class="space-y-3">
        <div v-for="request in swapRequests.slice(0, 5)" :key="request.id" class="p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-1">
            <span class="font-medium text-gray-800">{{ request.requesterName }}</span>
            <el-tag :type="getSwapStatusType(request.status)" size="small">{{ request.status }}</el-tag>
          </div>
          <p class="text-xs text-gray-500">{{ request.originalDate }} → {{ request.targetDate }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ request.reason }}</p>
          <div v-if="request.status === '待审批'" class="flex gap-2 mt-2">
            <el-button size="small" type="success" @click="emit('swapApprove', request)">同意</el-button>
            <el-button size="small" type="danger" @click="emit('swapReject', request)">拒绝</el-button>
          </div>
        </div>
        <div v-if="swapRequests.length === 0" class="text-center text-gray-400 py-4">
          暂无调班申请
        </div>
      </div>
    </div>

    <!-- 班次图例 -->
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="font-medium text-gray-800 mb-3">班次图例</h3>
      <div class="space-y-2">
        <div v-for="config in shiftConfigs" :key="config.name" class="flex items-center gap-2">
          <div :class="['w-3 h-3 rounded', config.color]" />
          <span class="text-sm text-gray-600">{{ config.name }}</span>
          <span class="text-xs text-gray-400 ml-auto">{{ config.startTime }}-{{ config.endTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue'

defineProps({
  selectedSchedule: { type: Object, default: null },
  swapRequests: { type: Array, default: () => [] },
  pendingSwapCount: { type: Number, default: 0 },
  shiftConfigs: { type: Array, default: () => [] },
  getSwapStatusType: { type: Function, required: true },
})

const emit = defineEmits(['cancelSchedule', 'swapApprove', 'swapReject'])
</script>

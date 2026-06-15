<template>
  <!-- 任务编号 -->
  <td class="px-3 py-3 text-sm font-medium whitespace-nowrap">
    <button
      class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
      title="点击查看详情"
      @click="onOpenDetailModal(task)"
    >
      {{ task.taskCode }}
    </button>
  </td>
  <!-- 任务名称 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex items-center gap-2">
      <el-icon v-if="isTempTask && task.urgency === 'critical'" class="w-4 h-4 text-red-500 flex-shrink-0">
        <Warning />
      </el-icon>
      <span class="font-medium text-gray-900 text-sm">{{ task.title }}</span>
    </div>
  </td>
  <!-- 类型 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{{ task.typeName || '-' }}</td>
  <!-- 工作地点 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex items-center gap-1 text-sm text-gray-600">
      <el-icon class="w-4 h-4 text-gray-400 flex-shrink-0"><Location /></el-icon>
      {{ task.field || '-' }}
    </div>
  </td>
  <!-- 负责人 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex items-center gap-1 text-sm text-gray-600">
      <el-icon class="w-4 h-4 text-gray-400 flex-shrink-0"><User /></el-icon>
      {{ task.assigneeName || '-' }}
    </div>
  </td>
  <!-- 开始时间 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex items-center gap-1 text-sm text-gray-600">
      <el-icon class="w-4 h-4 text-gray-400 flex-shrink-0"><Clock /></el-icon>
      {{ task.startDate ? formatDateShort(task.startDate) : '-' }}
    </div>
  </td>
  <!-- 预计结束 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex items-center gap-1 text-sm text-emerald-600">
      <el-icon class="w-4 h-4 text-emerald-400 flex-shrink-0"><Clock /></el-icon>
      {{ formatExpectedEndDate(task.startDate, task.estimatedDays, task.estimatedHours) }}
    </div>
  </td>
  <!-- 人工 -->
  <td class="px-3 py-3 text-center text-sm text-gray-600">{{ task.workerCount || 1 }}人</td>
  <!-- 总工时 -->
  <td class="px-3 py-3 text-center text-sm font-medium text-emerald-600">{{ totalHours }}h</td>
  <!-- 状态 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span
      :class="[
        'px-2 py-1 rounded-full text-xs font-medium',
        STATUS_MAP[task.status]?.bg || 'bg-gray-100',
        STATUS_MAP[task.status]?.color || 'text-gray-600'
      ]"
    >
      {{ STATUS_MAP[task.status]?.label || task.status }}
    </span>
  </td>
  <!-- 紧急程度 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span
      :class="['px-2 py-1 rounded-full text-xs font-medium', TEMP_TASK_URGENCY_CONFIG[task.urgency]?.badge || 'bg-gray-100 text-gray-600']"
    >
      {{ TEMP_TASK_URGENCY_CONFIG[task.urgency]?.label || task.urgency || '-' }}
    </span>
  </td>
  <!-- 超时 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span class="text-xs text-gray-400">-</span>
  </td>
  <!-- 操作 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <!-- pending: 接受+拒绝 -->
    <div v-if="task.status === 'pending'" class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-green-500 hover:bg-green-600 rounded text-xs font-medium transition-colors"
        title="接受任务"
        @click="onAccept(task)"
      >
        <el-icon class="w-3 h-3"><CircleCheck /></el-icon>
        接受
      </button>
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-red-500 hover:bg-red-600 rounded text-xs font-medium transition-colors"
        title="拒绝任务"
        @click="onReject(task)"
      >
        <el-icon class="w-3 h-3"><CircleClose /></el-icon>
        拒绝
      </button>
    </div>
    <!-- accepted/in_progress: 提交进度 -->
    <button
      v-if="task.status === 'accepted' || task.status === 'in_progress'"
      class="flex items-center gap-1 px-2 py-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded text-xs font-medium transition-colors"
      title="点击提交进度"
      @click="onOpenFeedbackModal(task)"
    >
      <el-icon class="w-3 h-3"><EditPen /></el-icon>
      提交进度
    </button>
    <!-- rejected: 继续执行+查看 -->
    <div v-if="task.status === 'rejected'" class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-orange-500 hover:bg-orange-600 rounded text-xs font-medium transition-colors"
        title="点击继续执行"
        @click="onContinueExecution(task)"
      >
        <el-icon class="w-3 h-3"><VideoPlay /></el-icon>
        继续执行
      </button>
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
        title="点击查看详情"
        @click="onOpenDetailModal(task)"
      >
        <el-icon class="w-3 h-3"><View /></el-icon>
        查看
      </button>
    </div>
    <!-- waiting_acceptance/completed: 查看 -->
    <button
      v-if="task.status === 'waiting_acceptance' || task.status === 'completed'"
      class="flex items-center gap-1 px-2 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
      title="点击查看详情"
      @click="onOpenDetailModal(task)"
    >
      <el-icon class="w-3 h-3"><View /></el-icon>
      查看
    </button>
  </td>
</template>

<script setup>
/**
 * 临时任务表格行组件（叶子组件 - 仅渲染 <td> 单元格）
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/TempTaskTableRow.tsx
 */
import { computed } from 'vue'
import {
  CircleCheck, CircleClose, VideoPlay, View, EditPen,
  Warning, Location, User, Clock,
} from '@element-plus/icons-vue'
import { STATUS_MAP, TEMP_TASK_URGENCY_CONFIG, formatDateShort, formatExpectedEndDate } from './constants.js'

const props = defineProps({
  task: { type: Object, required: true },
  onAccept: { type: Function, required: true },
  onReject: { type: Function, required: true },
  onContinueExecution: { type: Function, required: true },
  onOpenFeedbackModal: { type: Function, required: true },
  onOpenDetailModal: { type: Function, required: true },
})

const isTempTask = computed(() => props.task.sourceType === 'tempTask')
const totalHours = computed(() => {
  return ((props.task.estimatedDays || 0) * 8 + (props.task.estimatedHours || 0)) * (props.task.workerCount || 1)
})
</script>
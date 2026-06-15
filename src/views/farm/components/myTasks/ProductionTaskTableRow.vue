<template>
  <!-- 任务ID -->
  <td class="px-3 py-3 text-sm font-medium whitespace-nowrap">
    <button
      class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
      title="点击查看详情"
      @click="onOpenDetailModal(task)"
    >
      {{ task.id }}
    </button>
  </td>
  <!-- 任务类型 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex flex-wrap gap-1 items-center">
      <template v-for="(typeValue, idx) in displayTypes" :key="idx">
        <span
          v-if="getTypeLabel(typeValue) === '其他'"
          class="text-orange-500 text-xs"
        >其他</span>
        <span
          v-else
          :class="['inline-flex px-2 py-0.5 rounded text-xs text-white', getTypeColor(typeValue)]"
        >{{ getTypeLabel(typeValue) }}</span>
      </template>
      <span v-if="extraTypeCount > 0" class="text-xs text-gray-500">+{{ extraTypeCount }}</span>
    </div>
  </td>
  <!-- 任务区域 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{{ task.field || '-' }}</td>
  <!-- 作物 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{{ task.crop || '-' }}</td>
  <!-- 负责人 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span class="text-sm text-gray-700">{{ task.assigneeName || '-' }}</span>
  </td>
  <!-- 计划开始 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{{ planStartDate || '-' }}</td>
  <!-- 计划结束 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{{ task.planEnd || '-' }}</td>
  <!-- 任务工时 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{{ totalEstimatedHours }}小时</td>
  <!-- 进度 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex items-center gap-2">
      <div class="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          :class="['h-full rounded-full', progressBarClass]"
          :style="{ width: (task.progress || 0) + '%' }"
        />
      </div>
      <span class="text-xs text-gray-500">{{ task.progress || 0 }}%</span>
    </div>
  </td>
  <!-- 优先级 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span :class="['text-xs font-medium', PRIORITY_MAP[task.priority]?.color || 'text-gray-500']">
      {{ PRIORITY_MAP[task.priority]?.label || task.priority }}
    </span>
  </td>
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
  <!-- 备注 -->
  <td
    class="px-3 py-3 text-sm text-gray-600 max-w-[150px] truncate"
    :title="task.typeLabel || '-'"
  >
    {{ task.typeLabel || '-' }}
  </td>
  <!-- 作业标准 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <button
      v-if="types.length >= 2 && task.sopContent"
      class="text-blue-600 hover:text-blue-800 underline text-xs flex items-center gap-1"
      @click="onOpenSopModal(task, $event)"
    >
      <el-icon class="w-4 h-4"><Document /></el-icon>
      SOP文件
    </button>
    <span v-else class="text-gray-400 text-xs">-</span>
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
 * 生产任务表格行组件（叶子组件 - 仅渲染 <td> 单元格）
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/ProductionTaskTableRow.tsx
 */
import { computed } from 'vue'
import { CircleCheck, CircleClose, VideoPlay, View, EditPen, Document } from '@element-plus/icons-vue'
import { STATUS_MAP, PRIORITY_MAP, getTypeColor, getTypeLabel } from './constants.js'

const props = defineProps({
  task: { type: Object, required: true },
  onAccept: { type: Function, required: true },
  onReject: { type: Function, required: true },
  onContinueExecution: { type: Function, required: true },
  onOpenFeedbackModal: { type: Function, required: true },
  onOpenDetailModal: { type: Function, required: true },
  onOpenSopModal: { type: Function, required: true },
})

const types = computed(() => props.task.types || [])
const displayTypes = computed(() => types.value.slice(0, 2))
const extraTypeCount = computed(() => Math.max(0, types.value.length - 2))
const planStartDate = computed(() => props.task.planStart?.split(' ')[0] || '')
const totalEstimatedHours = computed(() => {
  return ((props.task.estimatedDays || 0) * 8 + (props.task.estimatedHours || 0)) || 0
})
const progressBarClass = computed(() => {
  if (props.task.progress === 100) return 'bg-green-500'
  if ((props.task.progress || 0) > 0) return 'bg-blue-500'
  return 'bg-gray-300'
})
</script>
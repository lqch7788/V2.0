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
          class="inline-flex px-2 py-0.5 rounded text-xs text-white"
          :class="getTypeColor(typeValue)"
        >{{ getTypeLabel(typeValue) }}</span>
      </template>
      <span v-if="extraTypeCount > 0" class="text-xs text-gray-500">+{{ extraTypeCount }}</span>
    </div>
  </td>

  <!-- 任务区域 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    {{ task.field || '-' }}
  </td>

  <!-- 作物 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    {{ task.crop || '-' }}
  </td>

  <!-- 负责人 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span class="text-sm text-gray-700">{{ task.assigneeName || '-' }}</span>
  </td>

  <!-- 计划开始 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    {{ planStartDate || '-' }}
  </td>

  <!-- 计划结束 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    {{ task.planEnd || '-' }}
  </td>

  <!-- 任务工时 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    {{ totalEstimatedHours }}小时
  </td>

  <!-- 进度 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <div class="flex items-center gap-2">
      <div class="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          class="h-full rounded-full"
          :class="progressBarClass"
          :style="{ width: (task.progress || 0) + '%' }"
        />
      </div>
      <span class="text-xs text-gray-500">{{ task.progress || 0 }}%</span>
    </div>
  </td>

  <!-- 优先级 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span
      class="text-xs font-medium"
      :class="PRIORITY_MAP[task.priority]?.color || 'text-gray-500'"
    >
      {{ PRIORITY_MAP[task.priority]?.label || task.priority }}
    </span>
  </td>

  <!-- 状态 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <span
      class="px-2 py-1 rounded-full text-xs font-medium"
      :class="[
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
      @click="(e) => onOpenSopModal(task, e)"
    >
      <el-icon class="w-3 h-3"><Document /></el-icon>
      SOP文件
    </button>
    <span v-else class="text-gray-400 text-xs">-</span>
  </td>

  <!-- 操作 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <!-- pending: 接受+拒绝 -->
    <div v-if="task.status === 'pending'" class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-green-500 hover:bg-green-600 rounded-lg text-xs font-medium transition-colors"
        title="接受任务"
        @click="onAccept(task)"
      >
        <el-icon class="w-3 h-3"><CircleCheck /></el-icon>
        接受
      </button>
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-red-500 hover:bg-red-600 rounded-lg text-xs font-medium transition-colors"
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
      class="flex items-center gap-1.5 px-3 py-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
      title="点击提交进度"
      @click="onOpenFeedbackModal(task)"
    >
      <el-icon class="w-4 h-4"><Edit /></el-icon>
      提交进度
    </button>

    <!-- rejected: 继续执行+查看 -->
    <div v-if="task.status === 'rejected'" class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-medium transition-colors"
        title="点击继续执行"
        @click="onContinueExecution(task)"
      >
        <el-icon class="w-3 h-3"><VideoPlay /></el-icon>
        继续执行
      </button>
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-gray-600 hover:text-white bg-gray-100 hover:bg-gray-500 rounded-lg text-xs font-medium transition-colors"
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
      class="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-white bg-gray-100 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
      title="点击查看详情"
      @click="onOpenDetailModal(task)"
    >
      <el-icon class="w-4 h-4"><View /></el-icon>
      查看
    </button>
  </td>
</template>

<script setup>
/**
 * 生产任务表格行组件（叶子组件 - 仅渲染 <td> 单元格，由父级 <tr> 包裹）
 * @description 1:1 翻译自 V1.1 ProductionTaskTableRow.tsx
 */

import { computed } from 'vue'
import {
  CircleCheck,
  CircleClose,
  VideoPlay,
  View,
  Edit,
  Document
} from '@element-plus/icons-vue'

/**
 * @typedef {Object} TaskDispatchTask
 * @property {string} id - 任务ID
 * @property {string} [taskCode] - 任务编号
 * @property {string} [title] - 任务标题
 * @property {string[]} [types] - 任务类型数组
 * @property {string} [typeLabel] - 类型展示文本
 * @property {string} [typeName] - 类型名称
 * @property {string} [field] - 任务区域
 * @property {string} [crop] - 作物
 * @property {string} [assigneeName] - 负责人姓名
 * @property {string} [planStart] - 计划开始时间
 * @property {string} [planEnd] - 计划结束时间
 * @property {number} [progress] - 进度（0-100）
 * @property {string} [status] - 状态
 * @property {string} [priority] - 优先级
 * @property {number} [estimatedDays] - 预估天数
 * @property {number} [estimatedHours] - 预估小时数
 * @property {string} [sopContent] - SOP文件内容
 */

/**
 * @typedef {(task: TaskDispatchTask) => void} TaskCallback
 */

/**
 * @typedef {(task: TaskDispatchTask, e: MouseEvent) => void} SopCallback
 */

const props = defineProps({
  /** 当前任务行数据 */
  task: {
    type: Object,
    required: true
  },
  /** 接受任务回调 */
  onAccept: {
    type: Function,
    required: true
  },
  /** 拒绝任务回调 */
  onReject: {
    type: Function,
    required: true
  },
  /** 继续执行回调（rejected → in_progress） */
  onContinueExecution: {
    type: Function,
    required: true
  },
  /** 打开反馈弹窗回调 */
  onOpenFeedbackModal: {
    type: Function,
    required: true
  },
  /** 打开详情弹窗回调 */
  onOpenDetailModal: {
    type: Function,
    required: true
  },
  /** 打开SOP弹窗回调 */
  onOpenSopModal: {
    type: Function,
    required: true
  }
})

// ====== 任务类型映射（与 V1.1 constants.ts 一致）======
const TASK_TYPES = [
  { value: 'fertilization', label: '施肥', color: 'bg-green-500' },
  { value: 'irrigation', label: '灌溉', color: 'bg-blue-500' },
  { value: 'pruning', label: '修剪', color: 'bg-purple-500' },
  { value: 'pesticide', label: '植保', color: 'bg-red-500' },
  { value: 'rootIrrigation', label: '灌根', color: 'bg-cyan-500' },
  { value: 'planting', label: '定植', color: 'bg-lime-500' },
  { value: 'harvest', label: '采收', color: 'bg-orange-500' },
  { value: 'weeding', label: '除草', color: 'bg-emerald-500' },
  { value: 'other', label: '其他', color: 'bg-gray-500' }
]

// ====== 状态映射（与 V1.1 constants.ts 一致）======
const STATUS_MAP = {
  draft: { bg: 'bg-gray-100', color: 'text-gray-600', label: '草稿' },
  pending: { bg: 'bg-gray-100', color: 'text-gray-600', label: '待接受' },
  accepted: { bg: 'bg-blue-100', color: 'text-blue-600', label: '已接受' },
  in_progress: { bg: 'bg-blue-100', color: 'text-blue-600', label: '进行中' },
  completed: { bg: 'bg-green-100', color: 'text-green-600', label: '已完成' },
  waiting_acceptance: { bg: 'bg-amber-100', color: 'text-amber-600', label: '待验收' },
  rejected: { bg: 'bg-red-100', color: 'text-red-600', label: '已拒绝' },
  failed: { bg: 'bg-purple-100', color: 'text-purple-600', label: '任务失败' },
  cancelled: { bg: 'bg-gray-100', color: 'text-gray-500', label: '已取消' },
  abandoned: { bg: 'bg-red-50', color: 'text-red-400', label: '已放弃' }
}

// ====== 优先级映射（与 V1.1 constants.ts 一致）======
const PRIORITY_MAP = {
  urgent: { color: 'text-red-500', label: '紧急' },
  high: { color: 'text-orange-500', label: '高' },
  medium: { color: 'text-yellow-500', label: '中' },
  low: { color: 'text-green-500', label: '低' },
  normal: { color: 'text-gray-500', label: '普通' }
}

// ====== 工具函数（与 V1.1 一致）======

/**
 * 获取任务类型颜色类
 * @param {string} type - 任务类型值
 * @returns {string} Tailwind背景色类
 */
const getTypeColor = (type) => {
  const taskType = TASK_TYPES.find(t => t.value === type)
  return taskType?.color || 'bg-gray-500'
}

/**
 * 获取任务类型标签
 * @param {string} type - 任务类型值
 * @returns {string} 类型展示文本
 */
const getTypeLabel = (type) => {
  const taskType = TASK_TYPES.find(t => t.value === type)
  return taskType?.label || type
}

// ====== 计算属性（对应 V1.1 的内部逻辑）======

/** 任务类型列表（兼容缺失字段） */
const types = computed(() => props.task.types || [])

/** 前2个类型（用于渲染） */
const displayTypes = computed(() => types.value.slice(0, 2))

/** 隐藏类型数量（用于显示 +N） */
const extraTypeCount = computed(() => Math.max(0, types.value.length - 2))

/** 计划开始日期（仅取日期部分） */
const planStartDate = computed(() => props.task.planStart?.split(' ')[0] || '')

/** 总预估工时 = 天数*8 + 小时数 */
const totalEstimatedHours = computed(() => {
  return ((props.task.estimatedDays || 0) * 8 + (props.task.estimatedHours || 0)) || 0
})

/** 进度条颜色类 */
const progressBarClass = computed(() => {
  if (props.task.progress === 100) return 'bg-green-500'
  if ((props.task.progress || 0) > 0) return 'bg-blue-500'
  return 'bg-gray-300'
})
</script>

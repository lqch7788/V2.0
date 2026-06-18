<template>
  <!-- 巡查编号 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    <button
      class="font-medium text-blue-600 hover:text-blue-800 hover:underline"
      @click="onOpenDetailModal(task)"
    >
      {{ task.sourceId || task.recordCode || task.taskCode || '-' }}
    </button>
  </td>
  <!-- 巡查类型 -->
  <td class="px-3 py-3 text-center">
    <span :class="['px-2 py-1 text-xs rounded-full', inspectionTypeConfig.className]">
      {{ inspectionTypeConfig.label }}
    </span>
  </td>
  <!-- 提交人 -->
  <td class="px-3 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
    <span class="font-medium text-gray-900 truncate block" :title="task.submitterName || task.assigneeName || '-'">
      {{ task.submitterName || task.assigneeName || '-' }}
    </span>
  </td>
  <!-- 位置/对象 -->
  <td class="px-3 py-3 text-sm text-gray-600 min-w-[10em] max-w-[15em]">
    <div class="flex items-center gap-1 overflow-hidden">
      <el-icon class="w-4 h-4 text-emerald-600 flex-shrink-0"><Location /></el-icon>
      <span class="text-gray-900 truncate block" :title="task.location || task.greenhouseName || task.field || '-'">
        {{ task.location || task.greenhouseName || task.field || '-' }}
      </span>
    </div>
  </td>
  <!-- 巡查日期 -->
  <td class="px-3 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
    {{ task.checkDate || task.planStart?.split(' ')[0] || '-' }}
  </td>
  <!-- 巡查结果 -->
  <td class="px-3 py-3 text-center">
    <span :class="['px-2 py-1 text-xs rounded-full', checkResultConfig.className]">
      {{ checkResultConfig.label }}
    </span>
  </td>
  <!-- 问题分类 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    <div v-if="Array.isArray(task.issueCategories) && task.issueCategories.length > 0" class="flex gap-1 justify-center flex-wrap">
      <span
        v-for="(cat, i) in task.issueCategories.slice(0, 2)"
        :key="i"
        class="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full"
      >
        {{ cat }}
      </span>
      <span v-if="task.issueCategories.length > 2" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
        +{{ task.issueCategories.length - 2 }}
      </span>
    </div>
    <span v-else class="text-sm text-gray-500">-</span>
  </td>
  <!-- 严重程度 -->
  <td class="px-3 py-3 text-center">
    <span :class="['px-2 py-1 text-xs rounded-full', severityConfig.className]">
      {{ severityConfig.label }}
    </span>
  </td>
  <!-- 问题照片 -->
  <td class="px-3 py-3 text-center whitespace-nowrap">
    <div v-if="Array.isArray(task.photos) && task.photos.length > 0" class="flex justify-center gap-1">
      <div
        v-for="(img, imgIdx) in task.photos.slice(0, 3)"
        :key="imgIdx"
        class="w-8 h-8 rounded overflow-hidden bg-gray-100"
      >
        <img :src="img" alt="" class="w-full h-full object-cover" />
      </div>
      <span v-if="task.photos.length > 3" class="flex items-center justify-center w-8 h-8 text-xs text-gray-500">
        +{{ task.photos.length - 3 }}
      </span>
    </div>
    <span v-else class="text-sm text-gray-500">-</span>
  </td>
  <!-- 反馈状态 -->
  <td class="px-3 py-3 text-center">
    <span :class="['px-2 py-1 rounded-full text-xs font-medium', feedbackStatusConfig.bg, feedbackStatusConfig.color]">
      {{ feedbackStatusConfig.label }}
    </span>
  </td>
  <!-- 反馈人员 -->
  <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
    <span v-if="Array.isArray(task.feedbackUsers) && task.feedbackUsers.length > 0">
      {{ task.feedbackUsers[0] }}
    </span>
    <span v-else>-</span>
  </td>
  <!-- 处理进度 -->
  <td class="px-3 py-3 text-center">
    <div class="flex items-center justify-center gap-1">
      <div class="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div class="h-full bg-blue-500 rounded-full" :style="{ width: progress + '%' }" />
      </div>
      <span class="text-xs text-gray-500">{{ progress }}%</span>
    </div>
  </td>
  <!-- 操作列 -->
  <td class="px-3 py-3 whitespace-nowrap">
    <!-- pending: 接受+拒绝 -->
    <div v-if="task.status === 'pending'" class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-green-500 hover:bg-green-600 rounded text-xs font-medium transition-colors"
        title="接受任务"
        @click="onAccept(task)"
      >
        <el-icon class="w-4 h-4"><CircleCheck /></el-icon>
        接受
      </button>
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-red-500 hover:bg-red-600 rounded text-xs font-medium transition-colors"
        title="拒绝任务"
        @click="onReject(task)"
      >
        <el-icon class="w-4 h-4"><CircleClose /></el-icon>
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
      <el-icon class="w-4 h-4"><EditPen /></el-icon>
      提交进度
    </button>
    <!-- rejected: 继续执行+查看 -->
    <div v-if="task.status === 'rejected'" class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-white bg-orange-500 hover:bg-orange-600 rounded text-xs font-medium transition-colors"
        title="点击继续执行"
        @click="onContinueExecution(task)"
      >
        <el-icon class="w-4 h-4"><VideoPlay /></el-icon>
        继续执行
      </button>
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
        title="点击查看详情"
        @click="onOpenDetailModal(task)"
      >
        <el-icon class="w-4 h-4"><View /></el-icon>
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
      <el-icon class="w-4 h-4"><View /></el-icon>
      查看
    </button>
  </td>
  <!-- 备注 -->
  <td class="px-3 py-3 text-sm text-gray-600 max-w-[10em]">
    <span class="truncate block" :title="task.issueText || task.remarks || ''">
      {{ ((task.issueText || task.remarks || '') + '').slice(0, 10) || '-' }}
    </span>
  </td>
</template>

<script setup>
/**
 * 巡查反馈任务表格行组件（叶子组件 - 仅渲染 <td> 单元格）
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/ProblemTaskTableRow.tsx
 */
import { computed } from 'vue'
import { CircleCheck, CircleClose, VideoPlay, View, EditPen, Location } from '@element-plus/icons-vue'

const props = defineProps({
  task: { type: Object, required: true },
  unifiedTasks: { type: Array, default: () => [] },
  acceptTask: { type: Function, required: true },
  onAccept: { type: Function, required: true },
  onReject: { type: Function, required: true },
  onContinueExecution: { type: Function, required: true },
  onOpenFeedbackModal: { type: Function, required: true },
  onOpenDetailModal: { type: Function, required: true },
})

// 巡查类型映射（与 V1.1 一致）
const INSPECTION_TYPE_MAP = {
  '农场巡查': { label: '种植', className: 'bg-emerald-100 text-emerald-700' },
  '设备巡查': { label: '设备', className: 'bg-blue-100 text-blue-700' },
  '设施巡查': { label: '设施', className: 'bg-amber-100 text-amber-700' },
  '其他巡查': { label: '其他', className: 'bg-purple-100 text-purple-700' },
  'farm': { label: '种植', className: 'bg-emerald-100 text-emerald-700' },
  'equipment': { label: '设备', className: 'bg-blue-100 text-blue-700' },
  'infrastructure': { label: '设施', className: 'bg-amber-100 text-amber-700' },
  'other': { label: '其他', className: 'bg-purple-100 text-purple-700' },
}

// 巡查结果配置
function getCheckResultConfig(result) {
  const isNormal = result === '正常' || result === '轻微' || result === 'low'
  return isNormal
    ? { label: '正常', className: 'bg-emerald-100 text-emerald-700' }
    : { label: '异常', className: 'bg-red-100 text-red-700' }
}

// 严重程度配置
function getSeverityConfig(severity) {
  if (severity === '严重' || severity === 'high') {
    return { label: '严重', className: 'bg-red-100 text-red-700' }
  }
  if (severity === '中等' || severity === 'medium') {
    return { label: '中等', className: 'bg-amber-100 text-amber-700' }
  }
  return { label: '轻微', className: 'bg-gray-100 text-gray-700' }
}

// 反馈状态配置（与 V1.1 一致）
const FEEDBACK_STATUS_MAP = {
  pending: { label: '待接受', bg: 'bg-gray-100', color: 'text-gray-600' },
  accepted: { label: '已接受', bg: 'bg-blue-100', color: 'text-blue-600' },
  in_progress: { label: '处理中', bg: 'bg-blue-100', color: 'text-blue-600' },
  waiting_acceptance: { label: '待验收', bg: 'bg-amber-100', color: 'text-amber-600' },
  completed: { label: '已完成', bg: 'bg-green-100', color: 'text-green-600' },
  rejected: { label: '返工中', bg: 'bg-red-100', color: 'text-red-600' },
  待接受: { label: '待接受', bg: 'bg-gray-100', color: 'text-gray-600' },
  已接受: { label: '已接受', bg: 'bg-blue-100', color: 'text-blue-600' },
  处理中: { label: '处理中', bg: 'bg-blue-100', color: 'text-blue-600' },
  待验收: { label: '待验收', bg: 'bg-amber-100', color: 'text-amber-600' },
  已完成: { label: '已完成', bg: 'bg-green-100', color: 'text-green-600' },
  返工中: { label: '返工中', bg: 'bg-red-100', color: 'text-red-600' },
}

const inspectionTypeConfig = computed(() => {
  return INSPECTION_TYPE_MAP[props.task.inspectionType || 'farm'] || INSPECTION_TYPE_MAP['farm']
})
const checkResultConfig = computed(() =>
  getCheckResultConfig(props.task.checkResult || props.task.issueSeverity || ''),
)
const severityConfig = computed(() =>
  getSeverityConfig(props.task.issueSeverity || props.task.priority || ''),
)
const feedbackStatusConfig = computed(() =>
  FEEDBACK_STATUS_MAP[props.task.feedbackStatus || props.task.status] || {
    label: props.task.feedbackStatus || props.task.status || '-',
    bg: 'bg-gray-100',
    color: 'text-gray-600',
  },
)
const progress = computed(() => parseInt(String(props.task.processProgress || props.task.progress || 0)))
</script>
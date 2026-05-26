<template>
  <el-dialog
    :model-value="isOpen"
    width="900px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="onClose"
  >
    <template #header>
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">任务详情</span>
      </div>
    </template>
    <!-- 加载中状态 -->
    <div v-if="!task" class="text-center py-12 text-gray-500">
      <el-icon :size="48" class="opacity-30 mb-3"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div v-else class="space-y-4">
      <!-- 基本信息 -->
      <div class="bg-white rounded-lg p-4 border border-gray-100">
        <h4 class="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
          <el-icon :size="16"><Document /></el-icon>
          基本信息
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-xs text-gray-500 block">任务类型</span>
            <span class="font-semibold text-gray-900">{{ task.typeName || task.type || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">任务区域</span>
            <span class="font-semibold text-gray-900">{{ task.greenhouseName || task.field || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">作物</span>
            <span class="font-semibold text-gray-900">{{ task.cropName || task.crop || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">执行人</span>
            <span class="font-semibold text-gray-900">{{ task.assigneeName || task.assignee || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">优先级</span>
            <span :class="['font-semibold', getPriorityColor(task.priority)]">
              {{ getPriorityLabel(task.priority) }}
            </span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">批次</span>
            <span class="font-semibold text-gray-900">{{ task.batchCode || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 来源信息 - 蓝色背景（V1.1对应内容） -->
      <div v-if="task.sourceId" class="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h4 class="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><Document /></el-icon>
          来源信息
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span class="text-xs text-blue-600 block">来源类型</span>
            <span class="font-semibold text-gray-900">{{ getSourceTypeLabel(task) }}</span>
          </div>
          <div v-if="task.sourceCode">
            <span class="text-xs text-blue-600 block">来源编号</span>
            <span class="font-semibold text-gray-900">{{ task.sourceCode }}</span>
          </div>
          <div v-if="task.sourceId">
            <span class="text-xs text-blue-600 block">关联ID</span>
            <span class="font-semibold text-gray-900 text-xs">{{ task.sourceId }}</span>
          </div>
        </div>
        <div v-if="task.remarks" class="mt-3 pt-3 border-t border-blue-200">
          <span class="text-xs text-blue-600 block">工作内容</span>
          <p class="text-sm text-gray-700 whitespace-pre-line bg-white rounded p-2">{{ task.remarks }}</p>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="bg-sky-50 rounded-lg p-4 border border-sky-100">
        <h4 class="text-sm font-bold text-sky-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><Clock /></el-icon>
          时间信息
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-xs text-sky-600 block">计划开始</span>
            <span class="font-semibold text-gray-900">{{ task.planStart || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-sky-600 block">计划结束</span>
            <span class="font-semibold text-gray-900">{{ task.planEnd || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-sky-600 block">预计时长</span>
            <span class="font-semibold text-gray-900">
              <template v-if="task.estimatedDays">{{ task.estimatedDays }}天</template>
              <template v-if="task.estimatedHours">{{ task.estimatedHours }}小时</template>
              <template v-if="!task.estimatedDays && !task.estimatedHours">-</template>
            </span>
          </div>
          <div>
            <span class="text-xs text-sky-600 block">状态</span>
            <el-tag :type="getStatusType(task.status)" size="small">
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 实际完成工作量 - 绿色背景（V1.1对应内容） -->
      <div v-if="hasActualWorkload" class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <h4 class="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><DataAnalysis /></el-icon>
          实际完成工作量
        </h4>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <span class="text-xs text-emerald-600 block">实际工日</span>
            <span class="font-bold text-emerald-700 text-lg">
              {{ actualWorkload.days > 0 ? `${actualWorkload.days}天` : '-' }}
            </span>
          </div>
          <div>
            <span class="text-xs text-emerald-600 block">实际工时</span>
            <span class="font-bold text-emerald-700 text-lg">
              {{ actualWorkload.hours > 0 ? `${actualWorkload.hours}小时` : '-' }}
            </span>
          </div>
          <div>
            <span class="text-xs text-emerald-600 block">作业人数</span>
            <span class="font-bold text-emerald-700 text-lg">
              {{ actualWorkload.workers > 0 ? `${actualWorkload.workers}人` : '-' }}
            </span>
          </div>
        </div>
        <div v-if="estimatedTotalHours > 0" class="mt-3 pt-3 border-t border-emerald-200">
          <p class="text-xs text-emerald-600">
            预估总工时：{{ estimatedTotalHours }}小时 → 实际总工时：{{ actualTotalHours }}小时
            <span v-if="actualTotalHours > 0" :class="['ml-2', actualTotalHours > estimatedTotalHours ? 'text-red-600' : 'text-emerald-600']">
              ({{ actualTotalHours > estimatedTotalHours ? '超出' : '节省' }}{{ Math.abs(actualTotalHours - estimatedTotalHours).toFixed(1) }}小时)
            </span>
          </p>
        </div>
      </div>

      <!-- 执行进度 -->
      <div class="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
        <h4 class="text-sm font-bold text-cyan-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><DataAnalysis /></el-icon>
          执行进度
        </h4>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <el-progress
              :percentage="task.progress || 0"
              :color="task.progress === 100 ? '#22c55e' : task.progress > 0 ? '#3b82f6' : '#d1d5db'"
              :show-text="false"
            />
          </div>
          <span class="text-sm font-bold text-cyan-700 whitespace-nowrap">{{ task.progress || 0 }}%</span>
        </div>
      </div>

      <!-- 任务类型配置 / SOP -->
      <div v-if="task.types && task.types.length > 0" class="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <h4 class="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><Files /></el-icon>
          任务类型配置
        </h4>
        <div class="flex flex-wrap gap-2">
          <el-tag
            v-for="t in task.types"
            :key="t"
            :type="getTaskTypeTagType(t)"
            size="small"
          >
            {{ getTaskTypeLabel(t) }}
          </el-tag>
        </div>
        <!-- SOP 下载 -->
        <div v-if="task.sopContent" class="mt-3 bg-white rounded-lg p-3 border border-purple-100">
          <p class="text-sm text-gray-600 mb-2">已导入SOP文档</p>
          <el-button type="primary" link :icon="Download" @click="downloadSop">
            下载SOP文件
          </el-button>
        </div>
      </div>

      <!-- 所需物资 -->
      <div v-if="task.materials && task.materials.length > 0" class="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <h4 class="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><Box /></el-icon>
          所需物资
        </h4>
        <div class="bg-white rounded p-2">
          <div
            v-for="(m, i) in task.materials"
            :key="i"
            class="flex items-center justify-between py-2 px-3 border-b border-gray-100 last:border-0"
          >
            <span class="text-sm text-gray-900">{{ m.name }}</span>
            <span class="text-sm text-gray-500">{{ m.qty }} {{ m.unit }}</span>
          </div>
        </div>
      </div>

      <!-- 所需工具 -->
      <div v-if="(task.tools && task.tools.length > 0) || task.toolsRemarks" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><Setting /></el-icon>
          所需工具
        </h4>
        <div v-if="task.tools && task.tools.length > 0" class="bg-white rounded p-2">
          <div
            v-for="(t, i) in task.tools"
            :key="i"
            class="flex items-center justify-between py-2 px-3 border-b border-gray-100 last:border-0"
          >
            <span class="text-sm text-gray-900">{{ t.name }}</span>
            <span class="text-sm text-gray-500">{{ t.qty }} {{ t.unit }}</span>
          </div>
        </div>
        <p v-if="task.toolsRemarks" class="mt-2 text-sm text-gray-600">{{ task.toolsRemarks }}</p>
      </div>

      <!-- 必填反馈 -->
      <div v-if="task.requiredFeedback && task.requiredFeedback.length > 0" class="bg-pink-50 rounded-lg p-4 border border-pink-100">
        <h4 class="text-sm font-bold text-pink-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><EditPen /></el-icon>
          必填反馈
        </h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="fb in task.requiredFeedback"
            :key="fb"
            class="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs"
          >
            {{ getFeedbackLabel(fb) }}
          </span>
        </div>
      </div>

      <!-- 执行反馈记录 -->
      <div v-if="records && records.length > 0" class="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <el-icon :size="16"><List /></el-icon>
          执行反馈记录
        </h4>
        <TaskProgressTimeline
          :records="records"
          :show-task-info="false"
        />
      </div>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="flex items-center justify-between">
        <div />
        <div class="flex items-center gap-3">
          <el-button @click="onClose">关闭</el-button>
          <el-button
            v-if="task && task.status === 'waiting_acceptance'"
            type="primary"
            @click="$emit('verify', task.id)"
          >
            验收
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import {
  Document, Clock, DataAnalysis, Files, Download,
  Setting, Box, EditPen, List, Loading
} from '@element-plus/icons-vue'
import TaskProgressTimeline from './TaskProgressTimeline.vue'

// 任务类型配置（与 V1.1 taskDispatchConstants 保持一致）
const TASK_TYPES = [
  { value: 'fertilization', label: '施肥', color: 'success' },
  { value: 'irrigation', label: '灌溉', color: '' },
  { value: 'pruning', label: '修剪', color: '' },
  { value: 'pesticide', label: '植保', color: 'danger' },
  { value: 'rootIrrigation', label: '灌根', color: '' },
  { value: 'planting', label: '定植', color: '' },
  { value: 'harvest', label: '采收', color: 'warning' },
  { value: 'weeding', label: '除草', color: 'success' },
  { value: 'other', label: '其他', color: 'info' },
]

// 优先级映射
const PRIORITY_MAP = {
  urgent: { label: '紧急', color: 'text-red-600' },
  high: { label: '高', color: 'text-orange-600' },
  normal: { label: '普通', color: 'text-blue-600' },
  low: { label: '低', color: 'text-gray-500' },
}

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  onClose: {
    type: Function,
    default: () => {},
  },
  /** 执行反馈记录列表 */
  records: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['verify'])

/** 从执行记录中汇总实际工作量 */
const actualWorkload = computed(() => {
  let totalDays = 0
  let totalHours = 0
  let totalWorkers = 0
  const recordsList = props.records || []
  recordsList.forEach(record => {
    if (record.feedback) {
      if (record.feedback.workloadDays) totalDays += record.feedback.workloadDays
      if (record.feedback.workloadHours) totalHours += record.feedback.workloadHours
      if (record.feedback.workers && record.feedback.workers > totalWorkers) totalWorkers = record.feedback.workers
    }
  })
  return { days: totalDays, hours: totalHours, workers: totalWorkers }
})

const hasActualWorkload = computed(() => actualWorkload.value.days > 0 || actualWorkload.value.hours > 0)

/** 预估总工时 */
const estimatedTotalHours = computed(() => {
  const task = props.task
  if (!task) return 0
  return (task.estimatedDays || 0) * 8 + (task.estimatedHours || 0)
})

/** 实际总工时 */
const actualTotalHours = computed(() => {
  return actualWorkload.value.days * 8 + actualWorkload.value.hours
})

/** 获取来源类型标签 */
const getSourceTypeLabel = (task) => {
  if (!task) return '-'
  if (task.type === 'seedling') return '育苗任务'
  if (task.sourceType === 'dispatch') return '任务派工'
  if (task.sourceType === 'tempTask') return '临时任务'
  if (task.sourceType === 'inspection') return '巡查任务'
  return task.sourceType || '-'
}

const getTaskTypeLabel = (typeValue) => {
  const found = TASK_TYPES.find(t => t.value === typeValue)
  return found?.label || typeValue
}

const getTaskTypeTagType = (typeValue) => {
  const found = TASK_TYPES.find(t => t.value === typeValue)
  return found?.color || 'info'
}

const getPriorityLabel = (priority) => {
  return PRIORITY_MAP[priority]?.label || priority || '普通'
}

const getPriorityColor = (priority) => {
  return PRIORITY_MAP[priority]?.color || 'text-gray-500'
}

const getStatusType = (status) => {
  const types = {
    draft: 'info',
    pending: 'info',
    accepted: 'primary',
    in_progress: 'warning',
    waiting_acceptance: '',
    completed: 'success',
    rejected: 'danger',
    failed: 'danger',
    cancelled: 'info',
    abandoned: 'info',
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    pending: '待执行',
    accepted: '已接受',
    in_progress: '进行中',
    waiting_acceptance: '待验收',
    completed: '已完成',
    rejected: '返工中',
    failed: '已失败',
    cancelled: '已取消',
    abandoned: '已放弃',
  }
  return texts[status] || status
}

const getFeedbackLabel = (fb) => {
  const labels = {
    gps: '位置打卡',
    material: '物资扫码',
    photo_before: '作业前照片',
    photo_after: '作业后照片',
    voice: '语音备注',
  }
  return labels[fb] || fb
}

// SOP下载
const downloadSop = () => {
  // 由父组件处理，此处提供占位
}
</script>

<style scoped>
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  border-radius: 8px 8px 0 0;
}
.farm-modal-header {
  background: linear-gradient(to right, #059669, #10b981);
  padding: 16px 24px;
  border-radius: 8px 8px 0 0;
}
</style>

<!--
  TempTaskDetailModal.vue - 临时任务详情弹窗
  V1.1 TempTaskDetailModal.tsx 1:1 迁移
  含基本信息/类型/紧急/描述/时间/进度/备注/驳回原因/完成备注/验收备注/操作流水
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('close')"
    :title="`任务详情 - ${task?.taskCode || task?.id || ''}`"
    width="780px"
    destroy-on-close
    top="3vh"
  >
    <div v-if="task" class="space-y-5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
      <!-- 基本信息 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-xs text-gray-500 block">任务名称</span>
            <span class="font-semibold text-gray-900">{{ task.title || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">任务区域</span>
            <span class="font-semibold text-gray-900">{{ task.location || task.workLocation || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">执行人</span>
            <span class="font-semibold text-gray-900">{{ task.assigneeName || '待分配' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">优先级</span>
            <span :class="['font-semibold', PRIORITY_MAP[task.priority]?.color || '']">
              {{ PRIORITY_MAP[task.priority]?.label || task.priority || '普通' }}
            </span>
          </div>
        </div>
      </section>

      <!-- 任务类型 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">任务类型</h4>
        <div class="flex flex-wrap gap-2">
          <span :class="['px-3 py-1.5 rounded text-sm text-white',
            TASK_TYPE_MAP[task.tempTaskType || task.type || 'other']?.color || 'bg-gray-500']">
            {{ TASK_TYPE_MAP[task.tempTaskType || task.type || 'other']?.label || task.type || '其他' }}
          </span>
        </div>
      </section>

      <!-- 紧急程度 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">紧急程度</h4>
        <div class="flex items-center gap-2">
          <span :class="['px-3 py-1.5 rounded text-sm font-medium', URGENCY_BADGE[task.urgency] || 'bg-gray-100 text-gray-700']">
            {{ URGENCY_LABEL[task.urgency] || task.urgency || '普通' }}
          </span>
        </div>
      </section>

      <!-- 任务描述 -->
      <section v-if="task.description">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">任务描述</h4>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ task.description }}</p>
        </div>
      </section>

      <!-- 时间信息 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">时间信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-xs text-gray-500 block">派发时间</span>
            <span class="font-semibold text-gray-900">{{ formatDate(task.createdAt) }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">截止日期</span>
            <span class="font-semibold text-gray-900">{{ task.dueDate || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">状态</span>
            <span :class="['px-2 py-1 rounded-full text-xs font-medium inline-block',
              STATUS_MAP[task.status]?.bg || 'bg-gray-100', STATUS_MAP[task.status]?.color || 'text-gray-600']">
              {{ STATUS_MAP[task.status]?.label || task.status }}
            </span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">预估时长</span>
            <span class="font-semibold text-gray-900">
              {{ task.estimatedHours ? `${task.estimatedHours}小时` : '-' }}
            </span>
          </div>
        </div>
      </section>

      <!-- 执行进度 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">执行进度</h4>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all"
              :style="{ width: `${task.progress || 0}%` }" />
          </div>
          <span class="w-14 text-sm font-medium text-gray-700 text-center">
            {{ task.progress || 0 }}%
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">
          {{ task.progress === 100 ? '已完成' : task.progress === 0 ? '未开始' : '进行中' }}
        </p>
      </section>

      <!-- 备注 -->
      <section v-if="task.notes || task.remarks">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">备注</h4>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ task.notes || task.remarks }}</p>
        </div>
      </section>

      <!-- 驳回原因 -->
      <section v-if="task.rejectReason">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">驳回原因</h4>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-700">{{ task.rejectReason }}</p>
        </div>
      </section>

      <!-- 完成备注 -->
      <section v-if="task.completionRemarks">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">完成备注</h4>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-sm text-green-700">{{ task.completionRemarks }}</p>
        </div>
      </section>

      <!-- 验收备注 -->
      <section v-if="task.acceptanceRemarks">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">验收备注</h4>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-700">{{ task.acceptanceRemarks }}</p>
        </div>
      </section>

      <!-- 操作流水 -->
      <section v-if="flowRecords.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">操作流水</h4>
        <div class="border border-gray-200 rounded-lg divide-y divide-gray-100">
          <div v-for="r in flowRecords" :key="r.id" class="px-4 py-2 flex items-center gap-3 text-sm">
            <span :class="['px-2 py-0.5 rounded text-xs font-medium', FLOW_ACTION_COLOR[r.action] || 'bg-gray-100 text-gray-700']">
              {{ FLOW_ACTION_LABEL[r.action] || r.action }}
            </span>
            <span class="text-gray-700 flex-1">{{ r.comment || '-' }}</span>
            <span class="text-xs text-gray-400">{{ formatDate(r.actionTime) }}</span>
            <span class="text-xs text-gray-500">{{ r.operatorName || '系统' }}</span>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 临时任务详情弹窗
 * V1.1 详情弹窗结构 1:1 迁移（TempTaskPage.tsx 第 1291-1494 行）
 *
 * Emits:
 *   close
 */
import { computed } from 'vue'
import { useTempTaskStore } from '@/stores/modules/tempTask'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
})

const emit = defineEmits(['close'])

// ========== 状态映射（与 V1.1 statusMap 1:1）==========
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
  abandoned: { bg: 'bg-red-50', color: 'text-red-400', label: '已放弃' },
}

// ========== 优先级映射（与 V1.1 priorityMap 1:1）==========
const PRIORITY_MAP = {
  urgent: { color: 'text-red-500', label: '紧急' },
  high: { color: 'text-orange-500', label: '高' },
  medium: { color: 'text-yellow-500', label: '中' },
  low: { color: 'text-green-500', label: '低' },
  normal: { color: 'text-gray-500', label: '普通' },
}

// ========== 任务类型映射（与 V1.1 taskTypes 1:1）==========
const TASK_TYPE_MAP = {
  fertilization: { label: '施肥', color: 'bg-green-500' },
  irrigation: { label: '灌溉', color: 'bg-blue-500' },
  pruning: { label: '修剪', color: 'bg-purple-500' },
  pesticide: { label: '植保', color: 'bg-red-500' },
  rootIrrigation: { label: '灌根', color: 'bg-cyan-500' },
  planting: { label: '定植', color: 'bg-lime-500' },
  harvest: { label: '采收', color: 'bg-orange-500' },
  weeding: { label: '除草', color: 'bg-emerald-500' },
  other: { label: '其他', color: 'bg-gray-500' },
}

// ========== 紧急程度 badge/label（与 V1.1 1:1）==========
const URGENCY_BADGE = {
  critical: 'bg-red-100 text-red-700',
  urgent: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-700',
}
const URGENCY_LABEL = {
  critical: '非常紧急',
  urgent: '紧急',
  normal: '普通',
}

// ========== 操作流水 action 配置（与 V1.1 typeMap 1:1）==========
const FLOW_ACTION_LABEL = {
  dispatch: '派发',
  accept: '接受',
  reject: '驳回',
  start: '开始',
  submit: '提交',
  approve: '审核',
  complete: '完成',
  comment: '备注',
}
const FLOW_ACTION_COLOR = {
  dispatch: 'bg-blue-100 text-blue-700',
  accept: 'bg-emerald-100 text-emerald-700',
  reject: 'bg-red-100 text-red-700',
  start: 'bg-cyan-100 text-cyan-700',
  submit: 'bg-amber-100 text-amber-700',
  approve: 'bg-green-100 text-green-700',
  complete: 'bg-green-100 text-green-700',
  comment: 'bg-gray-100 text-gray-700',
}

// ========== 操作流水（从 useTempTaskStore 获取）==========
const tempTaskStore = useTempTaskStore()

const flowRecords = computed(() => {
  if (!props.task) return []
  const opRecords = tempTaskStore.getOperationRecordsByTaskId?.(props.task.id) || []
  return opRecords.map((r, idx) => {
    const opType = r.operationTypeName || r.operationType || ''
    let action = 'comment'
    const typeMap = {
      '派发': 'dispatch', '分配': 'dispatch',
      '接受': 'accept', '接单': 'accept',
      '驳回': 'reject', '拒绝': 'reject',
      '开始': 'start', '启动': 'start',
      '提交': 'submit', '上报': 'submit',
      '通过': 'approve', '审核': 'approve',
      '完成': 'complete',
    }
    for (const [key, val] of Object.entries(typeMap)) {
      if (opType.includes(key)) { action = val; break }
    }
    return {
      id: r.id || `tt_opr_${idx}_${Date.now()}`,
      action,
      actionTime: r.operationDate || r.createdAt || '',
      operatorName: r.operatorName || r.operator || '系统',
      comment: r.remarks || r.rejectReason || '',
    }
  }).sort((a, b) => new Date(a.actionTime).getTime() - new Date(b.actionTime).getTime())
})

function formatDate(value) {
  if (!value) return '-'
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return String(value).slice(0, 10)
    return d.toLocaleDateString('zh-CN')
  } catch {
    return String(value).slice(0, 10)
  }
}
</script>
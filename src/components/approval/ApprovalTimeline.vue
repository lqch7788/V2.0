<template>
  <div class="space-y-4">
    <h4 class="text-sm font-semibold text-gray-900">审批流程</h4>

    <!-- 时间线 -->
    <div class="relative">
      <div
        v-for="(approver, index) in approvers"
        :key="approver.userId + approver.order"
        class="relative flex gap-4"
      >
        <!-- 时间线连接线 -->
        <div
          v-if="index > 0"
          :class="[
            'absolute left-[19px] top-0 w-0.5 h-4 -translate-y-4',
            isCompleted(approver) || isCurrent(approver) ? 'bg-emerald-600' : 'bg-gray-200'
          ]"
        />

        <!-- 图标 -->
        <div class="relative z-10 flex-shrink-0">
          <!-- 已完成 -->
          <div
            v-if="isCompleted(approver)"
            :class="['w-10 h-10 rounded-full flex items-center justify-center', getActionBgColor(approver.status)]"
          >
            <el-icon :size="20" :class="getActionColor(approver.status)">
              <component :is="getActionIcon(approver.status)" />
            </el-icon>
          </div>
          <!-- 当前待审批 -->
          <div
            v-else-if="isCurrent(approver)"
            class="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-500 flex items-center justify-center"
          >
            <el-icon :size="20" class="text-yellow-600"><User /></el-icon>
          </div>
          <!-- 未来审批人 -->
          <div
            v-else
            class="w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-400 flex items-center justify-center"
          >
            <el-icon :size="20" class="text-gray-400"><Clock /></el-icon>
          </div>
        </div>

        <!-- 内容 -->
        <div class="flex-1 pb-6">
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-900">{{ approver.userName }}</span>
            <el-tag size="small" type="info">{{ approver.role || '审批人' }}</el-tag>
            <el-tag v-if="isCurrent(approver)" size="small" type="warning">待审批</el-tag>
          </div>

          <!-- 状态 -->
          <div class="mt-1">
            <span v-if="approver.status === 'approved'" class="text-sm text-emerald-600">已通过</span>
            <span v-else-if="approver.status === 'rejected'" class="text-sm text-red-600">已拒绝</span>
            <span v-else-if="approver.status === 'partially_approved'" class="text-sm text-amber-600">部分通过</span>
            <span v-else-if="approver.status === 'pending' && !isCurrent(approver)" class="text-sm text-gray-400">等待中</span>
            <span v-else-if="approver.status === 'skipped'" class="text-sm text-gray-400">已跳过</span>
          </div>

          <!-- 审批记录详情 -->
          <div v-if="getRecord(approver)" class="mt-2 p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2 text-sm">
              <el-icon :class="getActionColor(getRecord(approver).action)">
                <component :is="getActionIcon(getRecord(approver).action)" />
              </el-icon>
              <span class="text-gray-700">{{ getActionText(getRecord(approver).action) }}</span>
            </div>
            <p v-if="getRecord(approver).comment" class="mt-1 text-sm text-gray-600 pl-7">
              {{ getRecord(approver).comment }}
            </p>
            <p class="mt-1 text-xs text-gray-400 pl-7">
              {{ formatTime(getRecord(approver).actionTime) }}
            </p>
          </div>

          <!-- 当前审批人提示 -->
          <div v-else-if="isCurrent(approver) && !getRecord(approver)" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              <el-icon class="mr-1"><WarningFilled /></el-icon>
              等待此审批人处理
            </p>
          </div>

          <!-- 未来审批人 -->
          <div v-else-if="isFuture(approver)" class="mt-2 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-500">等待前序审批完成后此审批人将收到通知</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="pt-4 border-t border-gray-100">
      <div class="flex gap-4 text-sm text-gray-500">
        <span>审批进度：{{ approvers.filter(a => a.status !== 'pending').length }}/{{ approvers.length }}</span>
        <span>·</span>
        <span>当前步骤：第 {{ currentStep }} 步</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  CheckCircle,
  CircleCheckFilled,
  CircleCloseFilled,
  Clock,
  User,
  WarningFilled,
  Minus
} from '@element-plus/icons-vue'
import { ElIcon, ElTag } from 'element-plus'

// ============================================================
// 审批时间轴组件
// 文件路径：src/components/approval/ApprovalTimeline.vue
// 组件化结构：展示审批流程的时间线
// ============================================================

const props = defineProps({
  // 审批记录列表
  records: {
    type: Array,
    default: () => []
  },
  // 审批人列表
  approvers: {
    type: Array,
    default: () => []
  },
  // 当前步骤
  currentStep: {
    type: Number,
    default: 1
  }
})

// 是否已完成
const isCompleted = (approver) => {
  return ['approved', 'rejected', 'partially_approved'].includes(approver.status)
}

// 是否当前步骤
const isCurrent = (approver) => {
  return approver.order === props.currentStep && approver.status === 'pending'
}

// 是否未来步骤
const isFuture = (approver) => {
  return approver.order > props.currentStep
}

// 获取审批记录对应的步骤
const getStepFromRecord = (record) => {
  const approver = props.approvers.find(a => a.userId === record.approverId)
  return approver?.order || 0
}

// 查找对应的审批记录
const getRecord = (approver) => {
  return props.records.find(r => {
    const recordApprover = props.approvers.find(a => a.userId === r.approverId)
    return recordApprover?.order === approver.order
  })
}

// 获取动作图标
const getActionIcon = (action) => {
  switch (action) {
    case 'approve':
      return 'CircleCheckFilled'
    case 'reject':
      return 'CircleCloseFilled'
    case 'partially_approve':
      return 'WarningFilled'
    case 'cancel':
      return 'CircleCloseFilled'
    default:
      return 'Clock'
  }
}

// 获取动作文本
const getActionText = (action) => {
  switch (action) {
    case 'approve':
      return '审批通过'
    case 'reject':
      return '审批拒绝'
    case 'partially_approve':
      return '部分通过'
    case 'cancel':
      return '已撤回'
    default:
      return action
  }
}

// 获取动作背景色
const getActionBgColor = (action) => {
  switch (action) {
    case 'approve':
      return 'bg-emerald-100'
    case 'reject':
      return 'bg-red-100'
    case 'partially_approve':
      return 'bg-amber-100'
    case 'cancel':
      return 'bg-gray-100'
    default:
      return 'bg-gray-100'
  }
}

// 获取动作图标颜色
const getActionColor = (action) => {
  switch (action) {
    case 'approve':
      return 'text-emerald-600'
    case 'reject':
      return 'text-red-600'
    case 'partially_approve':
      return 'text-amber-600'
    case 'cancel':
      return 'text-gray-600'
    default:
      return 'text-gray-400'
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeStr
  }
}
</script>

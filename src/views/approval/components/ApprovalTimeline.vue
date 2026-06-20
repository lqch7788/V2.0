<!--
  审批时间线组件
  对标 V1.1 src/components/approval/ApprovalTimeline.tsx
  功能：展示审批流程的步骤时间线（提交 → 各审批步骤 → 完成）
-->
<template>
  <div class="approval-timeline">
    <el-timeline>
      <!-- 申请提交节点 -->
      <el-timeline-item
        :timestamp="formatTime(approval.applyDate, approval.applyTime)"
        placement="top"
        :color="approval.applyDate ? '#059669' : '#9ca3af'"
      >
        <el-card shadow="never" class="!border">
          <div class="flex items-center gap-2">
            <el-icon :size="18" color="#059669"><EditPen /></el-icon>
            <span class="font-semibold">{{ approval.applicantName }} 提交申请</span>
            <el-tag size="small" type="info">{{ approval.applicantDepartment }}</el-tag>
          </div>
          <div v-if="approval.description" class="mt-2 text-sm text-gray-600">
            {{ approval.description }}
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 审批人节点 -->
      <el-timeline-item
        v-for="(approver, index) in approval.approvers"
        :key="approver.userId || index"
        :timestamp="approver.actionTime ? formatTime(approver.actionTime) : '待审批'"
        placement="top"
        :color="getApproverColor(approver.status)"
      >
        <el-card shadow="never" class="!border">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <el-icon :size="18" :color="getApproverColor(approver.status)">
                <component :is="getApproverIcon(approver.status)" />
              </el-icon>
              <span class="font-semibold">{{ approver.userName }}</span>
              <span class="text-sm text-gray-500">({{ approver.role }})</span>
              <span class="text-xs text-gray-400 ml-2">第 {{ approver.order }} 步</span>
            </div>
            <el-tag :type="getApproverTagType(approver.status)" size="small">
              {{ getApproverText(approver.status) }}
            </el-tag>
          </div>
          <div v-if="approver.comment" class="mt-2 text-sm text-gray-600">
            {{ approver.comment }}
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 最终结果节点 -->
      <el-timeline-item
        v-if="finalRecord"
        :timestamp="formatTime(finalRecord.actionTime)"
        placement="top"
        :color="finalRecord.action === 'approve' ? '#10b981' : '#ef4444'"
      >
        <el-card shadow="never" class="!border">
          <div class="flex items-center gap-2">
            <el-icon :size="18" :color="finalRecord.action === 'approve' ? '#10b981' : '#ef4444'">
              <component :is="finalRecord.action === 'approve' ? 'CircleCheck' : 'CircleClose'" />
            </el-icon>
            <span class="font-semibold">
              审批{{ finalRecord.action === 'approve' ? '通过' : '拒绝' }}
            </span>
          </div>
          <div v-if="finalRecord.comment" class="mt-2 text-sm text-gray-600">
            {{ finalRecord.comment }}
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  CircleCheck,
  CircleClose,
  Clock,
  EditPen,
} from '@element-plus/icons-vue'

const props = defineProps({
  approval: { type: Object, required: true },
})

const finalRecord = computed(() => {
  if (!props.approval.records?.length) return null
  return props.approval.records[props.approval.records.length - 1]
})

const formatTime = (date, time) => {
  if (!date) return '-'
  return time ? `${date} ${time}` : date
}

const APPROVER_COLOR_MAP = {
  approved: '#10b981',
  rejected: '#ef4444',
  pending: '#f59e0b',
  waiting: '#9ca3af',
}

const APPROVER_TEXT_MAP = {
  approved: '已通过',
  rejected: '已拒绝',
  pending: '待审批',
  waiting: '等待中',
}

const getApproverColor = (status) => APPROVER_COLOR_MAP[status] || '#9ca3af'
const getApproverText = (status) => APPROVER_TEXT_MAP[status] || status
const getApproverIcon = (status) => {
  const map = { approved: CircleCheck, rejected: CircleClose, pending: Clock }
  return map[status] || Clock
}

const getApproverTagType = (status) => {
  const map = { approved: 'success', rejected: 'danger', pending: 'warning' }
  return map[status] || 'info'
}
</script>

<style scoped>
.approval-timeline :deep(.el-timeline-item__node) {
  background-color: #059669;
}
.approval-timeline :deep(.el-card) {
  border-radius: 8px;
}
</style>
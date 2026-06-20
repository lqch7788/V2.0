<!--
  通用审批详情组件
  对标 V1.1 src/components/approval/ApprovalDetail.tsx (272 行)
  功能：基本信息 + 审批流程 + 审批记录 + 物料明细 + 业务关联 + 操作按钮
-->
<template>
  <div class="space-y-6">
    <!-- 基本信息 -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-500">审批单号</div>
          <div class="font-medium text-gray-900 font-mono">{{ approval.code }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">审批类型</div>
          <div class="font-medium text-gray-900">{{ approval.typeName }}</div>
        </div>
        <div class="col-span-2">
          <div class="text-sm text-gray-500">标题</div>
          <div class="font-medium text-gray-900">{{ approval.title }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">申请人</div>
          <div class="font-medium text-gray-900">{{ approval.applicantName }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">申请部门</div>
          <div class="font-medium text-gray-900">{{ approval.applicantDepartment }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">申请时间</div>
          <div class="font-medium text-gray-900">{{ approval.applyDate }} {{ approval.applyTime }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">当前状态</div>
          <div class="flex items-center gap-2">
            <el-icon :size="20" :color="statusColor">
              <component :is="statusIcon" />
            </el-icon>
            <span class="font-medium text-gray-900">{{ statusText }}</span>
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-500">审批进度</div>
          <div class="font-medium text-gray-900">
            第 {{ approval.currentStep }} / {{ approval.totalSteps }} 步
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-500">优先级</div>
          <div class="font-medium text-gray-900">{{ priorityText }}</div>
        </div>
      </div>
    </div>

    <!-- 审批流程 -->
    <div v-if="approval.approvers && approval.approvers.length">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">审批流程</h3>
      <div class="space-y-3">
        <div
          v-for="approver in approval.approvers"
          :key="approver.userId"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <el-icon :size="16" color="#059669"><User /></el-icon>
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900">
              {{ approver.userName }}
              <span class="text-gray-400 text-sm ml-2">{{ approver.role }}</span>
            </div>
            <div class="text-sm text-gray-500">
              第 {{ approver.order }} 步审批人
            </div>
          </div>
          <span
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="approverStatusClass(approver.status)"
          >
            {{ approverStatusText(approver.status) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 审批记录 -->
    <div v-if="approval.records && approval.records.length">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">审批记录</h3>
      <div class="space-y-3">
        <div
          v-for="record in approval.records"
          :key="record.id"
          class="flex gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="record.actionBgClass"
          >
            <el-icon :size="16" :color="record.actionColor">
              <component :is="record.actionIcon" />
            </el-icon>
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900">
              {{ record.approverName }}
              <span class="text-gray-400 text-sm ml-2">{{ record.actionText }}</span>
            </div>
            <div v-if="record.comment" class="text-sm text-gray-600 mt-1">{{ record.comment }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ formatTime(record.actionTime) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 物料明细 -->
    <div v-if="approval.materials && approval.materials.length">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">物料明细</h3>
      <el-table :data="approval.materials" size="small" border>
        <el-table-column prop="materialCode" label="物料编码" min-width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="160" />
        <el-table-column label="申请数量" align="right" min-width="120">
          <template #default="{ row }">
            {{ row.requestedQuantity }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="approval.status === 'partially_approved'"
          label="批准数量"
          align="right"
          min-width="120"
        >
          <template #default="{ row }">
            {{ row.approvedQuantity ?? row.requestedQuantity }} {{ row.unit }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 业务关联信息 -->
    <BusinessPreview
      v-if="approval.businessLink"
      :approval="approval"
      :business-link="approval.businessLink"
    />

    <!-- 操作按钮 -->
    <div
      v-if="showActions && approval.status === 'pending'"
      class="flex justify-end gap-3 pt-4 border-t border-gray-200"
    >
      <el-button
        v-if="canReject"
        type="danger"
        :loading="rejecting"
        @click="handleReject"
      >
        <el-icon><CircleClose /></el-icon>
        拒绝
      </el-button>
      <el-button
        v-if="canApprove"
        type="primary"
        :loading="approving"
        @click="handleApprove"
      >
        <el-icon><Check /></el-icon>
        通过
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, CircleCheck, CircleClose, Clock, User, EditPen } from '@element-plus/icons-vue'
import BusinessPreview from './BusinessPreview.vue'

const props = defineProps({
  approval: { type: Object, required: true },
  showActions: { type: Boolean, default: false },
  canApprove: { type: Boolean, default: true },
  canReject: { type: Boolean, default: true },
  approving: { type: Boolean, default: false },
  rejecting: { type: Boolean, default: false },
})

const emit = defineEmits(['approve', 'reject'])

// 状态图标 + 颜色
const STATUS_MAP = {
  approved: { icon: CircleCheck, color: '#10b981', text: '已通过' },
  rejected: { icon: CircleClose, color: '#ef4444', text: '已拒绝' },
  pending: { icon: Clock, color: '#f59e0b', text: '待审批' },
  draft: { icon: EditPen, color: '#6b7280', text: '草稿' },
  partially_approved: { icon: Clock, color: '#3b82f6', text: '部分通过' },
  cancelled: { icon: CircleClose, color: '#6b7280', text: '已取消' },
}

const statusIcon = computed(() => STATUS_MAP[props.approval.status]?.icon || Clock)
const statusColor = computed(() => STATUS_MAP[props.approval.status]?.color || '#6b7280')
const statusText = computed(() => STATUS_MAP[props.approval.status]?.text || props.approval.status)

const priorityText = computed(() => {
  const p = props.approval.priority
  if (p === 'urgent') return '加急'
  if (p === 'high') return '高'
  return '普通'
})

const approverStatusClass = (status) => {
  const map = {
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const approverStatusText = (status) => {
  const map = { approved: '已通过', rejected: '已拒绝', pending: '待审批' }
  return map[status] || status
}

const ACTION_MAP = {
  approve: { icon: Check, color: '#3b82f6', bg: 'bg-blue-100', text: '通过' },
  reject: { icon: CircleClose, color: '#ef4444', bg: 'bg-red-100', text: '拒绝' },
  comment: { icon: User, color: '#6b7280', bg: 'bg-gray-100', text: '评论' },
}

const formatTime = (time) => {
  if (!time) return ''
  try {
    return new Date(time).toLocaleString('zh-CN')
  } catch {
    return time
  }
}

// 为审批记录添加图标/颜色/bg
const enrichRecord = (record) => {
  const action = ACTION_MAP[record.action] || ACTION_MAP.comment
  return {
    ...record,
    actionIcon: action.icon,
    actionColor: action.color,
    actionBgClass: action.bg,
    actionText: action.text,
  }
}

// 用 Object.defineProperty 在模板中访问
// 实际模板中通过 .records 访问，所以预处理
if (props.approval.records) {
  props.approval.records = props.approval.records.map(enrichRecord)
}

const handleApprove = () => emit('approve', props.approval.id)
const handleReject = () => emit('reject', props.approval.id)
</script>
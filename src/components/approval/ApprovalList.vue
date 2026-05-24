<template>
  <!-- 空状态 -->
  <div v-if="approvals.length === 0" class="bg-white rounded-xl p-12 text-center">
    <p class="text-gray-500">{{ emptyText }}</p>
  </div>

  <!-- 审批列表 -->
  <div v-else class="space-y-3">
    <div
      v-for="approval in approvals"
      :key="approval.id"
      class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-4">
          <!-- 状态图标 -->
          <el-icon :size="20" :class="getStatusClass(approval.status)">
            <component :is="getStatusIcon(approval.status)" />
          </el-icon>

          <div>
            <!-- 标题 -->
            <h3 class="font-semibold text-gray-900">{{ approval.title }}</h3>

            <!-- 基本信息 -->
            <p class="text-sm text-gray-500 mt-1">
              {{ approval.applicantName }} · {{ approval.applicantDepartment }} · {{ approval.applyDate }}
            </p>

            <!-- 标签信息 -->
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <el-tag size="small" type="info">{{ approval.typeName }}</el-tag>
              <ApprovalLevelBadge
                v-if="approval.approvalLevel"
                :level="approval.approvalLevel"
                :compact="true"
              />
              <span class="text-xs text-gray-400">
                审批进度：{{ approval.currentStep }}/{{ approval.totalSteps }}
              </span>
              <el-tag v-if="approval.priority === 'urgent'" size="small" type="danger">加急</el-tag>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- 状态标签 -->
          <el-tag :type="getStatusTagType(approval.status)" size="small">
            {{ getStatusText(approval.status) }}
          </el-tag>

          <!-- 查看详情 -->
          <el-button
            v-if="onView"
            link
            type="primary"
            size="small"
            @click="onView(approval.id)"
            class="text-emerald-600 hover:text-emerald-700"
          >
            查看详情
            <el-icon class="ml-1"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        v-if="showActions && approval.status === 'pending'"
        class="mt-4 pt-4 border-t border-gray-100 flex gap-2"
      >
        <el-button
          v-if="onApprove && canApprove"
          type="primary"
          class="bg-emerald-600 hover:bg-emerald-700"
          @click="onApprove(approval.id)"
        >
          通过
        </el-button>
        <el-button
          v-if="onPartialApprove && canApprove"
          @click="onPartialApprove(approval)"
        >
          部分通过
        </el-button>
        <el-button
          v-if="onReject && canReject"
          type="danger"
          @click="onReject(approval.id)"
        >
          拒绝
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { ElIcon, ElTag, ElButton } from 'element-plus'
import ApprovalLevelBadge from './ApprovalLevelBadge.vue'

// ============================================================
// 审批列表组件
// 文件路径：src/components/approval/ApprovalList.vue
// 组件化结构：统一的审批列表展示
// ============================================================

// 审批状态枚举
const ApprovalStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// 审批级别枚举
const ApprovalLevel = {
  EXEMPT: 'exempt',
  QUICK: 'quick',
  STANDARD: 'standard',
  STRICT: 'strict'
}

const props = defineProps({
  // 审批列表
  approvals: {
    type: Array,
    default: () => []
  },
  // 查看详情回调
  onView: {
    type: Function,
    default: null
  },
  // 通过回调
  onApprove: {
    type: Function,
    default: null
  },
  // 拒绝回调
  onReject: {
    type: Function,
    default: null
  },
  // 部分通过回调
  onPartialApprove: {
    type: Function,
    default: null
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  },
  // 空状态文本
  emptyText: {
    type: String,
    default: '暂无审批记录'
  },
  // 权限控制
  canApprove: {
    type: Boolean,
    default: true
  },
  canReject: {
    type: Boolean,
    default: true
  },
  canExport: {
    type: Boolean,
    default: true
  }
})

// 获取状态图标
const getStatusIcon = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return 'CircleCheckFilled'
    case ApprovalStatus.REJECTED:
      return 'CircleCloseFilled'
    case ApprovalStatus.PARTIALLY_APPROVED:
      return 'WarningFilled'
    default:
      return 'Clock'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case ApprovalStatus.DRAFT:
      return '草稿'
    case ApprovalStatus.PENDING:
      return '待审批'
    case ApprovalStatus.APPROVED:
      return '已通过'
    case ApprovalStatus.PARTIALLY_APPROVED:
      return '部分通过'
    case ApprovalStatus.REJECTED:
      return '已拒绝'
    case ApprovalStatus.CANCELLED:
      return '已撤回'
    default:
      return status
  }
}

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return 'text-emerald-500'
    case ApprovalStatus.REJECTED:
      return 'text-red-500'
    case ApprovalStatus.PARTIALLY_APPROVED:
      return 'text-amber-500'
    default:
      return 'text-yellow-500'
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return 'success'
    case ApprovalStatus.REJECTED:
      return 'danger'
    case ApprovalStatus.PARTIALLY_APPROVED:
      return 'warning'
    case ApprovalStatus.PENDING:
      return 'warning'
    case ApprovalStatus.CANCELLED:
      return 'info'
    default:
      return 'info'
  }
}
</script>

<style scoped>
:deep(.el-tag) {
  border-radius: 9999px;
}
</style>

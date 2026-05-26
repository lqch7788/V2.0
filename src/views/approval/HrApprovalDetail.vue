<template>
  <div class="approval-detail" :class="{ 'p-6': !isModal }">
    <!-- 打印样式 -->
    <style>
      @media print {
        .no-print { display: none !important; }
        .approval-detail { padding: 0 !important; }
      }
    </style>

    <!-- 头部（非弹窗模式） -->
    <div v-if="!isModal" class="bg-white rounded-xl p-6 shadow-none mb-4 no-print">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <el-button :icon="ArrowLeft" @click="handleClose" text />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">审批单详情</h1>
            <p class="text-gray-500">查看审批申请详细信息</p>
          </div>
        </div>
        <div class="flex items-center gap-2 no-print">
          <el-button @click="handlePrint">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="!approval" class="flex items-center justify-center h-64">
      <div class="text-gray-500">加载中...</div>
    </div>

    <template v-else>
      <!-- 基础信息 -->
      <div class="bg-white rounded-xl shadow-sm mb-4">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">审批信息</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-500">审批编号</span>
              <p class="font-medium">{{ approval.code }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">审批类型</span>
              <p class="font-medium">{{ typeName }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">申请人</span>
              <p class="font-medium">{{ approval.applicantName }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">所属部门</span>
              <p class="font-medium">{{ approval.applicantDepartment }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">申请时间</span>
              <p class="font-medium">{{ approval.applyDate }} {{ approval.applyTime }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">当前状态</span>
              <p class="font-medium">
                <el-tag :type="statusBadgeType" size="small">{{ statusText }}</el-tag>
              </p>
            </div>
            <div>
              <span class="text-sm text-gray-500">审批进度</span>
              <p class="font-medium">第 {{ approval.currentStep }} / {{ approval.totalSteps }} 步</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">优先级</span>
              <p class="font-medium">
                <el-tag :type="priorityBadgeType" size="small">{{ priorityText }}</el-tag>
              </p>
            </div>
          </div>
          <div v-if="approval.title" class="mt-4">
            <span class="text-sm text-gray-500">标题</span>
            <p class="font-medium">{{ approval.title }}</p>
          </div>
          <div v-if="approval.description" class="mt-4">
            <span class="text-sm text-gray-500">描述</span>
            <p class="text-gray-700">{{ approval.description }}</p>
          </div>
        </div>
      </div>

      <!-- 业务信息 -->
      <div v-if="approval.businessLink" class="bg-white rounded-xl shadow-sm mb-4">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">业务信息</h3>
        </div>
        <div class="p-6">
          <!-- 请假申请 -->
          <template v-if="approval.type === 'leave'">
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-sm text-gray-500">请假类型</span>
                  <p class="font-medium">{{ leaveTypeName(bl.leaveType) }}</p>
                </div>
                <div v-if="bl.startDate">
                  <span class="text-sm text-gray-500">开始日期</span>
                  <p class="font-medium">{{ bl.startDate }}</p>
                </div>
                <div v-if="bl.endDate">
                  <span class="text-sm text-gray-500">结束日期</span>
                  <p class="font-medium">{{ bl.endDate }}</p>
                </div>
                <div v-if="bl.totalDays">
                  <span class="text-sm text-gray-500">请假天数</span>
                  <p class="font-medium">{{ bl.totalDays }} 天</p>
                </div>
              </div>
              <div v-if="bl.reason">
                <span class="text-sm text-gray-500">请假原因</span>
                <p class="text-gray-700">{{ bl.reason }}</p>
              </div>
              <div v-if="bl.substituteName">
                <span class="text-sm text-gray-500">替班人员</span>
                <p class="font-medium">{{ bl.substituteName }}</p>
              </div>
            </div>
          </template>

          <!-- 加班申请 -->
          <template v-else-if="approval.type === 'overtime'">
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-sm text-gray-500">加班类型</span>
                  <p class="font-medium">{{ overtimeTypeName(bl.overtimeType) }}</p>
                </div>
                <div v-if="bl.date">
                  <span class="text-sm text-gray-500">加班日期</span>
                  <p class="font-medium">{{ bl.date }}</p>
                </div>
                <div v-if="bl.startTime">
                  <span class="text-sm text-gray-500">开始时间</span>
                  <p class="font-medium">{{ bl.startTime }}</p>
                </div>
                <div v-if="bl.endTime">
                  <span class="text-sm text-gray-500">结束时间</span>
                  <p class="font-medium">{{ bl.endTime }}</p>
                </div>
                <div v-if="bl.totalHours">
                  <span class="text-sm text-gray-500">总时长</span>
                  <p class="font-medium">{{ bl.totalHours }} 小时</p>
                </div>
              </div>
              <div v-if="bl.reason">
                <span class="text-sm text-gray-500">加班原因</span>
                <p class="text-gray-700">{{ bl.reason }}</p>
              </div>
            </div>
          </template>

          <!-- 调岗申请 -->
          <template v-else-if="approval.type === 'transfer'">
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div v-if="bl.employeeName">
                  <span class="text-sm text-gray-500">员工姓名</span>
                  <p class="font-medium">{{ bl.employeeName }}</p>
                </div>
                <div v-if="bl.fromDepartment">
                  <span class="text-sm text-gray-500">原部门</span>
                  <p class="font-medium">{{ bl.fromDepartment }}</p>
                </div>
                <div v-if="bl.fromPosition">
                  <span class="text-sm text-gray-500">原岗位</span>
                  <p class="font-medium">{{ bl.fromPosition }}</p>
                </div>
                <div v-if="bl.toDepartment">
                  <span class="text-sm text-gray-500">调入部门</span>
                  <p class="font-medium">{{ bl.toDepartment }}</p>
                </div>
                <div v-if="bl.toPosition">
                  <span class="text-sm text-gray-500">调入岗位</span>
                  <p class="font-medium">{{ bl.toPosition }}</p>
                </div>
                <div v-if="bl.effectiveDate">
                  <span class="text-sm text-gray-500">生效日期</span>
                  <p class="font-medium">{{ bl.effectiveDate }}</p>
                </div>
              </div>
              <div v-if="bl.reason">
                <span class="text-sm text-gray-500">调岗原因</span>
                <p class="text-gray-700">{{ bl.reason }}</p>
              </div>
            </div>
          </template>

          <!-- 离职申请 -->
          <template v-else-if="approval.type === 'resignation'">
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div v-if="bl.employeeName">
                  <span class="text-sm text-gray-500">员工姓名</span>
                  <p class="font-medium">{{ bl.employeeName }}</p>
                </div>
                <div v-if="bl.department">
                  <span class="text-sm text-gray-500">所属部门</span>
                  <p class="font-medium">{{ bl.department }}</p>
                </div>
                <div v-if="bl.position">
                  <span class="text-sm text-gray-500">岗位</span>
                  <p class="font-medium">{{ bl.position }}</p>
                </div>
                <div v-if="bl.joinDate">
                  <span class="text-sm text-gray-500">入职日期</span>
                  <p class="font-medium">{{ bl.joinDate }}</p>
                </div>
                <div v-if="bl.expectedResignDate">
                  <span class="text-sm text-gray-500">预计离职日期</span>
                  <p class="font-medium">{{ bl.expectedResignDate }}</p>
                </div>
              </div>
              <div v-if="bl.reason">
                <span class="text-sm text-gray-500">离职原因</span>
                <p class="text-gray-700">{{ bl.reason }}</p>
              </div>
              <div v-if="bl.handoverNotes">
                <span class="text-sm text-gray-500">交接说明</span>
                <p class="text-gray-700">{{ bl.handoverNotes }}</p>
              </div>
            </div>
          </template>

          <!-- 招聘申请 -->
          <template v-else-if="approval.type === 'recruitment'">
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div v-if="bl.department">
                  <span class="text-sm text-gray-500">招聘部门</span>
                  <p class="font-medium">{{ bl.department }}</p>
                </div>
                <div v-if="bl.position">
                  <span class="text-sm text-gray-500">招聘岗位</span>
                  <p class="font-medium">{{ bl.position }}</p>
                </div>
                <div v-if="bl.headcount">
                  <span class="text-sm text-gray-500">招聘人数</span>
                  <p class="font-medium">{{ bl.headcount }} 人</p>
                </div>
                <div v-if="bl.employmentType">
                  <span class="text-sm text-gray-500">用工类型</span>
                  <p class="font-medium">{{ bl.employmentType }}</p>
                </div>
                <div v-if="bl.salaryMin && bl.salaryMax">
                  <span class="text-sm text-gray-500">薪资范围</span>
                  <p class="font-medium">{{ bl.salaryMin }} - {{ bl.salaryMax }} 元/月</p>
                </div>
                <div v-if="bl.priority">
                  <span class="text-sm text-gray-500">优先级</span>
                  <p class="font-medium">
                    <el-tag :type="bl.priority === 'urgent' ? 'danger' : bl.priority === 'high' ? 'warning' : ''" size="small">
                      {{ priorityMap[bl.priority] || bl.priority }}
                    </el-tag>
                  </p>
                </div>
              </div>
              <div v-if="bl.reason">
                <span class="text-sm text-gray-500">招聘原因</span>
                <p class="text-gray-700">{{ bl.reason }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 审批流程 -->
      <div v-if="approval.approvers && approval.approvers.length > 0" class="bg-white rounded-xl shadow-sm mb-4">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">审批流程</h3>
        </div>
        <div class="p-6">
          <div class="space-y-2">
            <div
              v-for="(approver, index) in approval.approvers"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  :class="{
                    'bg-green-500': approver.status === 'approved',
                    'bg-red-500': approver.status === 'rejected',
                    'bg-gray-400': approver.status === 'skipped',
                    'bg-yellow-500': approver.status === 'pending'
                  }"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium">{{ approver.userName }}</p>
                  <p class="text-sm text-gray-500">{{ approver.role }}</p>
                </div>
              </div>
              <div class="text-right">
                <el-tag
                  :type="approver.status === 'approved' ? 'success' : approver.status === 'rejected' ? 'danger' : 'warning'"
                  size="small"
                >
                  {{ approverStatusText(approver.status) }}
                </el-tag>
                <p v-if="approver.actionTime" class="text-xs text-gray-400 mt-1">{{ approver.actionTime }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 审批历史 -->
      <div v-if="approval.records && approval.records.length > 0" class="bg-white rounded-xl shadow-sm mb-4">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">审批历史</h3>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div v-for="(record, index) in approval.records" :key="index" class="flex gap-3">
              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  :class="{
                    'bg-green-500': record.action === 'approve',
                    'bg-red-500': record.action === 'reject',
                    'bg-gray-400': record.action === 'cancel',
                    'bg-blue-500': record.action === 'partially_approve'
                  }"
                >
                  <el-icon :size="14">
                    <Check v-if="record.action === 'approve' || record.action === 'partially_approve'" />
                    <Close v-else-if="record.action === 'reject'" />
                    <Clock v-else />
                  </el-icon>
                </div>
                <div v-if="index < approval.records.length - 1" class="w-0.5 flex-1 bg-gray-200 my-1" />
              </div>
              <div class="flex-1 pb-3">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ record.approverName }}</span>
                  <span
                    class="text-sm font-medium"
                    :class="{
                      'text-green-600': record.action === 'approve',
                      'text-red-600': record.action === 'reject',
                      'text-gray-600': record.action !== 'approve' && record.action !== 'reject'
                    }"
                  >
                    {{ actionName(record.action) }}
                  </span>
                </div>
                <div v-if="record.comment" class="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                  意见：{{ record.comment }}
                </div>
                <div class="text-xs text-gray-400 mt-1">{{ record.actionTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 附件列表 -->
      <div v-if="approval.attachments && approval.attachments.length > 0" class="bg-white rounded-xl shadow-sm mb-4">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">附件列表</h3>
        </div>
        <div class="p-6">
          <div class="space-y-2">
            <div
              v-for="(item, index) in approval.attachments"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <el-icon class="text-blue-500"><Document /></el-icon>
                <div>
                  <p class="font-medium">附件 {{ index + 1 }}</p>
                  <p class="text-sm text-gray-500">{{ item }}</p>
                </div>
              </div>
              <el-button text @click="handleDownload(item, `附件${index + 1}`)">
                <el-icon><Download /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮（弹窗模式） -->
      <div v-if="isModal" class="flex justify-end gap-2 mt-4 no-print">
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Printer,
  Check,
  Close,
  Clock,
  Document,
  Download
} from '@element-plus/icons-vue'
import { useApprovalStore } from '@/stores/modules/approval'
import { getApprovalTypeName } from '@/services/apiApprovalService'

// Props
const props = defineProps({
  approvalId: { type: String, default: '' },
  isModal: { type: Boolean, default: false },
  onClose: { type: Function, default: null }
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const approvalStore = useApprovalStore()

// 当前审批ID
const currentApprovalId = computed(() => props.approvalId || route.params.id)

// 获取审批详情
const approval = computed(() => {
  if (!currentApprovalId.value) return null
  return approvalStore.getApprovalById(currentApprovalId.value)
})

// 业务链接数据
const bl = computed(() => approval.value?.businessLink || {})

// 类型名称
const typeName = computed(() => approval.value ? getApprovalTypeName(approval.value.type) : '')

// 状态
const statusText = computed(() => {
  const map = { pending: '待审批', approved: '已通过', rejected: '已拒绝', partially_approved: '部分通过', cancelled: '已撤回', draft: '草稿' }
  return approval.value ? (map[approval.value.status] || approval.value.status) : ''
})

const statusBadgeType = computed(() => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', partially_approved: 'info', cancelled: 'info', draft: 'info' }
  return approval.value ? (map[approval.value.status] || 'info') : 'info'
})

// 优先级
const priorityMap = { low: '低', normal: '普通', high: '高', urgent: '紧急' }
const priorityText = computed(() => approval.value ? (priorityMap[approval.value.priority] || approval.value.priority) : '')
const priorityBadgeType = computed(() => {
  if (!approval.value) return ''
  if (approval.value.priority === 'urgent') return 'danger'
  if (approval.value.priority === 'high') return 'warning'
  return ''
})

// 请假类型映射
const leaveTypeNames = { annual: '年假', sick: '病假', personal: '事假', marriage: '婚假', maternity: '产假', funeral: '丧假' }
const leaveTypeName = (t) => leaveTypeNames[t] || t

// 加班类型映射
const overtimeTypeNames = { weekday: '工作日加班', weekend: '周末加班', holiday: '节假日加班' }
const overtimeTypeName = (t) => overtimeTypeNames[t] || t

// 审批人状态文本
const approverStatusText = (s) => {
  const map = { approved: '已通过', rejected: '已拒绝', skipped: '已跳过', pending: '待审批' }
  return map[s] || s
}

// 操作名称
const actionName = (action) => {
  const map = { approve: '通过', reject: '拒绝', partially_approve: '部分通过', cancel: '撤回' }
  return map[action] || action
}

// 关闭
const handleClose = () => {
  if (props.onClose) {
    props.onClose()
  } else {
    emit('close')
    router.back()
  }
}

// 打印
const handlePrint = () => {
  window.print()
}

// 附件下载
const handleDownload = (url, fileName) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
}
</script>

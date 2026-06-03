<template>
  <div class="space-y-6">
    <!-- 基本信息 -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-500">审批单号</div>
          <div class="font-medium text-gray-900">{{ approval.code }}</div>
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
            <el-icon :size="20" :color="statusColor"><component :is="statusIcon" /></el-icon>
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
          <div class="font-medium text-gray-900">
            {{ approval.priority === 'urgent' ? '加急' : approval.priority === 'high' ? '高' : '普通' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 审批流程 -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">审批流程</h3>
      <div class="space-y-3">
        <div
          v-for="(approver, index) in approval.approvers"
          :key="approver.userId"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <el-icon class="text-emerald-600"><User /></el-icon>
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
          <div :class="[
            'px-2 py-1 rounded-full text-xs font-medium',
            approver.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
            approver.status === 'rejected' ? 'bg-red-100 text-red-700' :
            approver.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          ]">
            {{ approver.status === 'approved' ? '已通过' :
               approver.status === 'rejected' ? '已拒绝' :
               approver.status === 'pending' ? '待审批' : approver.status }}
          </div>
        </div>
      </div>
    </div>

    <!-- 审批记录 -->
    <div v-if="approval.records && approval.records.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">审批记录</h3>
      <div class="space-y-3">
        <div v-for="record in approval.records" :key="record.id" class="flex gap-3 p-3 bg-gray-50 rounded-lg">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon v-if="record.action === 'approve'" class="text-blue-600"><Check /></el-icon>
            <el-icon v-else-if="record.action === 'reject'" class="text-red-600"><Close /></el-icon>
            <el-icon v-else class="text-gray-600"><Comment /></el-icon>
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900">
              {{ record.approverName }}
              <span class="text-gray-400 text-sm ml-2">
                {{ getActionText(record.action) }}
              </span>
            </div>
            <div v-if="record.comment" class="text-sm text-gray-600 mt-1">{{ record.comment }}</div>
            <div class="text-xs text-gray-400 mt-1">
              {{ formatDateTime(record.actionTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 物料明细（如果有） -->
    <div v-if="approval.materials && approval.materials.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">物料明细</h3>
      <el-table :data="approval.materials" stripe size="small">
        <el-table-column prop="materialCode" label="物料编码" />
        <el-table-column prop="materialName" label="物料名称" />
        <el-table-column prop="requestedQuantity" label="申请数量" align="right">
          <template #default="{ row }">
            {{ row.requestedQuantity }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column v-if="approval.status === 'partially_approved'" prop="approvedQuantity" label="批准数量" align="right">
          <template #default="{ row }">
            {{ row.approvedQuantity ?? row.requestedQuantity }} {{ row.unit }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 业务关联信息 -->
    <div v-if="approval.businessLink && Object.keys(approval.businessLink).length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ getBusinessTitle() }}</h3>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(value, key) in approval.businessLink" :key="key" class="flex flex-col">
          <span class="text-xs text-gray-500">{{ getBizFieldLabel(key) }}</span>
          <span class="text-sm font-medium text-gray-900">{{ formatBizValue(key, value) }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮（showActions && status === pending 时渲染） -->
    <!--
      P0-002 修复：从 V1.1 ApprovalDetail.tsx L246-265 1:1 翻译
      当父组件传 showActions=true 且当前审批状态为 pending 时，显示 拒绝/通过 按钮
    -->
    <div
      v-if="showActions && approval.status === 'pending'"
      class="flex justify-end gap-3 pt-4 border-t border-gray-200"
    >
      <button
        v-if="onReject && canReject"
        @click="handleReject"
        class="h-10 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
      >
        拒绝
      </button>
      <button
        v-if="onApprove && canApprove"
        @click="handleApprove"
        class="h-10 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
      >
        通过
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, Close, Clock, User, Comment } from '@element-plus/icons-vue'

// ============================================================
// 审批状态常量（与 V1.1 保持一致）
// ============================================================

const ApprovalStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// ============================================================
// Props 定义（1:1 翻译 V1.1 L14-22）
// ============================================================

const props = defineProps({
  // 审批对象（必填）
  approval: {
    type: Object,
    required: true
  },
  // 是否显示操作按钮（默认 false）
  showActions: {
    type: Boolean,
    default: false
  },
  // 通过回调（可选）
  onApprove: {
    type: Function,
    default: undefined
  },
  // 拒绝回调（可选）
  onReject: {
    type: Function,
    default: undefined
  },
  // 关闭回调（可选）
  onClose: {
    type: Function,
    default: undefined
  },
  // 是否有通过权限（默认 true）
  canApprove: {
    type: Boolean,
    default: true
  },
  // 是否有拒绝权限（默认 true）
  canReject: {
    type: Boolean,
    default: true
  }
})

// ============================================================
// 操作事件触发（V1.1: onClick={() => onApprove(approval.id)}）
// ============================================================

const handleApprove = () => {
  if (props.onApprove) {
    props.onApprove(props.approval.id)
  }
}

const handleReject = () => {
  if (props.onReject) {
    props.onReject(props.approval.id)
  }
}

// 获取状态图标
const statusIcon = computed(() => {
  switch (props.approval.status) {
    case ApprovalStatus.APPROVED:
      return Check
    case ApprovalStatus.REJECTED:
      return Close
    default:
      // P0-003 修复：default 状态改回 Clock（V1.1 L40: <Clock className="w-5 h-5 text-yellow-500" />）
      return Clock
  }
})

// 获取状态颜色
const statusColor = computed(() => {
  switch (props.approval.status) {
    case 'approved':
      return '#10b981' // emerald-500
    case 'rejected':
      return '#ef4444' // red-500
    default:
      return '#f59e0b' // yellow-500
  }
})

// 获取状态文本
const statusText = computed(() => {
  switch (props.approval.status) {
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
      return props.approval.status
  }
})

// 获取操作文本
const getActionText = (action) => {
  switch (action) {
    case 'approve':
      return '通过'
    case 'reject':
      return '拒绝'
    case 'partially_approve':
      return '部分通过'
    case 'cancel':
      return '撤回'
    default:
      return action
  }
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleString()
}

// 业务信息标题
const getBusinessTitle = () => {
  const type = props.approval.businessLink?.type
  const typeLabels = {
    production: '生产计划信息',
    production_batch: '生产批次信息',
    batch_change: '批次变更信息',
    batch_void: '批次作废信息',
    tech_solution: '技术方案信息',
    harvest: '采收申请信息',
    material: '领料申请信息',
    purchase: '采购申请信息',
    leave: '请假申请信息',
    overtime: '加班申请信息',
    transfer: '转岗申请信息',
    resign: '离职申请信息',
    task_dispatch: '任务派发信息',
    task_change: '任务变更信息',
    inspection_issue: '巡查问题信息',
    issue_resolve: '问题整改信息',
    indicator: '指标信息',
    budget_create: '预算编制信息',
    budget_adjust: '预算调整信息',
  }
  return typeLabels[type] || '业务关联信息'
}

// 业务字段中文映射
const getBizFieldLabel = (key) => {
  const labels = {
    type: '业务类型',
    requestId: '请求ID',
    requestCode: '关联编号',
    batchCode: '批次编号',
    cropName: '作物名称',
    cropCode: '作物编码',
    variety: '品种',
    greenhouseName: '温室区域',
    greenhouseId: '温室ID',
    startDate: '开始日期',
    endDate: '结束日期',
    expectedHarvestDate: '预计采收',
    expectedDeliveryDate: '预计交货',
    responsiblePerson: '负责人',
    targetYield: '目标产量',
    plantingArea: '种植面积',
    plantingMode: '种植方式',
    unit: '单位',
    quantity: '数量',
    leaveType: '请假类型',
    overtimetype: '加班类型',
    date: '日期',
    totalDays: '天数',
    totalHours: '小时数',
    reason: '原因',
    supplier: '供应商',
    fromWarehouse: '源仓库',
    toWarehouse: '目标仓库',
    solutionTitle: '方案标题',
    stage: '阶段',
    version: '版本号',
    remarks: '备注',
    description: '描述',
  }
  return labels[key] || key
}

// 格式化业务值
const formatBizValue = (key, value) => {
  if (key === 'type') {
    const typeMap = {
      production: '生产计划', production_batch: '生产批次',
      batch_change: '批次变更', batch_void: '批次作废',
      tech_solution: '技术方案', harvest: '采收申请',
      material: '领料申请', purchase: '采购申请',
      leave: '请假', overtime: '加班', transfer: '转岗', resign: '离职',
      task_dispatch: '任务派发', task_change: '任务变更',
      inspection_issue: '巡查问题', issue_resolve: '问题整改',
      indicator: '指标', budget_create: '预算编制', budget_adjust: '预算调整',
    }
    return typeMap[value] || String(value)
  }
  if (key === 'targetYield') return `${value} kg`
  if (key === 'plantingArea') return `${value} m²`
  if (key === 'plantingMode') {
    const modes = { internal_seed: '自育苗', external_purchase: '外购苗', open_field: '露天栽培', greenhouse: '温室栽培', hydroponics: '水培', aeroponics: '气雾培', substrate: '基质培', soil: '土培' }
    return modes[value] || String(value)
  }
  if (key === 'stage') {
    const stages = { seedling: '苗期', vegetative: '营养生长期', flowering: '开花期', fruiting: '结果期', harvest: '采收期', entire: '整个生命周期', whole_lifecycle: '整个生命周期' }
    return stages[value] || String(value)
  }
  if (key === 'totalDays') return `${value}天`
  if (key === 'totalHours') return `${value}小时`
  return String(value)
}
</script>

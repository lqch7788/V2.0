<template>
  <div class="space-y-4">
    <!-- 头部 -->
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-900">业务单据预览</h4>
      <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
        {{ approvalTypeName }}
      </span>
    </div>

    <!-- 空状态 -->
    <div v-if="!businessLink" class="text-center py-8 text-gray-500">
      暂无业务单据数据
    </div>

    <!-- 业务内容 -->
    <div v-else>
      <!-- 领料预览 -->
      <div v-if="businessLink.type === 'material'" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">领料单号</div>
            <div class="text-sm font-medium text-gray-900">{{ businessLink.requestCode }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">申请时间</div>
            <div class="text-sm text-gray-900">{{ approval.applyDate }}</div>
          </div>
        </div>

        <div>
          <div class="text-xs text-gray-500 mb-1">领料用途</div>
          <div class="text-sm text-gray-900">{{ businessLink.purpose || '-' }}</div>
        </div>

        <div v-if="businessLink.materials && businessLink.materials.length > 0">
          <div class="text-xs text-gray-500 mb-2">物料明细</div>
          <el-table :data="businessLink.materials" size="small" border>
            <el-table-column prop="materialName" label="物料名称" width="150" />
            <el-table-column prop="requestedQuantity" label="申请数量" align="right" width="100" />
            <el-table-column prop="unit" label="单位" align="right" width="80" />
          </el-table>
        </div>
      </div>

      <!-- 采购预览 -->
      <div v-else-if="businessLink.type === 'purchase'" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">采购单号</div>
            <div class="text-sm font-medium text-gray-900">{{ businessLink.requestCode }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">预计金额</div>
            <div class="text-sm font-medium text-emerald-600">
              ¥{{ businessLink.totalAmount?.toLocaleString() || '-' }}
            </div>
          </div>
        </div>

        <div v-if="businessLink.items && businessLink.items.length > 0">
          <div class="text-xs text-gray-500 mb-2">采购明细</div>
          <el-table :data="businessLink.items" size="small" border>
            <el-table-column prop="materialName" label="物料名称" width="150" />
            <el-table-column prop="quantity" label="数量" align="right" width="80" />
            <el-table-column label="预计单价" align="right" width="100">
              <template #default="{ row }">
                ¥{{ row.estimatedPrice }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="businessLink.expectedDeliveryDate">
          <div class="text-xs text-gray-500 mb-1">期望交付日期</div>
          <div class="text-sm text-gray-900">{{ businessLink.expectedDeliveryDate }}</div>
        </div>
      </div>

      <!-- 请假预览 -->
      <div v-else-if="businessLink.type === 'leave'" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">请假类型</div>
            <div class="text-sm font-medium text-gray-900">
              {{ getLeaveTypeName(businessLink.leaveType) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">请假天数</div>
            <div class="text-sm font-medium text-gray-900">{{ businessLink.totalDays }} 天</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">开始日期</div>
            <div class="text-sm text-gray-900">{{ businessLink.startDate }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">结束日期</div>
            <div class="text-sm text-gray-900">{{ businessLink.endDate }}</div>
          </div>
        </div>

        <div>
          <div class="text-xs text-gray-500 mb-1">请假原因</div>
          <div class="text-sm text-gray-900">{{ businessLink.reason || '-' }}</div>
        </div>
      </div>

      <!-- 订单预览 -->
      <div v-else-if="['order_create', 'order_change'].includes(businessLink.type)" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">订单编号</div>
            <div class="text-sm font-medium text-gray-900">{{ businessLink.requestCode }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">客户名称</div>
            <div class="text-sm text-gray-900">{{ businessLink.customerName || '-' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">订单数量</div>
            <div class="text-sm text-gray-900">{{ businessLink.orderQuantity }} {{ businessLink.unit }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">优先级</div>
            <div :class="[
              'text-sm font-medium',
              businessLink.priority === 'urgent' ? 'text-red-600' :
              businessLink.priority === 'high' ? 'text-orange-600' : 'text-gray-900'
            ]">
              {{ getPriorityName(businessLink.priority) }}
            </div>
          </div>
        </div>

        <div>
          <div class="text-xs text-gray-500 mb-1">交货日期</div>
          <div class="text-sm text-gray-900">{{ businessLink.deadline || '-' }}</div>
        </div>
      </div>

      <!-- 生产计划预览 -->
      <div v-else-if="['production', 'production_plan', 'production_batch'].includes(businessLink.type)" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">计划编号</div>
            <div class="text-sm font-medium text-gray-900">
              {{ businessLink.planCode || businessLink.requestCode }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">作物名称</div>
            <div class="text-sm text-gray-900">{{ businessLink.cropName || '-' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">计划开始</div>
            <div class="text-sm text-gray-900">{{ businessLink.plannedStartDate || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">计划结束</div>
            <div class="text-sm text-gray-900">{{ businessLink.plannedEndDate || '-' }}</div>
          </div>
        </div>

        <div v-if="businessLink.targetYield">
          <div class="text-xs text-gray-500 mb-1">目标产量</div>
          <div class="text-sm font-medium text-emerald-600">{{ businessLink.targetYield }}</div>
        </div>
      </div>

      <!-- 技术方案预览 -->
      <div v-else-if="businessLink.type === 'tech_solution'" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">计划编号</div>
            <div class="text-sm font-medium text-gray-900">{{ businessLink.requestCode || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">方案标题</div>
            <div class="text-sm text-gray-900">{{ businessLink.solutionTitle || '-' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">作物名称</div>
            <div class="text-sm text-gray-900">{{ businessLink.cropName || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">种植方式</div>
            <div class="text-sm text-gray-900">{{ businessLink.plantingMode || '-' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">生长阶段</div>
            <div class="text-sm text-gray-900">{{ businessLink.stage || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">版本</div>
            <div class="text-sm text-gray-900">{{ businessLink.version || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 不支持的类型 -->
      <div v-else class="text-center py-8 text-gray-500">
        暂不支持预览此类型审批单
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'

// ============================================================
// 业务单据预览组件
// 文件路径：src/components/approval/BusinessPreview.vue
// 组件化结构：根据审批类型展示不同的业务单据预览
// ============================================================

// 审批类型枚举
const ApprovalType = {
  MATERIAL_REQUEST: 'material_request',
  PURCHASE_REQUEST: 'purchase_request',
  PRODUCTION_PLAN: 'production_plan',
  LEAVE: 'leave',
  OVERTIME: 'overtime'
}

// 审批类型名称映射
const getApprovalTypeName = (type) => {
  const typeMap = {
    [ApprovalType.MATERIAL_REQUEST]: '领料申请',
    [ApprovalType.PURCHASE_REQUEST]: '采购申请',
    [ApprovalType.PRODUCTION_PLAN]: '生产计划',
    [ApprovalType.LEAVE]: '请假',
    [ApprovalType.OVERTIME]: '加班'
  }
  return typeMap[type] || type
}

const props = defineProps({
  // 审批对象
  approval: {
    type: Object,
    required: true
  },
  // 业务关联数据
  businessLink: {
    type: Object,
    default: null
  }
})

// 审批类型名称
const approvalTypeName = computed(() => {
  return getApprovalTypeName(props.approval?.type)
})

// 请假类型名称
const getLeaveTypeName = (type) => {
  const typeMap = {
    annual: '年假',
    sick: '病假',
    personal: '事假',
    marriage: '婚假',
    maternity: '产假',
    funeral: '丧假'
  }
  return typeMap[type] || '-'
}

// 优先级名称
const getPriorityName = (priority) => {
  const priorityMap = {
    urgent: '紧急',
    high: '高',
    normal: '普通'
  }
  return priorityMap[priority] || '-'
}
</script>

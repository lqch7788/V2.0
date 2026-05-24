<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between gap-4">
      <!-- 左侧：全选和统计 -->
      <div class="flex items-center gap-4">
        <el-checkbox
          v-model="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
          class="text-gray-600"
        >
          <span class="text-sm font-medium">全选</span>
        </el-checkbox>

        <div class="h-6 w-px bg-gray-200" />

        <span class="text-sm text-gray-500">
          已选择 <span class="font-semibold text-gray-900">{{ selectedIds.size }}</span> 项
          <span v-if="hasUnsupportedSelected" class="text-amber-600 ml-1">
            （含{{ unsupportedCount }}项不支持批量）
          </span>
        </span>
      </div>

      <!-- 右侧：批量操作按钮 -->
      <div class="flex items-center gap-2">
        <template v-if="canApprove">
          <el-button
            :disabled="selectedBatchApprovals.length === 0"
            :class="[
              'transition-all duration-200 font-medium',
              selectedBatchApprovals.length === 0
                ? 'bg-emerald-500 text-white cursor-not-allowed opacity-60'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm'
            ]"
            @click="onBatchApprove"
          >
            <el-icon class="mr-1"><Check /></el-icon>
            批量通过
          </el-button>
          <el-button
            :disabled="selectedBatchApprovals.length === 0"
            :class="[
              'transition-all duration-200 font-medium',
              selectedBatchApprovals.length === 0
                ? 'bg-red-500 text-white cursor-not-allowed opacity-60'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm'
            ]"
            @click="onBatchReject"
          >
            <el-icon class="mr-1"><Close /></el-icon>
            批量拒绝
          </el-button>
        </template>

        <template v-if="canExport">
          <div class="h-6 w-px bg-gray-200" />
          <el-button
            :disabled="selectedIds.size === 0"
            :class="[
              'transition-all duration-200 font-medium',
              selectedIds.size === 0
                ? 'bg-blue-500 text-white cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm'
            ]"
            @click="onExport"
          >
            <el-icon class="mr-1"><Download /></el-icon>
            批量导出
          </el-button>
        </template>
      </div>
    </div>

    <!-- 提示信息 -->
    <div v-if="hasUnsupportedSelected" class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <p class="text-sm text-amber-800">
        <span class="font-medium">提示：</span>
        以下审批类型不支持批量操作：离职、招聘、入职、调薪、工资预算、转岗
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, Close, Download } from '@element-plus/icons-vue'
import { ElCheckbox, ElButton, ElIcon } from 'element-plus'

// ============================================================
// 批量操作栏组件
// 文件路径：src/components/approval/BatchActionBar.vue
// 组件化结构：支持批量审批操作的选择栏
// ============================================================

// 审批类型枚举
const ApprovalType = {
  RESIGNATION: 'resignation',
  RECRUITMENT: 'recruitment',
  ONBOARDING: 'onboarding',
  SALARY_ADJUSTMENT: 'salary_adjustment',
  SALARY_BUDGET: 'salary_budget',
  TRANSFER: 'transfer'
}

// HR敏感类型 - 不支持批量审批
const HR_SENSITIVE_TYPES = [
  ApprovalType.RESIGNATION,
  ApprovalType.RECRUITMENT,
  ApprovalType.ONBOARDING,
  ApprovalType.SALARY_ADJUSTMENT,
  ApprovalType.SALARY_BUDGET,
  ApprovalType.TRANSFER
]

const props = defineProps({
  // 选中的ID集合
  selectedIds: {
    type: Set,
    required: true
  },
  // 所有ID列表
  allIds: {
    type: Array,
    required: true
  },
  // 待审批列表
  pendingApprovals: {
    type: Array,
    default: () => []
  },
  // 全选回调
  onSelectAll: {
    type: Function,
    required: true
  },
  // 批量通过回调
  onBatchApprove: {
    type: Function,
    required: true
  },
  // 批量拒绝回调
  onBatchReject: {
    type: Function,
    required: true
  },
  // 导出回调
  onExport: {
    type: Function,
    required: true
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

// 检查是否支持批量审批
const isBatchSupported = (approval) => {
  return !HR_SENSITIVE_TYPES.includes(approval.type)
}

// 获取可批量操作的待审批单ID列表
const batchSupportedIds = computed(() => {
  return props.pendingApprovals
    .filter(a => isBatchSupported(a))
    .map(a => a.id)
})

// 是否全选
const isAllSelected = computed({
  get() {
    return props.selectedIds.size > 0 && props.selectedIds.size === batchSupportedIds.value.length
  },
  set(val) {
    handleSelectAll(val)
  }
})

// 是否不确定（部分选中）
const isIndeterminate = computed(() => {
  return props.selectedIds.size > 0 && props.selectedIds.size < batchSupportedIds.value.length
})

// 获取选中的可批量审批单
const selectedBatchApprovals = computed(() => {
  return props.pendingApprovals.filter(
    a => props.selectedIds.has(a.id) && isBatchSupported(a)
  )
})

// 判断选中项中是否有不支持批量操作的
const hasUnsupportedSelected = computed(() => {
  return props.pendingApprovals.some(
    a => props.selectedIds.has(a.id) && !isBatchSupported(a)
  )
})

// 不支持的选中数量
const unsupportedCount = computed(() => {
  return props.pendingApprovals.filter(
    a => props.selectedIds.has(a.id) && !isBatchSupported(a)
  ).length
})

// 处理全选
const handleSelectAll = (selectAll) => {
  props.onSelectAll(selectAll)
}
</script>

<style scoped>
:deep(.el-checkbox__label) {
  padding-left: 4px !important;
}
</style>

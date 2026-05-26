<template>
  <el-dialog
    v-model="visible"
    :title="`批量${actionText}结果`"
    width="800px"
    :close-on-click-modal="false"
  >
    <!-- 统计概览 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-emerald-50 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-emerald-600">{{ result?.success || 0 }}</div>
        <div class="text-sm text-emerald-700 mt-1">成功</div>
      </div>
      <div class="bg-red-50 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-red-600">{{ result?.failed || 0 }}</div>
        <div class="text-sm text-red-700 mt-1">失败</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-gray-600">{{ result?.total || 0 }}</div>
        <div class="text-sm text-gray-700 mt-1">总计</div>
      </div>
    </div>

    <!-- 整体结果提示 -->
    <div v-if="result?.failed === 0" class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
      <p class="text-emerald-800">
        <el-icon class="mr-2"><CircleCheckFilled /></el-icon>
        所有 {{ result?.total }} 项审批已成功{{ actionText }}！
      </p>
    </div>
    <div v-else-if="result?.success === 0" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <p class="text-red-800">
        <el-icon class="mr-2"><CircleCloseFilled /></el-icon>
        批量{{ actionText }}失败，所有 {{ result?.total }} 项审批均未成功。
      </p>
    </div>
    <div v-else class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <p class="text-amber-800">
        <el-icon class="mr-2"><WarningFilled /></el-icon>
        部分成功：{{ result?.success }} 项成功，{{ result?.failed }} 项失败。
      </p>
    </div>

    <!-- 失败项列表 -->
    <div v-if="failedItems.length > 0">
      <div class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <el-icon class="w-4 h-4 text-red-500"><WarningFilled /></el-icon>
        失败详情：
      </div>
      <div class="border border-red-200 rounded-lg overflow-hidden">
        <el-table :data="failedItems" size="small" class="result-table">
          <el-table-column prop="code" label="单号" width="120" />
          <el-table-column prop="typeName" label="类型" width="100" />
          <el-table-column prop="error" label="失败原因" width="180">
            <template #default="{ row }">
              <span class="text-red-600">{{ row.error }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-between w-full">
        <div>
          <el-button
            v-if="failedItems.length > 0 && onRetry"
            type="warning"
            class="bg-amber-600 hover:bg-amber-700"
            @click="handleRetry"
          >
            <el-icon class="mr-1"><RefreshRight /></el-icon>
            重试失败项
          </el-button>
        </div>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import {
  CircleCheckFilled,
  CircleCloseFilled,
  WarningFilled,
  RefreshRight
} from '@element-plus/icons-vue'
import { ElDialog, ElTable, ElTableColumn, ElButton, ElIcon } from 'element-plus'

// ============================================================
// 批量结果弹窗组件
// 文件路径：src/components/approval/BatchResultModal.vue
// 组件化结构：展示批量审批操作的结果
// ============================================================

// 批量操作结果项
const BatchResultItem = {
  id: '',
  code: '',
  typeName: '',
  success: false,
  error: ''
}

// 批量操作结果
const BatchApprovalResult = {
  total: 0,
  success: 0,
  failed: 0,
  details: []
}

const props = defineProps({
  // 是否打开
  isOpen: {
    type: Boolean,
    default: false
  },
  // 操作类型
  action: {
    type: String,
    default: 'approve'
  },
  // 结果数据
  result: {
    type: Object,
    default: null
  },
  // 关闭回调
  onClose: {
    type: Function,
    required: true
  },
  // 重试回调
  onRetry: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:isOpen'])

// 可见性
const visible = computed({
  get() {
    return props.isOpen
  },
  set(val) {
    emit('update:isOpen', val)
  }
})

// 是否通过操作
const isApprove = computed(() => props.action === 'approve')

// 操作文本
const actionText = computed(() => isApprove.value ? '通过' : '拒绝')

// 获取失败的项
const failedItems = computed(() => {
  if (!props.result) return []
  return props.result.details.filter(item => !item.success)
})

// 重试处理
const handleRetry = () => {
  if (props.onRetry) {
    props.onRetry(failedItems.value.map(item => item.id))
  }
}

// 关闭处理
const handleClose = () => {
  props.onClose()
}
</script>

<style scoped>
:deep(.result-table .el-table__header th) {
  background-color: #fef2f2 !important;
}
:deep(.result-table .el-table__row) {
  background-color: transparent;
}
</style>

<template>
  <el-dialog
    :model-value="isOpen"
    width="672px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="onClose"
  >
    <template #header>
      <!-- 与V1.1 Modal.tsx line 265 完全一致：3段 emerald 渐变（统一withdraw/cancel） -->
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">{{ modalTitle }}</span>
      </div>
    </template>
    <div v-if="!task" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-5">
      <!-- 警示信息 - 与V1.1 WithdrawCancelModal.tsx line 64-75 完全一致：
           border 类继承 + border-opacity-20（V1.1 用 border-opacity-20 让边色变浅） -->
      <div :class="['flex items-start gap-3 p-4 rounded-lg border', alertClass]">
        <el-icon :size="20" class="mt-0.5 flex-shrink-0">
          <WarningFilled />
        </el-icon>
        <div>
          <p class="font-medium">
            {{ isWithdraw ? '撤回后将取消该任务的派发，执行人将无法再接受此任务' : '取消后任务将终止，执行人将无法继续执行' }}
          </p>
          <p class="text-sm mt-1 opacity-80">
            此操作需要填写原因
          </p>
        </div>
      </div>

      <!-- 任务信息 - 与V1.1 line 77-86 一致 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <p class="font-medium text-gray-900">{{ task.title }}</p>
        <div class="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
          <p>任务编号：{{ task.taskCode }}</p>
          <p>执行人：{{ task.assigneeName }}</p>
          <p>当前状态：{{ statusLabel }}</p>
          <p>派发人：{{ task.assignerName }}</p>
        </div>
      </div>

      <!-- 操作说明 - 与V1.1 line 88-108 一致 -->
      <div :class="['p-3 rounded-lg', isWithdraw ? 'bg-blue-50' : 'bg-red-50']">
        <p class="text-sm font-medium mb-1">
          {{ isWithdraw ? '撤回操作' : '取消操作' }}适用于：
        </p>
        <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
          <template v-if="isWithdraw">
            <li>任务派发错误，需要重新派发</li>
            <li>任务内容有误，需要修改后重新派发</li>
            <li>执行人不可用，需要更换执行人</li>
          </template>
          <template v-else>
            <li>任务因外部原因无法继续执行</li>
            <li>任务目标已达成，无需继续执行</li>
            <li>紧急情况需要终止任务</li>
          </template>
        </ul>
      </div>

      <!-- 原因输入 - 与V1.1 line 110-122 一致：含 deepInputClass 深度样式 -->
      <div>
        <label class="text-gray-700 text-sm mb-1 block">
          操作原因 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="reason"
          type="textarea"
          :rows="3"
          :placeholder="'请输入' + (isWithdraw ? '撤回' : '取消') + '原因...'"
          class="deep-input"
        />
      </div>

      <!-- 操作按钮 - 与V1.1 line 124-144 一致：
           取消按钮 = variant secondary + size sm + X 图标
           确认按钮 = withdraw→blue / cancel→destructive + size sm + Check 图标 -->
      <div class="flex gap-3 justify-end pt-2">
        <el-button size="small" @click="handleCancel">
          <el-icon class="mr-1"><Close /></el-icon>
          取消
        </el-button>
        <el-button
          :type="isWithdraw ? 'primary' : 'danger'"
          :class="isWithdraw ? 'withdraw-confirm-btn' : ''"
          size="small"
          :disabled="!reason.trim()"
          @click="handleSubmit"
        >
          <el-icon class="mr-1"><Check /></el-icon>
          确认{{ modalTitle }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
/**
 * 撤回/取消弹窗组件
 * 功能：管理员撤回待接受任务或取消进行中任务
 * 对应 V1.1 src/components/farm/hub/modals/WithdrawCancelModal.tsx 1:1 映射
 */
import { ref, computed } from 'vue'
import { WarningFilled, Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  type: { type: String, default: 'withdraw' }, // 'withdraw' | 'cancel'
  onConfirm: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const reason = ref('')

/** 是否为撤回 */
const isWithdraw = computed(() => props.type === 'withdraw')

/** 弹窗标题 */
const modalTitle = computed(() => isWithdraw.value ? '撤回任务' : '取消任务')

/** 警示样式 — 与V1.1 WithdrawCancelModal.tsx line 40, 65 完全一致：
 *  V1.1 是 `text-blue-600 bg-blue-50` / `text-red-600 bg-red-50`（无 border-* 类）
 *  border-opacity-20 让继承的 border 颜色变浅 20% */
const alertClass = computed(() => {
  return isWithdraw.value
    ? 'text-blue-600 bg-blue-50 border-blue-200 border-opacity-20'
    : 'text-red-600 bg-red-50 border-red-200 border-opacity-20'
})

/** 获取状态标签 - 与V1.1 line 43-46 一致 */
const statusLabel = computed(() => {
  if (!props.task) return ''
  if (isWithdraw.value) return '待接受'
  return props.task.status === 'accepted' ? '已接受' : '处理中'
})

/** 提交 */
function handleSubmit() {
  if (reason.value.trim()) {
    props.onConfirm(reason.value)
    reason.value = ''
  }
}

/** 取消 */
function handleCancel() {
  reason.value = ''
  props.onClose()
}
</script>

<style scoped>
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  border-radius: 8px 8px 0 0;
}
/* 与V1.1 Modal.tsx line 265 完全一致：3段 emerald 渐变 */
.farm-modal-header {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  padding: 12px 24px;
  border-radius: 8px 8px 0 0;
}
/* 深度输入框样式 - 与V1.1 deepInputClass line 14 一致 */
:deep(.deep-input .el-textarea__inner) {
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
:deep(.deep-input .el-textarea__inner:focus) {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 0 0 2px rgba(16, 185, 129, 0.2);
}
/* 撤回确认按钮 - 与V1.1 buttonClass line 41 一致：bg-blue-500 hover:bg-blue-600 */
:deep(.withdraw-confirm-btn) {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}
:deep(.withdraw-confirm-btn:hover) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}
</style>

<template>
  <el-dialog
    :model-value="isOpen"
    width="600px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="onClose"
  >
    <template #header>
      <div class="farm-modal-header" :class="isWithdraw ? '' : 'cancel-header'">
        <span class="text-white text-lg font-semibold">{{ modalTitle }}</span>
      </div>
    </template>
    <div v-if="!task" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-5">
      <!-- 警示信息 -->
      <div :class="['flex items-start gap-3 p-4 rounded-lg border', alertClass]">
        <el-icon :size="20" :color="isWithdraw ? '#2563eb' : '#dc2626'"><WarningFilled /></el-icon>
        <div>
          <p class="font-medium">
            {{ isWithdraw ? '撤回后将取消该任务的派发，执行人将无法再接受此任务' : '取消后任务将终止，执行人将无法继续执行' }}
          </p>
          <p class="text-sm mt-1 opacity-80">
            此操作需要填写原因
          </p>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <p class="font-medium text-gray-900">{{ task.title }}</p>
        <div class="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
          <p>任务编号：{{ task.taskCode }}</p>
          <p>执行人：{{ task.assigneeName }}</p>
          <p>当前状态：{{ statusLabel }}</p>
          <p>派发人：{{ task.assignerName }}</p>
        </div>
      </div>

      <!-- 操作说明 -->
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

      <!-- 原因输入 -->
      <div>
        <label class="text-gray-700 text-sm mb-1 block">
          操作原因 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="reason"
          type="textarea"
          :rows="3"
          :placeholder="'请输入' + (isWithdraw ? '撤回' : '取消') + '原因...'"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-end pt-2">
        <el-button size="small" @click="handleCancel">
          取消
        </el-button>
        <el-button
          :type="isWithdraw ? 'primary' : 'danger'"
          size="small"
          :disabled="!reason.trim()"
          @click="handleSubmit"
        >
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
import { WarningFilled } from '@element-plus/icons-vue'

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

/** 警示样式 */
const alertClass = computed(() => {
  return isWithdraw.value
    ? 'text-blue-600 bg-blue-50 border-blue-200'
    : 'text-red-600 bg-red-50 border-red-200'
})

/** 获取状态标签 */
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
.farm-modal-header {
  background: linear-gradient(to right, #059669, #10b981);
  padding: 16px 24px;
  border-radius: 8px 8px 0 0;
}
/* 取消操作使用红色渐变 */
.farm-modal-header.cancel-header {
  background: linear-gradient(to right, #dc2626, #ef4444);
}
</style>

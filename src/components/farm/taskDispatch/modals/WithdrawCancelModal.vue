<template>
  <!-- 撤回/取消弹窗 - 从V1.1 WithdrawCancelModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    :title="isWithdraw ? '撤回任务' : '取消任务'" width="520px" top="5vh">
    <div v-if="task" class="space-y-5">
      <!-- 警示信息 -->
      <div class="flex items-start gap-3 p-4 rounded-lg border"
        :class="isWithdraw ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-red-600 bg-red-50 border-red-200'">
        <el-icon :size="20" class="flex-shrink-0 mt-0.5"><Warning /></el-icon>
        <div>
          <p class="font-medium">
            {{ isWithdraw ? '撤回后将取消该任务的派发，执行人将无法再接受此任务' : '取消后任务将终止，执行人将无法继续执行' }}
          </p>
          <p class="text-sm mt-1 opacity-80">此操作需要填写原因</p>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <p class="font-medium text-gray-900">{{ task.title || task.taskName }}</p>
        <div class="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
          <p>任务编号：{{ task.taskCode }}</p>
          <p>执行人：{{ task.assigneeName || task.assignee }}</p>
          <p>当前状态：{{ getStatusLabel() }}</p>
          <p>派发人：{{ task.assignerName || '-' }}</p>
        </div>
      </div>

      <!-- 操作说明 -->
      <div class="p-3 rounded-lg" :class="isWithdraw ? 'bg-blue-50' : 'bg-red-50'">
        <p class="text-sm font-medium mb-1">{{ isWithdraw ? '撤回操作' : '取消操作' }}适用于：</p>
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
        <span class="text-gray-700 mb-1 block font-medium">
          操作原因 <span class="text-red-500">*</span>
        </span>
        <el-input v-model="reason" type="textarea" :rows="3"
          :placeholder="`请输入${isWithdraw ? '撤回' : '取消'}原因...`" />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-end pt-2">
        <el-button @click="handleCancel">取消</el-button>
        <el-button :type="isWithdraw ? 'primary' : 'danger'"
          :disabled="!reason.trim()" @click="handleSubmit">
          确认{{ isWithdraw ? '撤回' : '取消' }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  type: { type: String, default: 'withdraw' },
})

const emit = defineEmits(['close', 'confirm'])

const reason = ref('')
const isWithdraw = computed(() => props.type === 'withdraw')

const getStatusLabel = () => {
  if (isWithdraw.value) return '待接受'
  return props.task?.status === 'accepted' ? '已接受' : '处理中'
}

const handleSubmit = () => {
  if (reason.value.trim()) {
    emit('confirm', reason.value)
    reason.value = ''
  }
}

const handleCancel = () => {
  reason.value = ''
  emit('close')
}
</script>

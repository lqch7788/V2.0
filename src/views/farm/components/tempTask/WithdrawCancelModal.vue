<!--
  WithdrawCancelModal.vue - 撤回/取消任务弹窗
  V1.1 TempTaskPage.tsx 中 WithdrawCancelModal 函数 1:1 迁移
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && handleClose()"
    :title="title"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="space-y-5">
      <div :class="['flex items-start gap-3 p-4 rounded-lg border', colorClass]">
        <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-medium">
            {{ isWithdraw ? '撤回后将取消该任务的派发，执行人将无法再接受此任务' : '取消后任务将终止，执行人将无法继续执行' }}
          </p>
          <p class="text-sm mt-1 opacity-80">此操作需要填写原因</p>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-3">
        <p class="font-medium text-gray-900">{{ task?.title }}</p>
        <div class="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
          <p>任务编号：{{ task?.taskCode }}</p>
          <p>执行人：{{ task?.assigneeName }}</p>
          <p>当前状态：{{ isWithdraw ? '待接受' : '处理中' }}</p>
          <p>派发人：{{ task?.assignerName }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          操作原因 <span class="text-red-500">*</span>
        </label>
        <textarea v-model="reason"
          :placeholder="`请输入${isWithdraw ? '撤回' : '取消'}原因...`"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <button type="button"
          class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
          @click="handleClose">取消</button>
        <button type="button"
          :disabled="!reason.trim()"
          :class="['px-3 py-1.5 rounded text-sm text-white disabled:opacity-50',
            isWithdraw ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600']"
          @click="handleSubmit">确认{{ title }}</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 撤回/取消任务弹窗
 * V1.1 TempTaskPage.tsx 中 WithdrawCancelModal 函数 1:1 迁移
 *
 * Props:
 *   isOpen / task / type ('withdraw' | 'cancel')
 *
 * Emits:
 *   close / confirm(reason)
 */
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  type: { type: String, default: 'withdraw' },
})

const emit = defineEmits(['close', 'confirm'])

const reason = ref('')

const isWithdraw = computed(() => props.type === 'withdraw')
const title = computed(() => isWithdraw.value ? '撤回任务' : '取消任务')
const colorClass = computed(() => isWithdraw.value ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-red-600 bg-red-50 border-red-200')

function handleSubmit() {
  if (!reason.value.trim()) return
  emit('confirm', reason.value)
  reason.value = ''
}

function handleClose() {
  reason.value = ''
  emit('close')
}
</script>
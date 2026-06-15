<template>
  <el-dialog
    :model-value="isOpen"
    title="拒绝任务"
    width="500px"
    :show-close="true"
    @close="onClose"
  >
    <div class="space-y-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="text-sm text-red-800">
          拒绝任务后，该问题将重新回到"待分派"状态。
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          拒绝原因 <span class="text-red-500">*</span>
        </label>
        <textarea
          :value="rejectReason"
          rows="3"
          placeholder="请输入拒绝原因..."
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="setRejectReason($event.target.value)"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
          @click="onClose"
        >
          <el-icon class="w-4 h-4"><Close /></el-icon>
          取消
        </button>
        <button
          :disabled="!rejectReason.trim()"
          :class="[
            'flex items-center gap-1 px-3 py-1.5 rounded text-sm text-white transition-colors',
            rejectReason.trim()
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gray-300 cursor-not-allowed'
          ]"
          @click="onConfirm"
        >
          <el-icon class="w-4 h-4"><Check /></el-icon>
          确认拒绝
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 拒绝原因弹窗组件
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/TaskRejectModal.tsx
 */
import { Close, Check } from '@element-plus/icons-vue'

defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  task: { type: Object, default: null },
  rejectReason: { type: String, required: true },
  setRejectReason: { type: Function, required: true },
  onConfirm: { type: Function, required: true },
})
</script>
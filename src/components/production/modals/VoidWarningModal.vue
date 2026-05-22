<template>
  <el-dialog
    v-model="visible"
    width="420px"
    :show-close="false"
    align-center
    append-to-body
    class="void-warning-dialog"
  >
    <div class="p-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">作废生产计划警告</h3>
        </div>
      </div>
      <div class="text-sm text-gray-600 space-y-3 mb-6">
        <p>作废生产计划后可能存在以下风险：</p>
        <ul class="list-disc list-inside space-y-1.5">
          <li>可能影响后续计划的执行</li>
          <li>系统中无法使用该生产计划</li>
          <li>造成生产计划无法追溯</li>
          <li>已关联的任务和记录可能失效</li>
        </ul>
        <p class="font-medium text-gray-700">请谨慎操作，确认要申请作废吗？</p>
      </div>
      <div class="flex gap-3">
        <button class="flex-1 h-9 px-4 rounded-md text-sm inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors" @click="handleClose">取消</button>
        <button class="flex-1 h-9 px-4 rounded-md text-sm inline-flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 transition-colors" @click="handleConfirm">确认作废</button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function handleClose() {
  visible.value = false
}

function handleConfirm() {
  emit('confirm')
  visible.value = false
}
</script>

<style scoped>
.void-warning-dialog :deep(.el-dialog__header) {
  display: none;
}
.void-warning-dialog :deep(.el-dialog__body) {
  padding: 0;
}
</style>

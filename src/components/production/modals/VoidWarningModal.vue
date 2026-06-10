<template>
  <!-- 作废生产计划警告弹窗 - 统一使用 ElModal（统一800） -->
  <ElModal
    :model-value="modelValue"
    title="作废生产计划警告"
    :width="1600"
    :height="900"
    
    @update:model-value="(v) => emit('update:modelValue', v)"
    @close="handleClose"
  >
    <div class="p-2">
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
        <button :class="btnSecondary + ' flex-1 h-9'" @click="handleClose">取消</button>
        <button :class="btnDefault + ' flex-1 h-9 !bg-amber-500 hover:!bg-amber-600'" @click="handleConfirm">确认作废</button>
      </div>
    </div>
  </ElModal>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import { btnSecondary, btnDefault } from '@/views/production/constants/buttonStyles'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

function handleClose() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

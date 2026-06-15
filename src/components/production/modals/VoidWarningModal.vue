<template>
  <!--
    作废生产计划警告弹窗 - 1:1 翻译 V1.1 VoidWarningModal.tsx
    V1.1 是 max-w-md 原生小确认弹窗（非 ElModal）
  -->
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-xl w-full max-w-md shadow-xl">
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
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="handleClose"
          >
            <X class="w-4 h-4" /> 取消
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600"
            @click="handleConfirm"
          >
            <XCircle class="w-4 h-4" /> 确认作废
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, X, XCircle } from 'lucide-vue-next'

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

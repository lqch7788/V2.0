<template>
  <ElModal
    :model-value="modelValue"
    title="选择导出格式"
    size="md"
    :show-maximize="false"
    :show-submit="false"
    @close="handleClose"
  >
    <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
    <div class="space-y-3">
      <label
        v-for="format in exportFormats"
        :key="format.value"
        class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
        :class="localFormat === format.value
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-300 hover:border-gray-400'"
      >
        <input
          v-model="localFormat"
          type="radio"
          name="exportFormat"
          :value="format.value"
          class="w-4 h-4 text-emerald-600 border-gray-300"
        />
        <div class="ml-3">
          <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
          <span class="block text-xs text-gray-500">{{ format.desc }}</span>
        </div>
      </label>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleClose">取消</button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleConfirm">导出</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElModal } from '@/components/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  exportFormat: { type: String, default: 'excel' },
  selectedCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'update:exportFormat', 'confirm'])

const localFormat = ref(props.exportFormat || 'excel')

watch(() => props.exportFormat, (val) => {
  localFormat.value = val || 'excel'
})

watch(localFormat, (val) => {
  emit('update:exportFormat', val)
})

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
]

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

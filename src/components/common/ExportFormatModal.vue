<!--
  通用导出格式选择弹窗（重写 - 对齐 V1.1 ExportFormatModal.tsx）
-->
<template>
  <SimpleModal
    :visible="visible"
    title="选择导出格式"
    width="450px"
    submit-text="确认导出"
    @close="$emit('close')"
    @submit="$emit('confirm')"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="fmt in formats"
            :key="fmt.value"
            type="button"
            :class="['p-3 border rounded-lg text-center text-sm transition-colors',
              (exportFileType || exportFormat) === fmt.value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 hover:border-gray-400']"
            @click="$emit('update:export-file-type', fmt.value); $emit('update:export-format', fmt.value)"
          >
            {{ fmt.label }}
          </button>
        </div>
      </div>
      <div class="text-sm text-gray-500">已选择 {{ selectedCount }} 条记录</div>
    </div>
  </SimpleModal>
</template>

<script setup>
import SimpleModal from './SimpleModal.vue'

defineProps({
  visible: Boolean,
  exportFormat: { type: String, default: 'excel' },
  exportFileType: { type: String, default: '' },
  selectedCount: { type: Number, default: 0 }
})

defineEmits(['close', 'confirm', 'update:export-file-type', 'update:export-format'])

const formats = [
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'word', label: 'Word (.docx)' },
  { value: 'pdf', label: 'PDF (.pdf)' }
]
</script>

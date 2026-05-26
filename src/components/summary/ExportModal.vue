<template>
  <!-- 导出格式选择弹窗 - 与V1.1 ExportModal 完全一致 -->
  <el-dialog
    v-model="visible"
    title="选择导出格式"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
    <div class="space-y-3">
      <label
        v-for="format in EXPORT_FORMATS"
        :key="format.value"
        :class="[
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === format.value
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-gray-400'
        ]"
        @click="$emit('update:exportFormat', format.value)"
      >
        <div
          :class="[
            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
            exportFormat === format.value ? 'border-emerald-600' : 'border-gray-400'
          ]"
        >
          <div v-if="exportFormat === format.value" class="w-2 h-2 rounded-full bg-emerald-600" />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
          <p class="text-xs text-gray-500">{{ format.desc }}</p>
        </div>
      </label>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">导出</el-button>
    </template>
  </el-dialog>
</template>

<script>
// 导出格式选项（与V1.1 types.ts EXPORT_FORMATS 完全一致）
export const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
  { value: 'excel_with_attachments', label: 'Excel+附件 (.zip)', desc: '包含照片等附件，适合需要原始证据的场景' }
]
</script>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  exportFormat: { type: String, default: 'excel' }
})

const emit = defineEmits(['update:modelValue', 'update:exportFormat', 'confirm', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function handleClose() {
  emit('close')
  visible.value = false
}

function handleConfirm() {
  emit('confirm')
}
</script>

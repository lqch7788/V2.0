<!--
  ExportFormatModal.vue - 导出格式选择弹窗
  V1.1 ExportFormatModal 内联版 1:1 迁移
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('update:isOpen', false)"
    title="选择导出格式"
    width="560px"
    destroy-on-close
  >
    <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
    <div class="space-y-3">
      <div
        v-for="fmt in FORMATS"
        :key="fmt.value"
        :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400']"
        @click="emit('format-change', fmt.value)"
      >
        <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          exportFormat === fmt.value ? 'border-emerald-600' : 'border-gray-400']">
          <div v-if="exportFormat === fmt.value" class="w-2 h-2 rounded-full bg-emerald-600" />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">{{ fmt.label }}</p>
          <p class="text-xs text-gray-500">{{ fmt.desc }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:isOpen', false)">取消</el-button>
      <el-button type="primary" @click="emit('confirm')">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
]

defineProps({
  isOpen: { type: Boolean, default: false },
  exportFormat: { type: String, default: 'excel' },
  selectedCount: { type: Number, default: 0 },
})
const emit = defineEmits(['update:isOpen', 'format-change', 'confirm'])
</script>
<!--
  ExportFormatModal.vue - 导出格式选择弹窗
  V1.1 TempTaskPage.tsx 中 ExportFormatModal 函数 1:1 迁移
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('close')"
    title="选择导出格式"
    width="480px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
    <div class="space-y-3">
      <label v-for="format in exportFormats" :key="format.value"
        :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === format.value
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-gray-400']"
        @click.prevent="emit('format-change', format.value)">
        <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          exportFormat === format.value ? 'border-emerald-600' : 'border-gray-400']">
          <div v-if="exportFormat === format.value" class="w-2 h-2 rounded-full bg-emerald-600" />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
          <p class="text-xs text-gray-500">{{ format.desc }}</p>
        </div>
      </label>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <button type="button"
          class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
          @click="emit('close')">取消</button>
        <button type="button"
          class="px-3 py-1.5 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700"
          @click="emit('confirm')">导出</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  exportFormat: { type: String, default: 'excel' },
  selectedCount: { type: Number, default: 0 },
})
defineEmits(['close', 'confirm', 'format-change'])

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
]
</script>
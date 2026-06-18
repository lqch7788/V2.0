<!--
  ScheduleExportFormatModal.vue - 导出格式选择弹窗
  V1.1 ExportFormatModal.tsx 1:1 对齐：3 格式（excel/csv/word）
-->
<template>
  <el-dialog :model-value="isOpen" @update:model-value="(v) => !v && emit('close')" title="选择导出格式" width="400px">
    <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
    <div class="space-y-3">
      <div
        v-for="format in exportFormats"
        :key="format.value"
        :class="[
          'p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === format.value
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-gray-300'
        ]"
        @click="emit('updateFormat', format.value)"
      >
        <div class="flex items-center">
          <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0', exportFormat === format.value ? 'border-emerald-600' : 'border-gray-300']">
            <div v-if="exportFormat === format.value" class="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
            <p class="text-xs text-gray-500">{{ format.desc }}</p>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="emit('confirm')">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  exportFormat: { type: String, default: 'excel' },
  exportFormats: { type: Array, default: () => [] },
})

defineEmits(['close', 'confirm', 'updateFormat'])
</script>

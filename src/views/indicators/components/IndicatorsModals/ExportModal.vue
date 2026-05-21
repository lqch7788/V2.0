<template>
  <!-- 指标导出弹窗组件 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="handleClose"
    title="选择导出格式"
    width="500px"
    :close-on-click-modal="false"
    class="indicator-export-modal"
  >
    <div class="space-y-3 px-4">
      <p class="text-gray-600 text-sm mb-4">
        确认导出 <span class="text-blue-600 font-medium">{{ exportCount }}</span> 条数据
      </p>

      <div
        v-for="format in formats"
        :key="format.value"
        :class="[exportFormat === format.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400', 'flex items-center p-4 border rounded-lg cursor-pointer transition-all']"
        @click="handleFormatChange(format.value)"
      >
        <el-radio
          :model-value="exportFormat"
          :value="format.value"
          class="mr-3"
        />
        <div>
          <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
          <span class="block text-xs text-gray-500">{{ format.desc }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">导出</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  selectedCount: Number,
  totalCount: Number,
  exportFormat: String
})

const emit = defineEmits(['close', 'formatChange', 'confirm'])

// 导出格式选项
const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 导出数量
const exportCount = props.selectedCount > 0 ? props.selectedCount : props.totalCount

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 格式变化
const handleFormatChange = (format) => {
  emit('formatChange', format)
}

// 确认导出
const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.indicator-export-modal .el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669);
  color: white;
  margin: 0;
  padding: 16px 20px;
}

:deep(.indicator-export-modal .el-dialog__title) {
  color: white;
}

:deep(.indicator-export-modal .el-dialog__close) {
  color: white;
}
</style>

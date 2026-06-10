<template>
  <!-- ✅ 修复: 统一改为 ElModal 风格（V1.1 size="md" 500×400 1:1 对齐）
       原实现是纯 div 自定义弹窗（z-index 100、max-w 450px），与项目其他页面不一致 -->
  <ElModal
    :model-value="visible"
    title="选择导出格式"
    :width="500"
    :height="400"

    @update:model-value="(v) => !v && handleClose()"
    @close="handleClose"
  >
    <div class="space-y-3">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
      <div
        v-for="format in exportFormats"
        :key="format.value"
        @click="handleFormatChange(format.value)"
        :class="[
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          currentFormat === format.value
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-400 hover:border-gray-400'
        ]"
      >
        <el-radio
          :model-value="currentFormat"
          :value="format.value"
          @change="handleFormatChange(format.value)"
        >
          &nbsp;
        </el-radio>
        <div class="ml-3">
          <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
          <span class="block text-xs text-gray-500">{{ format.desc }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" @click="handleConfirm">导出</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElModal } from '@/components/ui'

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

const props = defineProps({
  visible: Boolean,
  exportFileType: {
    type: String,
    default: 'excel'
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'update:exportFileType'])

const currentFormat = ref(props.exportFileType || 'excel')

watch(() => props.exportFileType, (val) => {
  if (val) {
    currentFormat.value = val
  }
})

const handleFormatChange = (format) => {
  currentFormat.value = format
  emit('update:exportFileType', format)
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

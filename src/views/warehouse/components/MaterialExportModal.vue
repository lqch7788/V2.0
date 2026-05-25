<template>
  <!-- 导出格式选择弹窗 - 对应V1.1 MaterialExportModal.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="选择导出格式"
    width="500px"
    :close-on-click-modal="true"
  >
    <div class="space-y-3">
      <div
        v-for="format in formats"
        :key="format.value"
        :class="[
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === format.value
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-400 hover:border-gray-400'
        ]"
        @click="handleFormatChange(format.value)"
      >
        <el-radio
          v-model="localExportFormat"
          :value="format.value"
          @change="handleFormatChange(format.value)"
        >
          <div class="ml-3">
            <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
            <span class="block text-xs text-gray-500">{{ format.desc }}</span>
          </div>
        </el-radio>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleExport">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

/**
 * 导出格式选择弹窗组件
 * 提供Excel、CSV、Word等导出格式选择
 */

const props = defineProps({
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  },
  // 已选择的数量
  selectedCount: {
    type: Number,
    default: 0
  },
  // 当前选中的格式
  exportFormat: {
    type: String,
    default: 'xlsx'
  }
})

const emit = defineEmits(['close', 'formatChange', 'export'])

const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

const localExportFormat = ref(props.exportFormat)

watch(() => props.exportFormat, (val) => {
  localExportFormat.value = val
})

const dialogVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

const handleFormatChange = (format) => {
  localExportFormat.value = format
  emit('formatChange', format)
}

const handleClose = () => {
  emit('close')
}

const handleExport = () => {
  emit('export')
}
</script>

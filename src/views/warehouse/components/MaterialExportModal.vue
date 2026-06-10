<template>
  <!-- ✅ 修复: 统一改为 ElModal 风格（V1.1 size="md" 500×400 1:1 对齐）
       原 el-dialog 是 Element Plus 原生，缺"已选择 X 条数据"提示，与项目规范不一致 -->
  <ElModal
    :model-value="isOpen"
    title="选择导出格式"
    :width="500"
    :height="400"

    @update:model-value="(v) => !v && handleClose()"
    @close="handleClose"
  >
    <div class="space-y-3">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
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
        <el-button type="primary" size="small" @click="handleExport">导出</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElModal } from '@/components/ui'

/**
 * 导出格式选择弹窗组件
 * 提供Excel、CSV、Word等导出格式选择
 * 1:1 对齐 V1.1 ExportFormatModal.tsx 风格
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
    default: 'excel'
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

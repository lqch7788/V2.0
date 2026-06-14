<template>
  <ElModal
    :model-value="show"
    title="选择导出格式"
    :width="500"
    :height="450"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <div class="space-y-3">
      <div
        v-for="format in formats"
        :key="format.value"
        :class="[
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFileType === format.value
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-gray-400'
        ]"
        @click="handleChange(format.value)"
      >
        <div
          :class="[
            'w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3',
            exportFileType === format.value ? 'border-green-500' : 'border-gray-400'
          ]"
        >
          <div
            v-if="exportFileType === format.value"
            class="w-2 h-2 rounded-full bg-green-500"
          />
        </div>
        <div>
          <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
          <span class="block text-xs text-gray-500">{{ format.desc }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button size="small" type="primary" @click="handleConfirm">确认导出</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  exportFileType: { type: String, default: 'xlsx' }
})

const emit = defineEmits(['close', 'change', 'confirm'])

const formats = [
  { value: 'xlsx', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

const handleClose = () => emit('close')

const handleChange = (value) => {
  emit('change', value)
}

const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

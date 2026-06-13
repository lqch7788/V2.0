<template>
  <!-- 导出格式选择弹窗 - 1:1 对齐 V1.1 ExportFormatModal.tsx 风格 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
    <div class="bg-white rounded-xl w-full max-w-lg shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between rounded-t-xl">
        <h3 class="text-lg font-semibold">选择导出格式</h3>
        <button @click="handleClose" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- 弹窗内容 -->
      <div class="p-6">
        <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
        <div class="space-y-3">
          <label
            v-for="format in formats"
            :key="format.value"
            :class="[
              'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
              exportFormat === format.value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-400'
            ]"
            @click="handleFormatChange(format.value)"
          >
            <input
              type="radio"
              :value="format.value"
              :checked="exportFormat === format.value"
              @change="handleFormatChange(format.value)"
              class="w-4 h-4 text-emerald-600 border-gray-400"
            />
            <div class="ml-3">
              <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
              <span class="block text-xs text-gray-500">{{ format.desc }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleClose">取消</button>
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700" @click="handleExport">导出</button>
      </div>
    </div>
  </div>
</template>

<script setup>
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

const handleFormatChange = (format) => {
  emit('formatChange', format)
}

const handleClose = () => {
  emit('close')
}

const handleExport = () => {
  emit('export')
}
</script>

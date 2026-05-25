<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[450px] overflow-hidden">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">选择导出格式</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="p-6">
        <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
        <div class="space-y-3">
          <div
            v-for="format in exportFormats"
            :key="format.value"
            @click="handleFormatChange(format.value)"
            :class="[
              'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
              currentFormat === format.value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-gray-400'
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
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">导出</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'

const exportFormats = [
  { value: 'excel', label: 'Excel (.xls)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.doc)', desc: '适用于文档编辑' }
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

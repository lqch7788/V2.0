<template>
  <!-- 指标导出弹窗组件 - V1.1原生div样式 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
    <div class="bg-white rounded-lg w-full max-w-md shadow-2xl" @click.stop>
      <!-- 头部 - V1.1绿色渐变标题栏 -->
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex items-center justify-between">
        <h3 class="font-semibold flex items-center gap-2">
          <el-icon :size="20"><Download /></el-icon>
          选择导出格式
        </h3>
        <el-button
          variant="text"
          :icon="Close"
          @click="handleClose"
          class="text-white/80 hover:text-white"
        />
      </div>

      <!-- 内容区域 -->
      <div class="p-6">
        <div class="space-y-3">
          <!-- 导出数量提示 -->
          <p class="text-gray-600 text-sm mb-4">
            确认导出 <span class="text-blue-600 font-medium">{{ exportCount }}</span> 条数据
          </p>

          <!-- 导出格式选项 -->
          <div
            v-for="format in formats"
            :key="format.value"
            :class="[
              exportFormat === format.value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-gray-400'
            ]"
            class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
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
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button size="small" type="primary" @click="handleConfirm">导出</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Download, Close } from '@element-plus/icons-vue'

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
/* V1.1原生div弹窗，绿色渐变标题栏 */
</style>

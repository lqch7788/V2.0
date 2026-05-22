<template>
  <!-- 公告导出弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div class="bg-white rounded-lg w-full max-w-lg shadow-2xl" @click.stop>
        <!-- 头部 — 绿色渐变（两色渐变，直接定义的弹窗无rounded类） -->
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between" style="background: linear-gradient(to right, #10b981, #059669);">
          <h3 class="font-semibold flex items-center gap-2" style="color: white;">
            <el-icon style="color: white;"><Download /></el-icon>
            <span style="color: white;">选择导出格式</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容 -->
        <div class="p-6">
          <div class="space-y-3">
            <p class="text-gray-600 text-sm mb-2">
              确认导出 <span class="text-blue-600 font-medium">{{ exportCount }}</span> 条数据
            </p>
            <div
              v-for="format in formats"
              :key="format.value"
              :class="[
                'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
                selectedFormat === format.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 hover:border-gray-400'
              ]"
              @click="handleFormatChange(format.value)"
            >
              <el-radio
                :model-value="selectedFormat === format.value"
                :label="format.value"
                @change="handleFormatChange(format.value)"
              >
                <div class="ml-3">
                  <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
                  <span class="block text-xs text-gray-500">{{ format.desc }}</span>
                </div>
              </el-radio>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button type="primary" size="small" @click="handleConfirm">导出</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  exportFormat: String,
  selectedCount: Number,
  totalCount: Number
})

const emit = defineEmits(['close', 'formatChange', 'confirm'])

// 导出数量
const exportCount = computed(() => {
  return props.selectedCount > 0 ? props.selectedCount : props.totalCount
})

// 选中格式
const selectedFormat = ref(props.exportFormat || 'excel')

// 格式选项
const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 格式变化
const handleFormatChange = (val) => {
  selectedFormat.value = val
  emit('formatChange', val)
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 确认
const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>

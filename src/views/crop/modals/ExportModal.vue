<template>
  <!-- 订单导出弹窗组件 - V1.1 ExportFormatModal 1:1 翻译（修复轮 10 P0-001/002 + 轮 8 P0-I2-1） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div class="bg-white rounded-xl w-full max-w-lg shadow-xl" @click.stop>
        <!-- 头部 — 绿色渐变（与 V1.1 Modal.tsx L265 一致） -->
        <div class="px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-between rounded-t-xl">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2 select-none">
            <span>选择导出格式</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose" @mousedown.stop>
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容 -->
        <div class="p-6">
          <div class="space-y-3">
            <p class="text-sm text-gray-500 mb-4">
              已选择 {{ exportCount }} 条数据
            </p>
            <div
              v-for="format in formats"
              :key="format.value"
              :class="[
                'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
                selectedFormat === format.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-400 hover:border-gray-400'
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
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose" @mousedown.stop>取消</el-button>
          <el-button type="primary" size="small" @click="handleConfirm" @mousedown.stop>导出</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Download, Close } from '@element-plus/icons-vue'

// 修复轮 10 P0-001：prop 名 exportFileType（与 Order.vue L354 `:export-file-type="exportFormat"` 一致）
const props = defineProps({
  isOpen: Boolean,
  exportFileType: String,
  selectedCount: Number
})

const emit = defineEmits(['close', 'change', 'confirm'])

// 导出数量
const exportCount = computed(() => {
  return props.selectedCount || 0
})

// 选中格式（修复轮 10 P0-001：引用正确的 prop 名 exportFileType；与 V1.1 ExportFormatModal.tsx L32 default 'excel' 一致）
const selectedFormat = ref(props.exportFileType || 'excel')

// 监听 prop 变化
watch(() => props.exportFileType, (val) => {
  if (val) selectedFormat.value = val
})

// 修复轮 10 P0-002：value 改为 'excel'/'csv'/'word' 与 V1.1 ExportFormatModal.tsx L15-19 exportFormats 1:1 对齐
const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 格式变化
const handleFormatChange = (val) => {
  selectedFormat.value = val
  emit('change', val)
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 确认
const handleConfirm = () => {
  emit('confirm', selectedFormat.value)
  handleClose()
}

// ESC 键关闭弹窗（修复轮 8 P0-I2-1：与 V1.1 Modal.tsx L97-105 通用行为一致）
const handleEscKey = (e) => {
  if (e.key === 'Escape' && props.isOpen) handleClose()
}
onMounted(() => document.addEventListener('keydown', handleEscKey))
onUnmounted(() => document.removeEventListener('keydown', handleEscKey))
</script>

<style scoped>
/* V1.1样式保持 */
</style>

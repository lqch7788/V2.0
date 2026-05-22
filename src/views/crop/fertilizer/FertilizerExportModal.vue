<template>
  <!-- 施肥管理导出格式选择弹窗组件（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleClose">
      <div
        class="bg-white rounded-xl w-full max-w-md shadow-xl"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 flex items-center justify-between rounded-t-xl"
          style="background: linear-gradient(to right, #10b981, #059669, #10b981);"
        >
          <h3 class="font-semibold flex items-center gap-2">
            <el-icon class="text-xl" style="color: white;"><Download /></el-icon>
            <span style="color: white;">导出格式选择</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容 -->
        <div class="p-6">
          <p class="text-sm text-gray-500 mb-4">
            已选择 <span class="font-semibold text-emerald-600">{{ selectedCount }}</span> 条记录
          </p>
          <div class="space-y-3">
            <div
              v-for="format in formats"
              :key="format.key"
              :class="[
                'p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3',
                selectedFormat === format.key ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
              ]"
              @click="handleFormatChange(format.key)"
            >
              <div :class="selectedFormat === format.key ? 'text-emerald-600' : 'text-gray-400'">
                <component :is="format.icon" class="w-8 h-8" />
              </div>
              <div>
                <div class="font-medium text-sm text-gray-800">{{ format.label }}</div>
                <div class="text-xs text-gray-500">{{ format.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button type="primary" size="small" @click="handleConfirm">确认导出</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { Download, Close, Document, Folder, Files } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'confirm', 'formatChange'])

// 选中格式
const selectedFormat = ref('xlsx')

// 格式选项
const formats = [
  { key: 'csv', label: 'CSV', desc: '逗号分隔文本，通用性最好', icon: Document },
  { key: 'xlsx', label: 'Excel', desc: 'Microsoft Excel 表格格式', icon: Files },
  { key: 'word', label: 'Word', desc: '可直接打印的文档格式', icon: Folder }
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
  emit('confirm', selectedFormat.value)
  handleClose()
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>

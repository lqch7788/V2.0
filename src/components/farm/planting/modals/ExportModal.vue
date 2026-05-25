<template>
  <!-- 导出格式选择弹窗 - 与V1.1 ExportFormatModal.tsx完全一致 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-md shadow-xl">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Download /></el-icon>
          导出数据
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div class="p-6">
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-4">
            已选择 <span class="text-emerald-600 font-medium">{{ selectedCount }}</span> 条数据
          </p>
        </div>

        <div>
          <label class="block text-gray-700 text-sm mb-3 font-medium">导出格式</label>
          <div class="space-y-2">
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors" :class="{ 'border-emerald-500 bg-emerald-50': exportFormat === 'xlsx' }">
              <el-radio v-model="exportFormat" value="xlsx">
                <span class="text-sm">Excel (.xlsx)</span>
              </el-radio>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors" :class="{ 'border-emerald-500 bg-emerald-50': exportFormat === 'csv' }">
              <el-radio v-model="exportFormat" value="csv">
                <span class="text-sm">CSV (.csv)</span>
              </el-radio>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors" :class="{ 'border-emerald-500 bg-emerald-50': exportFormat === 'word' }">
              <el-radio v-model="exportFormat" value="word">
                <span class="text-sm">Word (.docx)</span>
              </el-radio>
            </label>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Download, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  selectedCount: {
    type: Number,
    default: 0
  },
  exportFileType: {
    type: String,
    default: 'xlsx'
  }
})

const emit = defineEmits(['close', 'confirm', 'update:exportFileType'])

const exportFormat = ref('xlsx')

watch(() => props.isOpen, (val) => {
  if (val) {
    exportFormat.value = props.exportFileType || 'xlsx'
  }
})

watch(() => props.exportFileType, (val) => {
  exportFormat.value = val || 'xlsx'
})

const onClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('update:exportFileType', exportFormat.value)
  emit('confirm', exportFormat.value)
}
</script>

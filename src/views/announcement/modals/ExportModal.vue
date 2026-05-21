<template>
  <!-- 公告导出弹窗 -->
  <el-dialog
    :model-value="visible"
    title="选择导出格式"
    :close-on-click-modal="false"
    width="500px"
  >
    <div class="space-y-3">
      <p class="text-gray-600 text-sm mb-2">
        确认导出 <span class="text-blue-600 font-medium">{{ exportCount }}</span> 条数据
      </p>
      <el-radio-group v-model="selectedFormat" class="flex flex-col gap-2">
        <el-radio
          v-for="format in formats"
          :key="format.value"
          :value="format.value"
          :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all', selectedFormat === format.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400']"
        >
          <div class="ml-3">
            <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
            <span class="block text-xs text-gray-500">{{ format.desc }}</span>
          </div>
        </el-radio>
      </el-radio-group>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" @click="handleConfirm">导出</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import {  Notice  } from '@/types/announcement'

// Props 定义

const props = defineProps({})

// Emits 定义
const emit = defineEmits(['update'])

// 双向绑定
const visible = computed({
  get() {
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

// 导出数量
const exportCount = computed(() => {
  return props.selectedCount > 0 ? props.selectedCount : props.totalCount
})

// 选中格式
const selectedFormat = ref(props.exportFormat)

// 格式选项
const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 监听选中格式变化
const handleFormatChange = (val) => {
  selectedFormat.value = val
  emit('update:exportFormat', val)
}

// 关闭
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 确认
const handleConfirm = () => {
  emit('update:exportFormat', selectedFormat.value)
  emit('confirm')
  handleClose()
}
</script>

<style scoped>
/* V1.1 样式保持 */
</style>

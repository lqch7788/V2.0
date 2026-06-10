<template>
  <!-- 订单导出弹窗 - 与 V1.1 通用 ExportFormatModal 1:1 翻译（500×400） -->
  <ElModal
    :model-value="isOpen"
    title="选择导出格式"
    :width="500"
    :height="400"
    @update:model-value="(v) => emit('update:isOpen', v)"
    @close="handleClose"
  >
    <!-- 内容 -->
    <div class="space-y-3">
      <p class="text-sm text-gray-500 mb-4">
        已选择 {{ exportCount }} 条数据
      </p>
      <el-radio-group v-model="selectedFormat" class="w-full !flex !flex-col gap-3">
        <label
          v-for="format in formats"
          :key="format.value"
          :class="[
            'flex items-center p-4 border rounded-lg cursor-pointer transition-all w-full',
            selectedFormat === format.value
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-400 hover:border-gray-500'
          ]"
        >
          <el-radio :value="format.value" class="!flex !items-center !m-0">
            <div class="ml-2">
              <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
              <span class="block text-xs text-gray-500">{{ format.desc }}</span>
            </div>
          </el-radio>
        </label>
      </el-radio-group>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" @click="handleConfirm">导出</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElModal } from '@/components/ui'

// prop 名 exportFileType（与 Order.vue `:export-file-type="exportFormat"` 一致）
const props = defineProps({
  isOpen: Boolean,
  exportFileType: String,
  selectedCount: Number
})

const emit = defineEmits(['close', 'change', 'confirm', 'update:isOpen'])

// 导出数量
const exportCount = computed(() => props.selectedCount || 0)

// 选中格式 - 用 ref 真正支持内部修改 + emit('change') 通知父组件（修复 P0-9）
const selectedFormat = ref(props.exportFileType || 'excel')

// 父 prop 变化时同步内部 ref（修复 P0-9 真双向）
watch(() => props.exportFileType, (val) => {
  if (val && val !== selectedFormat.value) selectedFormat.value = val
})

// 内部 ref 变化时 emit 给父组件
watch(selectedFormat, (val) => {
  emit('change', val)
})

// 与 V1.1 通用 ExportFormatModal.tsx L15-19 exportFormats 1:1
const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 关闭
const handleClose = () => {
  emit('update:isOpen', false)
  emit('close')
}

// 确认
const handleConfirm = () => {
  emit('confirm', selectedFormat.value)
  handleClose()
}
</script>

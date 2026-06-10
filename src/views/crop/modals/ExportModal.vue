<template>
  <!-- 订单导出弹窗 - 统一使用 ElModal（统一800） -->
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

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" @click="handleConfirm">导出</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { computed, watch } from 'vue'
import { ElModal } from '@/components/ui'

// 修复轮 10 P0-001：prop 名 exportFileType（与 Order.vue L354 `:export-file-type="exportFormat"` 一致）
const props = defineProps({
  isOpen: Boolean,
  exportFileType: String,
  selectedCount: Number
})

const emit = defineEmits(['close', 'change', 'confirm', 'update:isOpen'])

// 导出数量
const exportCount = computed(() => {
  return props.selectedCount || 0
})

// 选中格式（修复轮 10 P0-001：引用正确的 prop 名 exportFileType；与 V1.1 ExportFormatModal.tsx L32 default 'excel' 一致）
const selectedFormat = computed({
  get: () => props.exportFileType || 'excel',
  set: (v) => {
    /* 内部用 prop 默认值即可 */
  }
})

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
  emit('update:isOpen', false)
  emit('close')
}

// 确认
const handleConfirm = () => {
  emit('confirm', selectedFormat.value)
  handleClose()
}
</script>

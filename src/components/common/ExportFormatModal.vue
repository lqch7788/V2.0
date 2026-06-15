<!--
  通用导出格式选择弹窗
  1:1 翻译自 V1.1 src/components/common/ExportFormatModal.tsx（83 行）
  - props: visible (Boolean) / exportFormat (String) / exportFileType (String) / selectedCount (Number)
  - emits: update:visible / confirm / update:exportFileType / update:exportFormat / change
  修复项：
  1. 补齐 Word (.docx) 格式选项（V1.1 三个，V2.0 缺一）（P0）
  2. props 兼容 exportFormat / exportFileType 双字段名（P0）
  3. 未选态边框 border-gray-200 → border-gray-400（P1）
-->
<template>
  <!-- ✅ 修复: 统一改为 ElModal 风格（V1.1 size="md" 500×400 1:1 对齐）
       原实现是纯 div 自定义弹窗（z-index 100、max-w 450px），与项目其他页面不一致 -->
  <ElModal
    :model-value="visible"
    title="选择导出格式"
    :width="500"
    @update:model-value="(v) => !v && handleClose()"
    @close="handleClose"
  >
    <div class="space-y-3">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedCount }} 条数据</p>
      <!-- V1.1: 原生 radio input + 整个 label 可点击 -->
      <label
        v-for="format in exportFormats"
        :key="format.value"
        class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
        :class="currentFormat === format.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-400 hover:border-gray-400'"
      >
        <input
          type="radio"
          name="exportFormat"
          :value="format.value"
          :checked="currentFormat === format.value"
          @change="handleFormatChange(format.value)"
          class="w-4 h-4 text-emerald-600 border-gray-400 focus:ring-emerald-500"
        />
        <div class="ml-3">
          <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
          <span class="block text-xs text-gray-500">{{ format.desc }}</span>
        </div>
      </label>
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
import { ref, watch } from 'vue'
import { ElModal } from '@/components/ui'

// V1.1 三种格式（Excel/CSV/Word，与 V1.1 exportFormats 完全一致）
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
]

// 兼容 V1.1 exportFormat / exportFileType 双字段名
const props = defineProps({
  visible: { type: Boolean, default: false },
  exportFormat: { type: String, default: '' },
  exportFileType: { type: String, default: 'excel' },
  selectedCount: { type: Number, default: 0 },
})

const emit = defineEmits([
  'update:visible',
  'confirm',
  'update:exportFileType',
  'update:exportFormat',
  'change',
])

// 优先使用 exportFormat，其次 exportFileType（与 V1.1 currentFormat 逻辑一致）
const currentFormat = ref(props.exportFormat || props.exportFileType || 'excel')

watch(
  () => [props.exportFormat, props.exportFileType],
  ([fmt1, fmt2]) => {
    if (fmt1) currentFormat.value = fmt1
    else if (fmt2) currentFormat.value = fmt2
  }
)

const handleFormatChange = (format) => {
  currentFormat.value = format
  // 同时 emit 两个字段名（兼容 V1.1 两种调用方式）
  emit('update:exportFileType', format)
  emit('update:exportFormat', format)
  emit('change', format)
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

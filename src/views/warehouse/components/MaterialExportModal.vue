<template>
  <!-- 导出格式选择弹窗 - 严格对齐 V1.1 MaterialExportModal.tsx -->
  <!-- V1.1: UnifiedModal size="md" (500×400),showFooter=true,3个 radio 选项(Excel/CSV/Word),showMaximize/drag/resize=false -->
  <UnifiedModal
    :model-value="isOpen"
    title="选择导出格式"
    size="md"
    :show-footer="true"
    :show-submit="true"
    :show-cancel="true"
    :show-maximize="false"
    :enable-drag="false"
    :enable-resize="false"
    submit-text="导出"
    cancel-text="取消"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
    @submit="$emit('export')"
  >
    <!-- 3个格式 radio 选项 - 对应V1.1: border-emerald-500/bg-emerald-50 选中态 -->
    <div class="space-y-3">
      <label
        v-for="format in formats"
        :key="format.value"
        :class="[
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === format.value
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-400 hover:border-gray-400'
        ]"
      >
        <input
          type="radio"
          name="exportFormat"
          :value="format.value"
          :checked="exportFormat === format.value"
          @change="$emit('formatChange', format.value)"
          class="w-4 h-4 text-emerald-600 border-gray-400 focus:ring-emerald-500"
        />
        <div class="ml-3">
          <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
          <span class="block text-xs text-gray-500">{{ format.desc }}</span>
        </div>
      </label>
    </div>
  </UnifiedModal>
</template>

<script setup>
import { UnifiedModal } from '@/components/ui'

/**
 * 导出格式选择弹窗
 * 严格对齐 V1.1 MaterialExportModal.tsx
 * - 容器: UnifiedModal size=md (500×400) showFooter=true
 * - 显式禁用 showMaximize/enableDrag/enableResize（V1.1 显式传 false）
 * - 3个 radio 选项: Excel/CSV/Word, 选中态 emerald-500/emerald-50
 * - footer: 取消 + 导出 默认 UnifiedModal 标准
 */

defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  exportFormat: { type: String, default: 'excel' }
})

defineEmits(['close', 'formatChange', 'export'])

const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]
</script>
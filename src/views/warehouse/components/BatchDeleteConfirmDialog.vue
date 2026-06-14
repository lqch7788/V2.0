<template>
  <!-- 批量删除确认弹窗 - 严格对齐 V1.1 BatchDeleteConfirmDialog.tsx -->
  <!-- V1.1: UnifiedModal size="md" (500×400),showFooter=true,自定义 footer,内部展示物料编码列表 -->
  <UnifiedModal
    :model-value="isOpen"
    title="确认删除"
    size="md"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p>确定要删除选中的物料吗？</p>
      <div class="p-2 bg-gray-50 rounded text-xs">
        <p><strong>物料编号：</strong>{{ displayCodes }}{{ moreCount }}</p>
        <p><strong>物料总数：</strong>{{ selectedMaterials.length }} 个</p>
      </div>
      <p class="text-red-500">此操作不可撤销！</p>
    </div>

    <!-- 自定义 footer - 对应V1.1: 取消(secondary) + 确认删除(destructive),flex-1 等宽 -->
    <template #footer>
      <div class="flex gap-3 w-full">
        <button
          class="flex-1 h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center justify-center gap-1"
          @click="$emit('close')"
        >
          <X class="w-4 h-4" /> 取消
        </button>
        <button
          class="flex-1 h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center justify-center gap-1"
          @click="$emit('confirm')"
        >
          <Trash2 class="w-4 h-4" /> 确认删除
        </button>
      </div>
    </template>
  </UnifiedModal>
</template>

<script setup>
import { computed } from 'vue'
import { X, Trash2 } from 'lucide-vue-next'
import { UnifiedModal } from '@/components/ui'

/**
 * 批量删除确认弹窗
 * 严格对齐 V1.1 BatchDeleteConfirmDialog.tsx
 * - 容器: UnifiedModal size=md (500×400) + 自定义 footer
 * - 内容: 确认文字 + 物料编号(最多5个+等N个) + 总数 + 红色"此操作不可撤销"
 * - footer: 取消(secondary) + 确认删除(destructive red-600) 等宽
 */

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedMaterials: { type: Array, default: () => [] }
})

defineEmits(['close', 'confirm'])

// 显示的物料编号(最多5个)
const displayCodes = computed(() => {
  const materialCodes = props.selectedMaterials.map(m => m.code).slice(0, 5)
  return materialCodes.join('、')
})

// 超过5个时显示"等N个"
const moreCount = computed(() => {
  return props.selectedMaterials.length > 5 ? ` 等${props.selectedMaterials.length}个` : ''
})
</script>

<template>
  <!-- 批量删除警告弹窗 - 严格对齐 V1.1 DeleteWarningDialog.tsx -->
  <!-- V1.1: UnifiedModal size="md" (500×400),showFooter=true,自定义 footer(取消+已知晓),flex-1 等宽 -->
  <UnifiedModal
    :model-value="isOpen"
    title="批量删除警告"
    size="md"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p>删除后可能存在以下问题：</p>
      <ul class="list-disc list-inside space-y-1">
        <li>所有选中的物料将被永久删除</li>
        <li>相关的入库记录也将被删除</li>
        <li>历史数据将无法恢复</li>
      </ul>
    </div>

    <!-- 自定义 footer - 对应V1.1: 取消(secondary) + 已知晓(destructive),flex-1 等宽 -->
    <template #footer>
      <div class="flex gap-3 w-full">
        <button
          class="flex-1 h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center justify-center gap-1"
          @click="$emit('close')"
        >
          <X class="w-4 h-4" /> 取消
        </button>
        <button
          class="flex-1 h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          @click="$emit('confirm')"
        >
          已知晓
        </button>
      </div>
    </template>
  </UnifiedModal>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import { UnifiedModal } from '@/components/ui'

/**
 * 批量删除警告弹窗
 * 严格对齐 V1.1 DeleteWarningDialog.tsx
 * - 容器: UnifiedModal size=md (500×400) + 自定义 footer
 * - 内容: 文字+3条 list-disc 警告
 * - footer: 取消(secondary) + 已知晓(destructive red-600) 等宽
 */

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>

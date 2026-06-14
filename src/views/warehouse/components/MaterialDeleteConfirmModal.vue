<template>
  <!-- 物料删除确认弹窗 - 严格对齐 V1.1 MaterialDeleteConfirmModal.tsx -->
  <!-- V1.1: UnifiedModal size="md" (500×400),showFooter=false,内嵌 取消+确认删除 按钮,flex-1 -->
  <!-- V1.1 未显式传 showMaximize/enableDrag/enableResize，保持默认(true) -->
  <UnifiedModal
    :model-value="isOpen"
    title="删除确认"
    size="md"
    :show-footer="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div v-if="material">
      <!-- 警告头部 - 对应V1.1: ⚠️ + 标题 + 物料信息 + 4条红色警告 -->
      <div class="flex items-start gap-3 mb-4">
        <span class="text-2xl">⚠️</span>
        <div>
          <h4 class="text-sm font-medium text-gray-900">警告：删除此物料将造成严重后果！</h4>
          <p class="text-sm text-gray-500 mt-1">
            您正在删除物料：<strong>{{ material.name }}</strong>（{{ material.code }}）
          </p>
          <ul class="text-sm text-red-500 mt-2 space-y-1">
            <li>• 此操作将删除所有相关的入库记录</li>
            <li>• 历史数据将无法恢复</li>
            <li>• 可能导致库存数据错乱</li>
            <li>• 已使用的物料信息将无法追溯</li>
          </ul>
        </div>
      </div>

      <!-- 中间提示文本 - 对应V1.1: text-sm text-gray-500 mb-4 -->
      <p class="text-sm text-gray-500 mb-4">
        此操作不可撤销！请确认是否继续删除？
      </p>

      <!-- 操作按钮组 - 对应V1.1: secondary + destructive,flex-1 等宽 -->
      <div class="flex gap-3">
        <button
          class="flex-1 h-10 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center justify-center gap-1"
          @click="$emit('close')"
        >
          <X class="w-4 h-4" /> 取消
        </button>
        <button
          class="flex-1 h-10 px-4 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center justify-center gap-1"
          @click="$emit('confirm')"
        >
          <Trash2 class="w-4 h-4" /> 确认删除
        </button>
      </div>
    </div>
  </UnifiedModal>
</template>

<script setup>
import { X, Trash2 } from 'lucide-vue-next'
import { UnifiedModal } from '@/components/ui'

/**
 * 物料删除确认弹窗
 * 严格对齐 V1.1 MaterialDeleteConfirmModal.tsx
 * - 容器: UnifiedModal size=md (500×400) 无 footer
 * - 警告头部: ⚠️ + 标题 + 物料信息
 * - 4 条红色警告列表 + 中间提示
 * - 取消 (secondary) + 确认删除 (destructive red-600) 等宽按钮
 */

defineProps({
  material: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>
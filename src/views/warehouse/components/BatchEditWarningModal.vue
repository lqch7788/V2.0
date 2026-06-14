<template>
  <!-- 批量编辑风险提示弹窗 - 严格对齐 V1.1 BatchEditWarningModal.tsx -->
  <!-- V1.1: UnifiedModal size="md" (500×400),showFooter=false,showMaximize/drag/resize=false,自定义 amber 警告块+3条风险+建议+底部双按钮 -->
  <UnifiedModal
    :model-value="isOpen"
    title="批量编辑风险提示"
    size="md"
    :show-footer="false"
    :show-submit="false"
    :show-cancel="false"
    :show-maximize="false"
    :enable-drag="false"
    :enable-resize="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- 警告图标和标题 - 对应V1.1: amber-50/200 块,AlertTriangle 5×5 -->
      <div class="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div class="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <AlertTriangle class="w-5 h-5 text-amber-600" />
        </div>
        <div class="flex-1">
          <h4 class="text-amber-800 font-semibold text-base mb-1">批量编辑操作风险提醒</h4>
          <p class="text-amber-700 text-sm">您已选择 <span class="font-bold">{{ selectedCount }}</span> 个物料进行批量编辑</p>
        </div>
      </div>

      <!-- 风险说明列表 - 对应V1.1: 3 个红色圆形序号 + 标题 + 详细说明 -->
      <div class="space-y-3 px-1">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-red-600 text-xs font-bold">1</span>
          </div>
          <div>
            <p class="text-gray-700 text-sm font-medium">历史记录无法正常显示</p>
            <p class="text-gray-500 text-xs mt-0.5">批量编辑会修改物料的核心信息，可能导致系统中已保存的出入库记录、工单明细等历史数据与物料信息不匹配</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-red-600 text-xs font-bold">2</span>
          </div>
          <div>
            <p class="text-gray-700 text-sm font-medium">统计报表数据不准确</p>
            <p class="text-gray-500 text-xs mt-0.5">修改后的物料信息可能导致库存统计、成本核算、采购分析等报表数据出现偏差，需重新核对</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-red-600 text-xs font-bold">3</span>
          </div>
          <div>
            <p class="text-gray-700 text-sm font-medium">关联业务可能受影响</p>
            <p class="text-gray-500 text-xs mt-0.5">生产工单、采购计划、供应商对账等关联业务可能因物料信息变更而需要同步调整</p>
          </div>
        </div>
      </div>

      <!-- 建议 - 对应V1.1: blue-50/200 块 -->
      <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-700 text-xs">
          <span class="font-semibold">建议：</span>如非必要，请使用单个编辑功能。如确需批量编辑，编辑完成后请检查相关统计报表和业务单据。
        </p>
      </div>
    </div>

    <!-- 底部按钮 - 对应V1.1: 取消(outline) + 已知晓(warning amber-500),flex-1 等宽 -->
    <!-- V1.1 Button 标准: size=default(h-10 px-4 py-2) gap-2 transition-colors -->
    <!-- variant=outline: border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 -->
    <!-- variant=warning: bg-amber-500 text-white hover:bg-amber-600 -->
    <div class="flex gap-3 mt-6">
      <button
        class="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap h-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900"
        @click="$emit('close')"
      >
        <X class="w-4 h-4" /> 取消
      </button>
      <button
        class="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap h-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-amber-500 text-white hover:bg-amber-600"
        @click="$emit('confirm')"
      >
        已知晓
      </button>
    </div>
  </UnifiedModal>
</template>

<script setup>
import { AlertTriangle, X } from 'lucide-vue-next'
import { UnifiedModal } from '@/components/ui'

/**
 * 批量编辑风险提示弹窗
 * 严格对齐 V1.1 BatchEditWarningModal.tsx
 * - 容器: UnifiedModal size=md (500×400) showFooter=false
 * - 显式禁用 showMaximize/enableDrag/enableResize（V1.1 显式传 false）
 * - amber-50 警告块 + 3 条红色序号风险说明 + 蓝色建议块
 * - footer: 取消(outline) + 已知晓(amber-500 warning) 等宽
 */

defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 }
})

defineEmits(['close', 'confirm'])
</script>
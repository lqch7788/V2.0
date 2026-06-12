<template>
  <!-- 批量删除确认弹窗 - 对应V1.1 BatchDeleteConfirmDialog.tsx -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
    @click="handleClose"
  >
    <div class="bg-white rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between">
        <h3 class="font-semibold text-lg">确认删除</h3>
        <button @click="handleClose" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <div class="p-6 overflow-y-auto max-h-[70vh] space-y-3">
        <p class="text-sm text-gray-600">确定要删除选中的物料吗？</p>
        <div class="p-2 bg-gray-50 rounded text-xs">
          <p><strong>物料编号：</strong>{{ displayCodes }}{{ moreCount }}</p>
          <p><strong>物料总数：</strong>{{ selectedMaterials.length }} 个</p>
        </div>
        <p class="text-red-500 text-sm">此操作不可撤销！</p>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1" @click="handleClose">取消</button>
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 flex-1" @click="handleConfirm">确认删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 批量删除确认弹窗组件
 * 显示待删除物料列表供用户确认
 */

const props = defineProps({
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  },
  // 已选择的物料列表
  selectedMaterials: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'confirm'])

// 显示的物料编号（最多显示5个）
const displayCodes = computed(() => {
  const materialCodes = props.selectedMaterials.map(m => m.code).slice(0, 5)
  return materialCodes.join('、')
})

// 超过5个时显示
const moreCount = computed(() => {
  return props.selectedMaterials.length > 5 ? ` 等${props.selectedMaterials.length}个` : ''
})

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

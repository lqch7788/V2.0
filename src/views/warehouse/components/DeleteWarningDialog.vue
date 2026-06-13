<template>
  <!-- 批量删除警告弹窗 - 对应V1.1 DeleteWarningDialog.tsx -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('close')">
    <div class="bg-white rounded-xl w-full max-w-lg shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between rounded-t-xl">
        <h3 class="text-lg font-semibold">批量删除警告</h3>
        <button @click="$emit('close')" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- 弹窗内容 -->
      <div class="p-6">
        <div class="text-sm text-gray-600 space-y-2">
          <p>删除后可能存在以下问题：</p>
          <ul class="list-disc list-inside space-y-1">
            <li>所有选中的物料将被永久删除</li>
            <li>相关的入库记录也将被删除</li>
            <li>历史数据将无法恢复</li>
          </ul>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200" @click="$emit('close')">取消</button>
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="$emit('confirm')">已知晓</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 删除警告弹窗组件
 * 显示批量删除的风险提示
 */

defineProps({
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>

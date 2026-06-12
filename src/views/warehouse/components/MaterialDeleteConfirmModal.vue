<template>
  <!-- 物料删除确认弹窗 - 对应V1.1 MaterialDeleteConfirmModal.tsx -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('close')">
    <div class="bg-white rounded-xl w-full max-w-lg shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between rounded-t-xl">
        <h3 class="text-lg font-semibold">删除确认</h3>
        <button @click="$emit('close')" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- 弹窗内容 -->
      <div class="p-6">
        <div v-if="material">
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
          <p class="text-sm text-gray-500 mb-4">
            此操作不可撤销！请确认是否继续删除？
          </p>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="$emit('close')">取消</button>
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="$emit('confirm')">确认删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 物料删除确认弹窗组件
 * 显示删除警告和确认按钮
 */

defineProps({
  // 物料数据
  material: {
    type: Object,
    default: null
  },
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>

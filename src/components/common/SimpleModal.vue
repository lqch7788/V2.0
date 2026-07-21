<!--
  通用简单弹窗组件（严格对齐 V1.1 Modal.tsx header 样式）
  V1.1: bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500
       text-white + flex-shrink-0 + rounded-t-xl + cursor-move
-->
<template>
  <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center" @click.self="$emit('close')">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <!-- 弹窗容器 -->
    <div class="relative bg-white rounded-xl shadow-xl flex flex-col" :style="{ width: width, maxWidth: '90vw', maxHeight: '85vh' }">
      <!-- 标题栏（V1.1 风格：绿色渐变 + 白字 + 全宽 + cursor-move） -->
      <div v-if="title || $slots.header" class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-move select-none">
        <slot name="header">
          <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
        </slot>
        <button type="button" class="text-white hover:bg-white/20 rounded p-1" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <slot></slot>
      </div>
      <!-- 底部按钮栏 -->
      <div v-if="showFooter" class="px-6 py-3 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
        <slot name="footer">
          <button type="button" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" @click="$emit('close')">{{ cancelText }}</button>
          <button type="button" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700" :disabled="submitting" @click="$emit('submit')">
            <span v-if="submitting">提交中...</span>
            <span v-else>{{ submitText }}</span>
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '600px' },
  showFooter: { type: Boolean, default: true },
  submitText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  submitting: { type: Boolean, default: false }
})

defineEmits(['close', 'submit'])
</script>
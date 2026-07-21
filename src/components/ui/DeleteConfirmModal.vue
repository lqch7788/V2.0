<!--
  删除确认弹窗（重写 - 对齐 V1.1 DeleteConfirmModal.tsx）
-->
<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-96 shadow-xl flex flex-col">
      <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl">
        <div class="flex items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <h3 class="text-base font-semibold">{{ title }}</h3>
        </div>
        <button type="button" class="text-white hover:bg-red-700 rounded p-1" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="p-6">
        <p class="text-sm text-gray-700">
          确定要删除 <strong class="text-red-600">{{ selectedCount }}</strong> 条记录吗？此操作不可撤销！
        </p>
      </div>
      <div class="px-6 pb-4 flex justify-end gap-2">
        <button type="button" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" @click="$emit('close')">取消</button>
        <button type="button" class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700" @click="$emit('confirm')">确认删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  title: { type: String, default: '删除警告' }
})

defineEmits(['close', 'confirm'])
</script>

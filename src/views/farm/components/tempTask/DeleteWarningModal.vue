<!--
  DeleteWarningModal.vue - 删除确认弹窗
  V1.1 TempTaskPage.tsx 中 DeleteWarningModal 函数 1:1 迁移
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('close')"
    title="删除临时任务警告"
    width="450px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="flex items-center gap-4 mb-4">
      <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 3h6a1 1 0 011 1v2H8V4a1 1 0 011-1z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">删除临时任务警告</h3>
      </div>
    </div>
    <div class="text-sm text-gray-600 space-y-3">
      <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个临时任务吗？</p>
      <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <button type="button"
          class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
          @click="emit('close')">取消</button>
        <button type="button"
          class="px-3 py-1.5 rounded text-sm bg-red-500 text-white hover:bg-red-600"
          @click="emit('confirm')">确认删除</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
})
defineEmits(['close', 'confirm'])
</script>
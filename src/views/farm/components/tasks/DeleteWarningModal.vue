<!--
  DeleteWarningModal.vue - 任务批量删除警告弹窗
  V1.1 DeleteWarningModal 内联版 1:1 迁移
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('update:isOpen', false)"
    title="删除任务警告"
    width="480px"
    destroy-on-close
  >
    <div class="flex items-center gap-4 mb-4">
      <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <span class="text-red-600 text-2xl">🗑</span>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">删除任务警告</h3>
    </div>
    <div class="text-sm text-gray-600 space-y-3">
      <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个任务吗？</p>
      <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
    </div>

    <template #footer>
      <el-button @click="emit('update:isOpen', false)">取消</el-button>
      <el-button type="danger" @click="emit('confirm')">确认删除</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
})
const emit = defineEmits(['update:isOpen', 'confirm'])
</script>
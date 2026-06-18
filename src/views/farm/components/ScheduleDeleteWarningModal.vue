<!--
  ScheduleDeleteWarningModal.vue - 删除确认弹窗
  V1.1 DeleteWarningModal.tsx 1:1 对齐
-->
<template>
  <el-dialog :model-value="isOpen" @update:model-value="(v) => !v && emit('close')" title="确认删除" width="400px">
    <p class="text-sm text-gray-600">确定要删除选中的 <strong class="text-red-600">{{ selectedCount }}</strong> 条排班记录吗？此操作不可撤销。</p>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="danger" @click="emit('confirm')">确认删除</el-button>
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

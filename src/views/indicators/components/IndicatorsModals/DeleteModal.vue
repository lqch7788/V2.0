<template>
  <!-- 指标删除确认弹窗组件 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="handleClose"
    title="确认删除"
    width="400px"
    :close-on-click-modal="false"
    class="indicator-delete-modal"
  >
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <el-icon :size="32" class="text-red-600"><Delete /></el-icon>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
      <p class="text-gray-600 mb-1">确定要删除指标「{{ item?.name }}」吗？</p>
      <p class="text-gray-400 text-sm">删除后无法恢复</p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="danger" @click="handleConfirm">确认删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'
import {  Indicator  } from '@/types/indicators'

const props = defineProps({})
const emit = defineEmits(['close', 'confirm'])

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 确认删除
const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.indicator-delete-modal .el-dialog__header) {
  text-align: center;
  padding: 20px 20px 0;
}

:deep(.indicator-delete-modal .el-dialog__body) {
  padding: 0 20px 20px;
}
</style>

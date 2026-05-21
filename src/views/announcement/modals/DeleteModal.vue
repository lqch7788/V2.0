<template>
  <!-- 公告删除确认弹窗 -->
  <el-dialog
    :model-value="visible"
    title=""
    :close-on-click-modal="false"
    width="400px"
    class="delete-modal"
  >
    <div class="text-center p-4">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <el-icon class="text-3xl text-red-600"><Delete /></el-icon>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
      <p class="text-gray-600 mb-1">确定要删除公告「{{ item?.title }}」吗？</p>
      <p class="text-gray-400 text-sm mb-6">删除后无法恢复</p>
      <div class="flex justify-center gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="danger" size="small" @click="handleConfirm">确认删除</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import {  Notice  } from '@/types/announcement'

// Props 定义

const props = defineProps({})

// Emits 定义
const emit = defineEmits(['update'])

// 双向绑定
const visible = computed({
  get() {
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

// 关闭
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 确认
const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

<style scoped>
.delete-modal :deep(.el-dialog__header) {
  display: none;
}
</style>

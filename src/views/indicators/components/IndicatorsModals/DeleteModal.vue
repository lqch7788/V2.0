<template>
  <!-- 指标删除确认弹窗组件 - V1.1原生div样式 -->
  <div v-if="isOpen && item" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div class="bg-white rounded-lg w-full max-w-md shadow-2xl">
      <!-- 内容区域 - 居中布局 -->
      <div class="p-6 text-center">
        <!-- 红色删除图标 -->
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <el-icon :size="32" class="text-red-600"><Delete /></el-icon>
        </div>
        <!-- 标题 -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
        <!-- 描述 -->
        <p class="text-gray-600 mb-1">确定要删除指标「{{ item.name }}」吗？</p>
        <p class="text-gray-400 text-sm mb-6">删除后无法恢复</p>
        <!-- 按钮组 -->
        <div class="flex justify-center gap-3">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button size="small" type="danger" @click="handleConfirm">确认删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})

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
/* V1.1原生div弹窗，居中布局，红色删除图标 */
</style>

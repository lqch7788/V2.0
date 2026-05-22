<template>
  <!-- 公告删除确认弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen && item" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <el-icon class="text-3xl text-red-600"><Delete /></el-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
          <p class="text-gray-600 mb-1">确定要删除公告「{{ item.title }}」吗？</p>
          <p class="text-gray-400 text-sm mb-6">删除后无法恢复</p>
          <div class="flex justify-center gap-3">
            <el-button size="small" @click="handleClose">取消</el-button>
            <el-button type="danger" size="small" @click="handleConfirm">确认删除</el-button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})

const emit = defineEmits(['close', 'confirm'])

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>

<!--
  批量审批操作栏组件
  对标 V1.1 src/components/approval/BatchActionBar.tsx
  功能：选中项后显示批量通过/拒绝按钮
-->
<template>
  <transition name="el-fade-in">
    <div
      v-if="selectedIds.length > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4"
    >
      <div class="flex items-center gap-2">
        <el-icon :size="20" color="#059669"><Select /></el-icon>
        <span class="font-semibold text-gray-900">已选中 {{ selectedIds.length }} 项</span>
      </div>
      <el-divider direction="vertical" />
      <el-button type="primary" :loading="approving" @click="$emit('batch-approve')">
        <el-icon><Check /></el-icon>
        批量通过
      </el-button>
      <el-button type="danger" :loading="rejecting" @click="$emit('batch-reject')">
        <el-icon><CircleClose /></el-icon>
        批量拒绝
      </el-button>
      <el-divider direction="vertical" />
      <el-button text @click="$emit('clear-selection')">
        <el-icon><Close /></el-icon>
        取消选择
      </el-button>
    </div>
  </transition>
</template>

<script setup>
import { Check, CircleClose, Close, Select } from '@element-plus/icons-vue'

defineProps({
  selectedIds: { type: Array, default: () => [] },
  approving: { type: Boolean, default: false },
  rejecting: { type: Boolean, default: false },
})

defineEmits(['batch-approve', 'batch-reject', 'clear-selection'])
</script>

<style scoped>
.el-fade-in-enter-active,
.el-fade-in-leave-active {
  transition: all 0.3s ease;
}
.el-fade-in-enter-from,
.el-fade-in-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
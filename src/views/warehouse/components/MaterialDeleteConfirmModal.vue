<template>
  <!-- 物料删除确认弹窗 - 对应V1.1 MaterialDeleteConfirmModal.tsx -->
  <DeleteWarningModal
    :is-open="isOpen"
    :title="'删除确认'"
    :selected-count="material ? 1 : 0"
    :description="deleteDescription"
    @update:is-open="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
    @confirm="$emit('confirm')"
  />
</template>

<script setup>
import { computed } from 'vue'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'

const props = defineProps({
  // 物料数据
  material: {
    type: Object,
    default: null
  },
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])

// 构建删除警告描述文本
const deleteDescription = computed(() => {
  if (!props.material) return ''
  return `
    <p>您正在删除物料：<strong>${props.material.name}</strong>（${props.material.code}）</p>
    <ul style="margin-top:8px;color:#ef4444">
      <li>此操作将删除所有相关的入库记录</li>
      <li>历史数据将无法恢复</li>
      <li>可能导致库存数据错乱</li>
      <li>已使用的物料信息将无法追溯</li>
    </ul>
  `
})
</script>

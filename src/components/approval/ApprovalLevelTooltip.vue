<template>
  <!--
    审批级别说明组件（用于表单提示）
    文件路径：src/components/approval/ApprovalLevelTooltip.vue
    1:1 翻译自 V1.1 ApprovalLevelBadge.tsx (L162-179)
  -->
  <div class="text-xs text-gray-500 space-y-1">
    <div class="flex items-center gap-2">
      <span class="text-gray-400">类型:</span>
      <span class="text-gray-700">{{ type }}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-gray-400">金额:</span>
      <span class="text-gray-700">¥{{ formattedAmount }}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-gray-400">原因:</span>
      <span class="text-gray-700">{{ reason }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 业务类型
  type: {
    type: String,
    required: true
  },
  // 金额
  amount: {
    type: Number,
    required: true
  },
  // 原因说明
  reason: {
    type: String,
    required: true
  }
})

// 金额千分位格式化
const formattedAmount = computed(() => {
  return props.amount.toLocaleString()
})
</script>

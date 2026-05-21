<template>
  <el-tag
    :type="variant"
    :style="{ cursor: onClick ? 'pointer' : 'default', fontWeight: 500 }"
    @click="onClick"
  >
    {{ text }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

// 状态颜色映射
const getStatusVariant = (status) => {
  switch (status) {
    case 'APPROVED':
    case 'approved':
    case 'completed':
      return 'success'
    case 'PENDING':
    case 'pending':
    case 'PARTIALLY_APPROVED':
      return 'warning'
    case 'REJECTED':
    case 'rejected':
    case 'cancelled':
      return 'danger'
    case 'DRAFT':
    case 'draft':
    case 'CANCELLED':
      return 'info'
    default:
      return 'info'
  }
}

const getStatusText = (status) => {
  const statusMap = {
    APPROVED: '通过',
    PENDING: '待处理',
    PARTIALLY_APPROVED: '部分通过',
    REJECTED: '拒绝',
    DRAFT: '草稿',
    CANCELLED: '已撤回',
    completed: '已完成',
    pending: '待处理',
    cancelled: '已取消',
    in_progress: '进行中'
  }
  return statusMap[status] || status
}

const props = defineProps({
  status: String,
  onClick: Function
})

const variant = computed(() => getStatusVariant(props.status))
const text = computed(() => getStatusText(props.status))
</script>

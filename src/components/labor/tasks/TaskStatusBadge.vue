<template>
  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full', config.className]">
    <el-icon :size="12">
      <component :is="config.icon" />
    </el-icon>
    {{ config.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { Odometer, VideoPlay, CircleCheck, Close } from '@element-plus/icons-vue'

const props = defineProps({
  status: {
    type: String,
    default: 'pending'
  }
})

const statusConfig = {
  pending: {
    icon: Odometer,
    label: '待执行',
    className: 'bg-gray-100 text-gray-700',
  },
  in_progress: {
    icon: VideoPlay,
    label: '进行中',
    className: 'bg-blue-100 text-blue-700',
  },
  completed: {
    icon: CircleCheck,
    label: '已完成',
    className: 'bg-emerald-100 text-emerald-700',
  },
  cancelled: {
    icon: Close,
    label: '已取消',
    className: 'bg-red-100 text-red-700',
  },
}

const config = computed(() => statusConfig[props.status] || statusConfig.pending)
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">{{ card.label }}</p>
          <p :class="['text-2xl font-bold', card.valueColor || 'text-gray-900']">
            {{ card.value }}
          </p>
        </div>
        <el-icon :size="32" :class="card.iconColor">
          <component :is="card.icon" />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, Clock, CircleCheck, Warning, Close } from '@element-plus/icons-vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
})

const cards = computed(() => [
  {
    key: 'total',
    label: '今日任务',
    value: props.stats.total || 0,
    icon: Calendar,
    iconColor: 'text-blue-500',
  },
  {
    key: 'inProgress',
    label: '进行中',
    value: props.stats.inProgress || 0,
    icon: Clock,
    iconColor: 'text-blue-500',
    valueColor: 'text-blue-600',
  },
  {
    key: 'completed',
    label: '已完成',
    value: props.stats.completed || 0,
    icon: CircleCheck,
    iconColor: 'text-green-500',
    valueColor: 'text-green-600',
  },
  {
    key: 'waitingAcceptance',
    label: '待验收',
    value: props.stats.waitingAcceptance || 0,
    icon: Warning,
    iconColor: 'text-orange-500',
    valueColor: 'text-orange-600',
  },
  {
    key: 'warning',
    label: '异常',
    value: props.stats.warning || 0,
    icon: Close,
    iconColor: 'text-red-500',
    valueColor: 'text-red-600',
  },
])
</script>

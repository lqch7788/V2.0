<!--
  DispatchMetricsDashboard.vue - 派工监控仪表板
  V1.1 SmartDispatch.tsx DispatchMetricsDashboard 1:1 对齐
-->
<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-white rounded-lg border border-gray-200 p-3"
    >
      <div class="flex items-center gap-2">
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', card.bgColor]">
          <el-icon :size="16" color="white">
            <component :is="card.icon" />
          </el-icon>
        </div>
        <div>
          <p class="text-xl font-bold text-gray-900">{{ card.value }}</p>
          <p class="text-xs text-gray-500">{{ card.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Tickets, Lightning, Clock, CircleCheck } from '@element-plus/icons-vue'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
})

const cards = computed(() => [
  {
    key: 'total',
    label: '总任务',
    value: props.stats.total || 0,
    icon: Tickets,
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    key: 'pending',
    label: '待派发',
    value: props.stats.pending || 0,
    icon: Clock,
    bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
  },
  {
    key: 'urgent',
    label: '紧急',
    value: props.stats.urgent || 0,
    icon: Lightning,
    bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
  },
  {
    key: 'completed',
    label: '已派发',
    value: props.stats.completed || 0,
    icon: CircleCheck,
    bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  },
])
</script>

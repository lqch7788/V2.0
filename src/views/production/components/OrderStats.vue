<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center gap-2">
        <div :class="`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`">
          <component :is="stat.icon" class="w-4 h-4 text-white" />
        </div>
        <div>
          <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Package, TrendingUp, CheckCircle, Calendar } from 'lucide-vue-next'

const props = defineProps<{
  data: {
    total: number
    inProgress: number
    completed: number
    thisMonth: number
  }
}>()

const stats = computed(() => [
  { label: '订单总数', value: props.data.total, color: 'bg-blue-500', icon: Package },
  { label: '进行中', value: props.data.inProgress, color: 'bg-amber-500', icon: TrendingUp },
  { label: '已完成', value: props.data.completed, color: 'bg-emerald-500', icon: CheckCircle },
  { label: '本月新增', value: props.data.thisMonth, color: 'bg-purple-500', icon: Calendar },
])
</script>

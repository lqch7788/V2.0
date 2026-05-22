<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-2">
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="16" class="text-white">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Crop, Sunny, CircleCheck, Top } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      total: 0,
      growing: 0,
      harvested: 0,
      monthCount: 0
    })
  }
})

const stats = computed(() => [
  {
    label: '总批次数',
    value: props.data.total || 0,
    icon: Crop,
    color: 'bg-emerald-500',
  },
  {
    label: '生长期',
    value: props.data.growing || 0,
    icon: Sunny,
    color: 'bg-amber-500',
  },
  {
    label: '已采收',
    value: props.data.harvested || 0,
    icon: CircleCheck,
    color: 'bg-green-500',
  },
  {
    label: '本月新增',
    value: props.data.monthCount || 0,
    icon: Top,
    color: 'bg-blue-500',
  },
])
</script>

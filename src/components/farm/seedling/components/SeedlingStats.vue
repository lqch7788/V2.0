<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-3">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="20" style="color: white;">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div>
          <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {Sugar, Clock, CircleCheck, CaretTop } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      total: 0,
      inProgress: 0,
      completed: 0,
      monthCount: 0
    })
  }
})

// 使用与V1.1一致的图标
const stats = computed(() => [
  {
    label: '总批次数',
    value: props.data.total || 0,
    icon: Sugar,
    color: 'bg-emerald-500'
  },
  {
    label: '进行中',
    value: props.data.inProgress || 0,
    icon: Clock,
    color: 'bg-amber-500'
  },
  {
    label: '已完成',
    value: props.data.completed || 0,
    icon: CircleCheck,
    color: 'bg-green-500'
  },
  {
    label: '本月新增',
    value: props.data.monthCount || 0,
    icon: CaretTop,
    color: 'bg-blue-500'
  }
])
</script>

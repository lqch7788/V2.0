<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="(card, index) in cards"
      :key="index"
      class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <div
          :class="['w-10 h-10 rounded-lg flex items-center justify-center', card.bgColor]"
        >
          <span :class="['text-lg', card.textColor]">{{ card.icon }}</span>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
          <p class="text-xs text-gray-500">{{ card.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({})

const cards = computed(() => [
  {
    icon: '📅',
    value: props.stats.totalWorkdays,
    label: '总工日数',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    icon: '👥',
    value: props.stats.attendanceRate,
    label: '出勤率',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    icon: '✓',
    value: props.stats.completedTasks,
    label: '已完成任务',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: '📦',
    value: props.stats.totalHarvest,
    label: '总产量',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
])
</script>

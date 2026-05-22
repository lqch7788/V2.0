<template>
  <span
    class="px-2 py-1 text-xs rounded-full"
    :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const badgeMap = {
  planned: { label: '已计划', class: 'bg-gray-100 text-gray-700' },
  in_progress: { label: '进行中', class: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', class: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: '已取消', class: 'bg-red-100 text-red-700' },
}

const badgeClass = computed(() => badgeMap[props.status]?.class || 'bg-gray-100 text-gray-700')
const label = computed(() => badgeMap[props.status]?.label || props.status)
</script>

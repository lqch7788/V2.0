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
  type: { type: String, required: true },
})

const badgeMap = {
  breeding: { label: '育种订单', class: 'bg-pink-100 text-pink-700' },
  seedling: { label: '育苗订单', class: 'bg-green-100 text-green-700' },
  production: { label: '生产订单', class: 'bg-purple-100 text-purple-700' },
  research: { label: '研发订单', class: 'bg-cyan-100 text-cyan-700' },
  other: { label: '其他', class: 'bg-gray-100 text-gray-700' },
}

const badgeClass = computed(() => badgeMap[props.type]?.class || 'bg-gray-100 text-gray-700')
const label = computed(() => badgeMap[props.type]?.label || props.type)
</script>

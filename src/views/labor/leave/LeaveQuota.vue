<!--
  请假配额组件
  对标 V1.1 src/components/labor/leave/LeaveQuota.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold text-gray-900 mb-3">年假配额</h3>
    <div class="grid grid-cols-3 gap-3">
      <div v-for="q in quotas" :key="q.type" class="text-center p-3 rounded-lg" :class="q.bgClass">
        <div class="text-2xl font-bold" :class="q.textClass">{{ q.remaining }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ q.label }}</div>
        <div class="text-xs text-gray-400">已用 {{ q.used }} / 共 {{ q.total }}</div>
      </div>
    </div>
    <el-progress v-if="overallPercent < 100" :percentage="overallPercent" :stroke-width="8" class="mt-3" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  quotas: { type: Array, default: () => [] },
})

const overallPercent = computed(() => {
  if (!props.quotas.length) return 0
  const total = props.quotas.reduce((sum, q) => sum + q.total, 0)
  const used = props.quotas.reduce((sum, q) => sum + q.used, 0)
  return total > 0 ? Math.round((used / total) * 100) : 0
})
</script>
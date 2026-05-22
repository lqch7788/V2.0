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

<script setup>
import { computed } from 'vue'
import { Layers, PlayCircle, CheckCircle2, FileEdit } from 'lucide-vue-next'

const props = defineProps({
  batches: { type: Array, default: () => [] }
})

const stats = computed(() => [
  {
    label: '总批次',
    value: props.batches.length,
    color: 'bg-blue-500',
    icon: Layers,
  },
  {
    label: '执行中',
    value: props.batches.filter(b => b.batchStatus === 'published' || b.batchStatus === 'in_progress').length,
    color: 'bg-emerald-500',
    icon: PlayCircle,
  },
  {
    label: '已完成',
    value: props.batches.filter(b => b.batchStatus === 'completed').length,
    color: 'bg-green-600',
    icon: CheckCircle2,
  },
  {
    label: '草稿/已作废',
    value: props.batches.filter(b => b.batchStatus === 'draft' || b.batchStatus === 'cancelled').length,
    color: 'bg-gray-500',
    icon: FileEdit,
  },
])
</script>

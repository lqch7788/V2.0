<template>
  <div class="grid grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-3">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', card.bgColor]">
          <el-icon :size="20" :class="card.iconColor">
            <component :is="card.icon" />
          </el-icon>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ card.value }}</div>
          <div class="text-sm text-gray-500">{{ card.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Warning, Clock, Promotion, CircleCheck } from '@element-plus/icons-vue'

const props = defineProps({})

const cards = computed(() => [
  {
    key: 'total',
    label: '问题总数',
    value: props.totalCount,
    icon,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    key: 'pending',
    label: '待分派',
    value: props.pendingCount,
    icon,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    key: 'dispatched',
    label: '已分派',
    value: props.dispatchedCount,
    icon,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    key: 'handled',
    label: '已处理',
    value: props.handledCount,
    icon,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
])
</script>

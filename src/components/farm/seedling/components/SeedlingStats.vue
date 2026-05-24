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
// 导入 sprout 图标（使用SVG组件方式，模拟lucide-react的Sprout图标效果）
const SproutIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>`
}
const ClockIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
}
const CheckCircleIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
}
const TrendingUpIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
}
import { Sugar } from '@element-plus/icons-vue'

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

// 使用与V1.1一致的图标（lucide-react风格）
const stats = computed(() => [
  {
    label: '总批次数',
    value: props.data.total || 0,
    icon: SproutIcon,
    color: 'bg-emerald-500'
  },
  {
    label: '进行中',
    value: props.data.inProgress || 0,
    icon: ClockIcon,
    color: 'bg-amber-500'
  },
  {
    label: '已完成',
    value: props.data.completed || 0,
    icon: CheckCircleIcon,
    color: 'bg-green-500'
  },
  {
    label: '本月新增',
    value: props.data.monthCount || 0,
    icon: TrendingUpIcon,
    color: 'bg-blue-500'
  }
])
</script>

<template>
  <div
    :class="[
      'bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow',
      small ? 'p-3' : 'p-6'
    ]"
  >
    <div class="flex items-center justify-between">
      <!-- 图标 -->
      <div :class="['rounded-lg', color, small ? 'p-2' : 'p-3']">
        <el-icon :size="small ? 16 : 24" class="text-white">
          <Calendar v-if="iconName === 'Calendar'" />
          <Bell v-else-if="iconName === 'Bell'" />
          <CircleCheck v-else-if="iconName === 'CircleCheck'" />
          <Warning v-else-if="iconName === 'Warning'" />
          <TrendCharts v-else-if="iconName === 'TrendCharts'" />
          <Lightning v-else-if="iconName === 'Lightning'" />
          <component v-else :is="icon" />
        </el-icon>
      </div>

      <!-- 趋势 -->
      <div
        v-if="trend"
        :class="['flex items-center gap-1 text-sm', trendUp ? 'text-emerald-600' : 'text-red-600']"
      >
        <el-icon :class="{ 'rotate-180': !trendUp }">
          <CaretTop />
        </el-icon>
        <span>{{ trend }}</span>
      </div>
    </div>

    <!-- 数值 -->
    <div class="mt-3">
      <p :class="['font-bold text-gray-900', small ? 'text-xl' : 'text-3xl']">{{ value }}</p>
      <p class="text-sm text-gray-500 mt-1">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CaretTop, Calendar, Bell, CircleCheck, Warning, TrendCharts, Lightning } from '@element-plus/icons-vue'

const props = defineProps({"small":"false"})

const iconName = computed(() => {
  if (typeof props.icon === 'string') return props.icon
  return ''
})
</script>

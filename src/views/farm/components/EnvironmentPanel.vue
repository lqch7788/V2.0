<!--
  EnvironmentPanel.vue - 环境感知面板
  V1.1 SmartDispatch.tsx EnvironmentPanel 1:1 对齐
-->
<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <el-icon color="#06b6d4"><Sunny /></el-icon>
        环境监测
      </h3>
      <span :class="['px-2 py-0.5 text-xs rounded', isSuitable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700']">
        {{ isSuitable ? '适宜作业' : '不适宜' }}
      </span>
    </div>

    <!-- 天气概况 -->
    <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
      <div class="p-2 rounded bg-cyan-50">
        <div class="text-cyan-600 mb-1">气温</div>
        <div class="text-lg font-bold text-cyan-900">{{ weather?.temperature || '--' }}°C</div>
      </div>
      <div class="p-2 rounded bg-blue-50">
        <div class="text-blue-600 mb-1">湿度</div>
        <div class="text-lg font-bold text-blue-900">{{ weather?.humidity || '--' }}%</div>
      </div>
      <div class="p-2 rounded bg-sky-50">
        <div class="text-sky-600 mb-1">风速</div>
        <div class="text-lg font-bold text-sky-900">{{ weather?.windSpeed || '--' }} 级</div>
      </div>
      <div class="p-2 rounded bg-indigo-50">
        <div class="text-indigo-600 mb-1">光照</div>
        <div class="text-lg font-bold text-indigo-900">{{ weather?.light || '--' }} Lux</div>
      </div>
    </div>

    <!-- 天气预报 -->
    <div v-if="weather?.forecast" class="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
      📅 {{ weather.forecast }}
    </div>

    <!-- 未确认预警 -->
    <div v-if="alerts?.length" class="pt-3 border-t border-gray-100">
      <div class="text-xs text-amber-600 mb-2">⚠️ 预警 {{ alerts.length }} 条</div>
      <div
        v-for="a in alerts.slice(0, 3)"
        :key="a.id"
        class="text-xs text-gray-600 mb-1 flex items-start gap-1"
      >
        <span class="text-amber-500">•</span>
        <span class="flex-1">{{ a.message || a }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Sunny } from '@element-plus/icons-vue'

const props = defineProps({
  weather: { type: Object, default: () => ({}) },
  alerts: { type: Array, default: () => [] },
})

const isSuitable = computed(() => props.weather?.isSuitable !== false)
</script>

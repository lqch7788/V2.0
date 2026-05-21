<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">考核维度分析</h3>

    <!-- 空状态 -->
    <template v-if="records.length === 0">
      <div class="h-[300px] flex items-center justify-center text-gray-400">
        暂无考核数据
      </div>
    </template>

    <!-- 有数据 -->
    <template v-else>
      <!-- 统计卡片 -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-emerald-50 rounded-lg p-3 text-center">
          <p class="text-xs text-emerald-600 mb-1">平均得分</p>
          <p class="text-2xl font-bold text-emerald-700">{{ averageScore }}</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-3 text-center">
          <p class="text-xs text-blue-600 mb-1">考核人数</p>
          <p class="text-2xl font-bold text-blue-700">{{ records.length }}</p>
        </div>
        <div class="bg-amber-50 rounded-lg p-3 text-center">
          <p class="text-xs text-amber-600 mb-1">最高得分</p>
          <p class="text-2xl font-bold text-amber-700">{{ maxScore }}</p>
        </div>
      </div>

      <!-- 雷达图 -->
      <div class="h-[300px] bg-gray-50 rounded flex items-center justify-center">
        <span class="text-gray-400">图表区域 - 雷达图</span>
      </div>

      <!-- 维度说明 -->
      <div class="mt-4 pt-4 border-t border-gray-100">
        <p class="text-xs text-gray-500 mb-2">维度权重</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="dim in performanceDimensions"
            :key="dim.key"
            class="inline-flex px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
          >
            {{ dim.name }}: {{ dim.weight }}%
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({})

const performanceDimensions = [
  { key: 'workQuality', name: '工作质量', weight: 30 },
  { key: 'workEfficiency', name: '工作效率', weight: 25 },
  { key: 'attendance', name: '出勤情况', weight: 20 },
  { key: 'safety', name: '安全规范', weight: 15 },
  { key: 'teamwork', name: '团队协作', weight: 10 },
]

const averageScore = computed(() => {
  if (props.records.length === 0) return 0
  return Math.round(props.records.reduce((sum, r) => sum + r.totalScore, 0) / props.records.length)
})

const maxScore = computed(() => {
  if (props.records.length === 0) return 0
  return Math.max(...props.records.map((r) => r.totalScore))
})
</script>

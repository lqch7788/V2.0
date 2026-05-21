<template>
  <!-- 产量分析子页面 -->
  <div class="space-y-4">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-800">产量趋势</h3>
        <el-radio-group v-model="groupBy" size="small">
          <el-radio-button label="month">按月</el-radio-button>
          <el-radio-button label="quarter">按季度</el-radio-button>
          <el-radio-button label="year">按年</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
      </div>

      <!-- 图表 -->
      <div v-else class="h-80">
        <div v-if="yieldItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
          <el-icon :size="48"><Histogram /></el-icon>
          <span class="text-sm mt-2">暂无产量数据</span>
        </div>
        <div v-else class="w-full h-full flex items-end justify-around gap-2">
          <div
            v-for="(item, index) in yieldItems"
            :key="index"
            class="flex flex-col items-center flex-1"
          >
            <div
              class="w-full bg-emerald-500 rounded-t transition-all duration-300 hover:bg-emerald-600"
              :style="{ height: `${(item.value / maxValue) * 100}%`, minHeight: '8px' }"
            />
            <span class="text-xs text-gray-500 mt-2 truncate">{{ item.name }}</span>
            <span class="text-xs text-gray-400">{{ item.value }}kg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500">总产量</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">{{ totalYield.toLocaleString() }} kg</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500">采收次数</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">{{ harvestCount }} 次</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500">平均单次产量</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">{{ avgYield.toLocaleString() }} kg</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500">总产值</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">¥{{ totalAmount.toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Loading, Histogram } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'

const summaryStore = useSummaryStore()
const groupBy = ref('month')

const yieldItems = computed(() => summaryStore.yieldItems)
const isLoading = computed(() => summaryStore.isLoading)

const maxValue = computed(() => {
  if (yieldItems.value.length === 0) return 100
  return Math.max(...yieldItems.value.map((d) => d.value), 1)
})

const totalYield = computed(() => {
  return yieldItems.value.reduce((sum, item) => sum + item.value, 0)
})

const harvestCount = computed(() => yieldItems.value.length)

const avgYield = computed(() => {
  if (harvestCount.value === 0) return 0
  return Math.round(totalYield.value / harvestCount.value)
})

const totalAmount = computed(() => {
  return yieldItems.value.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
})

const loadData = () => {
  summaryStore.fetchYieldStats({ groupBy: groupBy.value })
}

watch(groupBy, () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<template>
  <!-- 成本分析子页面 -->
  <div class="space-y-4">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-base font-semibold text-gray-800 mb-4">成本构成分析</h3>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
      </div>

      <!-- 成本构成 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 人工成本 -->
        <div class="bg-blue-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon :size="20" color="#3b82f6"><User /></el-icon>
            <span class="text-sm font-medium text-gray-700">人工成本</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">¥{{ (costSummary?.totalLaborCost || 0).toLocaleString() }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ laborPercent }}%</p>
          <div class="w-full h-2 bg-blue-200 rounded-full mt-2">
            <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${laborPercent}%` }" />
          </div>
        </div>

        <!-- 物料成本 -->
        <div class="bg-emerald-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon :size="20" color="#10b981"><Box /></el-icon>
            <span class="text-sm font-medium text-gray-700">物料成本</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">¥{{ (costSummary?.totalMaterialCost || 0).toLocaleString() }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ materialPercent }}%</p>
          <div class="w-full h-2 bg-emerald-200 rounded-full mt-2">
            <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${materialPercent}%` }" />
          </div>
        </div>

        <!-- 能源成本 -->
        <div class="bg-amber-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon :size="20" color="#f59e0b"><Lightning /></el-icon>
            <span class="text-sm font-medium text-gray-700">能源成本</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">¥{{ (costSummary?.totalEnergyCost || 0).toLocaleString() }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ energyPercent }}%</p>
          <div class="w-full h-2 bg-amber-200 rounded-full mt-2">
            <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${energyPercent}%` }" />
          </div>
        </div>
      </div>

      <!-- 总成本 -->
      <div class="mt-6 p-4 bg-gray-50 rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">总成本</span>
          <span class="text-2xl font-bold text-gray-800">¥{{ (costSummary?.totalCost || 0).toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Loading, User, Box, Lightning } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'

const summaryStore = useSummaryStore()

const costSummary = computed(() => summaryStore.costSummary)
const isLoading = computed(() => summaryStore.isLoading)

const totalCost = computed(() => costSummary.value?.totalCost || 0)

const laborPercent = computed(() => {
  if (totalCost.value === 0) return 0
  return Math.round((costSummary.value?.totalLaborCost || 0) / totalCost.value * 100)
})

const materialPercent = computed(() => {
  if (totalCost.value === 0) return 0
  return Math.round((costSummary.value?.totalMaterialCost || 0) / totalCost.value * 100)
})

const energyPercent = computed(() => {
  if (totalCost.value === 0) return 0
  return Math.round((costSummary.value?.totalEnergyCost || 0) / totalCost.value * 100)
})

onMounted(() => {
  summaryStore.fetchCostStats({})
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

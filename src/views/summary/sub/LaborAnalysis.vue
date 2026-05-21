<template>
  <!-- 人工分析子页面 -->
  <div class="space-y-4">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-base font-semibold text-gray-800 mb-4">人工工时统计</h3>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
      </div>

      <!-- 无数据提示 -->
      <div v-else-if="laborItems.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
        <el-icon :size="48"><User /></el-icon>
        <span class="text-sm mt-2">暂无人工统计数据</span>
      </div>

      <!-- 数据展示 -->
      <div v-else class="space-y-4">
        <div
          v-for="(item, index) in laborItems"
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <p class="text-sm font-medium text-gray-700">{{ item.name }}</p>
            <p class="text-xs text-gray-500">{{ item.hours }} 工时</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-800">¥{{ item.amount.toLocaleString() }}</p>
            <p class="text-xs text-gray-400">¥{{ item.workerCount || 0 }} 人</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 汇总统计 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500">总工时</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">{{ totalHours.toLocaleString() }} h</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500">平均时薪</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">¥{{ avgHourlyRate.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Loading, User } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'

const summaryStore = useSummaryStore()

const laborItems = computed(() => summaryStore.laborItems)
const isLoading = computed(() => summaryStore.isLoading)
const costSummary = computed(() => summaryStore.costSummary)

const totalHours = computed(() => costSummary.value?.totalWorkHours || 0)
const avgHourlyRate = computed(() => costSummary.value?.avgHourlyRate || 0)

onMounted(() => {
  summaryStore.fetchLaborStats({})
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

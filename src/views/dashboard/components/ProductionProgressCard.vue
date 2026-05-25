<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-violet-500 to-purple-600">
          <el-icon :size="20" class="text-white">
            <TrendCharts />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">生产进度</span>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold text-violet-600">{{ stats.harvestReady }}</span>
        <span class="text-sm text-gray-500">个批次进入采收期</span>
      </div>
      <div class="space-y-1 mt-2">
        <div v-for="(batch, index) in stats.batches" :key="index" class="flex items-center justify-between text-sm">
          <span class="text-gray-600">{{ batch.name }}</span>
          <span class="text-xs text-gray-400">{{ batch.daysLeft }}天后</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores'

const summaryStore = useSummaryStore()

onMounted(() => {
  if (summaryStore.batchItems.length === 0) {
    summaryStore.fetchBatchStats({ limit: 50 })
  }
})

// 从批次统计数据中计算生产进度（采收期批次和剩余天数）
const stats = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nearHarvest = (summaryStore.batchItems || [])
    .filter(b => b.expectedHarvestDate && (b.status === 'in_progress' || b.status === 'planted'))
    .map(b => {
      const harvestDate = new Date(b.expectedHarvestDate)
      const daysLeft = Math.max(0, Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      return { name: b.cropName, daysLeft }
    })
    .filter(b => b.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)

  return { harvestReady: nearHarvest.length, batches: nearHarvest }
})
</script>

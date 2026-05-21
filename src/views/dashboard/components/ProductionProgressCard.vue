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
import { ref } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'

const stats = ref({
  harvestReady: 4,
  batches: [
    { name: '番茄', daysLeft: 5 },
    { name: '黄瓜', daysLeft: 12 },
    { name: '辣椒', daysLeft: 20 }
  ]
})
</script>

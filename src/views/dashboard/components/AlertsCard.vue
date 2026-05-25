<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-red-500 to-rose-600">
          <el-icon :size="20" class="text-white">
            <WarnTriangleFilled />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">告警数量</span>
      </div>
      <span class="text-2xl font-bold text-red-600">{{ stats.total }}</span>
    </div>
    <div class="space-y-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-red-500"><HotWater /></el-icon>
          环境告警
        </span>
        <span class="font-medium">{{ stats.environment }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-orange-500"><Setting /></el-icon>
          设备故障
        </span>
        <span class="font-medium">{{ stats.equipment }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-yellow-500"><View /></el-icon>
          病虫害告警
        </span>
        <span class="font-medium">{{ stats.pest }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-emerald-500"><Grape /></el-icon>
          农事告警
        </span>
        <span class="font-medium">{{ stats.farming }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { WarnTriangleFilled, HotWater, Setting, View, Grape } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores'

const summaryStore = useSummaryStore()

onMounted(() => {
  summaryStore.fetchAlerts()
})

// 使用store中的alertsBreakdown，有默认值做兜底
const stats = summaryStore.alertsBreakdown
</script>

<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-red-500 to-rose-600">
          <el-icon :size="20" class="text-white">
            <WarningFilled />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">告警数量</span>
      </div>
      <span class="text-2xl font-bold text-red-600">{{ alertsBreakdown.total }}</span>
    </div>
    <div class="space-y-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-red-500"><HotWater /></el-icon>
          环境告警
        </span>
        <span class="font-medium">{{ alertsBreakdown.environment }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-orange-500"><Tools /></el-icon>
          设备故障
        </span>
        <span class="font-medium">{{ alertsBreakdown.equipment }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-yellow-500"><View /></el-icon>
          病虫害告警
        </span>
        <span class="font-medium">{{ alertsBreakdown.pest }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-emerald-500"><Sugar /></el-icon>
          农事告警
        </span>
        <span class="font-medium">{{ alertsBreakdown.farming }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WarningFilled, HotWater, Tools, View, Sugar } from '@element-plus/icons-vue'

defineProps({
  alertsBreakdown: Object
})
</script>

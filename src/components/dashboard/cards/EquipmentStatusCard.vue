<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-cyan-500 to-teal-600">
          <el-icon :size="20" class="text-white">
            <Odometer />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">设备状态</span>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">自动运行</span>
        <span class="font-medium text-emerald-600">{{ equipmentStats.autoMode }}台</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">手动模式</span>
        <span class="font-medium text-amber-600">{{ equipmentStats.manualMode }}台</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">设备故障</span>
        <span class="font-medium text-red-600">{{ equipmentStats.faults }}台</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">离线传感器</span>
        <span class="font-medium text-gray-600">{{ equipmentStats.offlineSensors }}个</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Odometer } from '@element-plus/icons-vue'

defineProps({
  equipmentStats: Object
})
</script>

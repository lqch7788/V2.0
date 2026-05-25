<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-cyan-500 to-teal-600">
          <el-icon :size="20" class="text-white">
            <DataLine />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">设备状态</span>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">自动运行</span>
        <span class="font-medium text-emerald-600">{{ stats.autoMode }}台</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">手动模式</span>
        <span class="font-medium text-amber-600">{{ stats.manualMode }}台</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">设备故障</span>
        <span class="font-medium text-red-600">{{ stats.faults }}台</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">离线传感器</span>
        <span class="font-medium text-gray-600">{{ stats.offlineSensors }}个</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { DataLine } from '@element-plus/icons-vue'
import { useDeviceStore } from '@/stores/modules/device'

const deviceStore = useDeviceStore()

onMounted(() => {
  if (deviceStore.devices.length === 0) {
    deviceStore.loadDevices()
  }
})

const stats = computed(() => {
  const devices = deviceStore.devices || []
  return {
    autoMode: devices.filter(d => d.status === 'normal' || d.status === 'active' || d.status === 'running').length,
    manualMode: devices.filter(d => d.status === 'manual' || d.status === 'standby').length,
    faults: devices.filter(d => d.status === 'fault' || d.status === 'error' || d.status === 'faulty' || d.status === 'repair').length,
    offlineSensors: devices.filter(d => d.status === 'offline' || d.status === 'inactive' || d.status === 'disabled').length
  }
})
</script>

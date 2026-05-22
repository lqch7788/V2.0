<template>
  <!-- IoT数据来源标识组件 - 显示当前IoT设备连接状态和自动记录数统计 -->
  <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-400">
    <el-icon class="is-loading w-4 h-4"><Cpu /></el-icon>
    <span>正在查询IoT设备...</span>
  </div>

  <div v-else-if="devices.length === 0" class="flex items-center gap-2 text-sm text-gray-400">
    <el-icon class="w-4 h-4"><Connection /></el-icon>
    <span>暂无IoT设备连接</span>
  </div>

  <div v-else class="flex items-center gap-3">
    <div
      v-for="device in devices"
      :key="device.device_id"
      class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm"
    >
      <el-icon class="w-3.5 h-3.5 text-emerald-600"><Connection /></el-icon>
      <span class="font-medium text-emerald-700">{{ device.device_name }}</span>
      <span class="text-emerald-500">|</span>
      <span class="text-emerald-600">
        自动记录: <strong>{{ device.record_count }}</strong> 条
      </span>
      <span v-if="device.last_active" class="text-xs text-gray-400 ml-1">
        最后活跃: {{ formatDate(device.last_active) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { Connection, Close, Cpu } from '@element-plus/icons-vue'

defineProps({
  // IoT设备状态列表
  devices: {
    type: Array,
    default: () => []
  },
  // 是否正在加载
  loading: {
    type: Boolean,
    default: false
  }
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>

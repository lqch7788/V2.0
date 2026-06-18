<!--
  MaterialEquipmentPanel.vue - 物料设备状态面板
  V1.1 SmartDispatch.tsx MaterialEquipmentPanel 1:1 对齐
-->
<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <el-icon color="#3b82f6"><Goods /></el-icon>
        物料设备
      </h3>
      <span class="text-xs text-gray-500">{{ materials.length + equipment.length }} 项</span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <!-- 物料 -->
      <div>
        <div class="text-xs font-medium text-gray-700 mb-2">物料库存</div>
        <div class="space-y-1.5 max-h-32 overflow-y-auto">
          <div
            v-for="m in materials.slice(0, 5)"
            :key="m.id"
            class="flex items-center justify-between text-xs p-1.5 rounded"
            :class="m.status === 'low' ? 'bg-red-50' : 'bg-gray-50'"
          >
            <span class="truncate text-gray-900">{{ m.name }}</span>
            <span :class="m.status === 'low' ? 'text-red-600' : 'text-gray-500'">
              {{ m.stock }}{{ m.unit }}
            </span>
          </div>
        </div>
      </div>

      <!-- 设备 -->
      <div>
        <div class="text-xs font-medium text-gray-700 mb-2">设备状态</div>
        <div class="space-y-1.5 max-h-32 overflow-y-auto">
          <div
            v-for="e in equipment.slice(0, 5)"
            :key="e.id"
            class="flex items-center justify-between text-xs p-1.5 rounded bg-gray-50"
          >
            <span class="truncate text-gray-900">{{ e.name }}</span>
            <span :class="statusClass(e.status)">{{ statusLabel(e.status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="alerts?.length" class="mt-3 pt-3 border-t border-gray-100">
      <div class="text-xs text-red-600 mb-2">⚠️ 库存预警</div>
      <div v-for="(a, i) in alerts.slice(0, 3)" :key="i" class="text-xs text-gray-600 mb-1">
        {{ a.message || a }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { Goods } from '@element-plus/icons-vue'

defineProps({
  materials: { type: Array, default: () => [] },
  equipment: { type: Array, default: () => [] },
  alerts: { type: Array, default: () => [] },
})

function statusClass(s) {
  return {
    running: 'text-emerald-600',
    idle: 'text-gray-500',
    maintenance: 'text-amber-600',
    broken: 'text-red-600',
  }[s] || 'text-gray-500'
}
function statusLabel(s) {
  return { running: '运行中', idle: '待机', maintenance: '维护', broken: '故障' }[s] || s
}
</script>

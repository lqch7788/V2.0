<!--
  农场 Hub 操作记录面板
  对标 V1.1 src/components/farm/hub/OperationRecordPanel.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon :size="18" color="#059669"><Tickets /></el-icon>
      今日操作记录 ({{ records?.length || 0 }})
    </h3>
    <el-empty v-if="!records?.length" description="暂无操作记录" />
    <el-timeline v-else>
      <el-timeline-item
        v-for="(r, idx) in records"
        :key="idx"
        :timestamp="r.time"
        placement="top"
        :color="getColor(r.type)"
      >
        <el-card shadow="never">
          <div class="font-semibold text-sm">{{ r.action }}</div>
          <p class="text-xs text-gray-500 mt-1">{{ r.description }}</p>
          <div class="text-xs text-gray-400 mt-1">操作人：{{ r.operator }}</div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { Tickets } from '@element-plus/icons-vue'

defineProps({
  records: { type: Array, default: () => [] },
})

const COLOR_MAP = { planting: '#10b981', fertilizer: '#f59e0b', harvest: '#3b82f6', inspection: '#8b5cf6' }
const getColor = (t) => COLOR_MAP[t] || '#9ca3af'
</script>
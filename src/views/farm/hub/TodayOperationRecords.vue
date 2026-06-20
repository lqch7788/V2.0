<!--
  农场 Hub 今日操作记录
  对标 V1.1 src/components/farm/hub/TodayOperationRecords.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon :size="18" color="#059669"><Calendar /></el-icon>
      今日农事 ({{ records?.length || 0 }} 条)
    </h3>
    <div v-if="!records?.length" class="text-center text-sm text-gray-500 py-6">
      暂无操作
    </div>
    <div v-else class="space-y-2">
      <div v-for="(r, idx) in records" :key="idx" class="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
        <el-tag :type="typeTagType(r.type)" size="small">{{ typeText(r.type) }}</el-tag>
        <div class="flex-1 min-w-0">
          <div class="text-sm truncate">{{ r.content }}</div>
          <div class="text-xs text-gray-400">{{ r.time }} - {{ r.operator }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar } from '@element-plus/icons-vue'

defineProps({
  records: { type: Array, default: () => [] },
})

const TYPE_MAP = {
  planting: { tag: 'success', text: '种植' },
  fertilizer: { tag: 'warning', text: '施肥' },
  irrigation: { tag: 'primary', text: '浇水' },
  harvest: { tag: 'info', text: '采收' },
}
const typeText = (t) => TYPE_MAP[t]?.text || t
const typeTagType = (t) => TYPE_MAP[t]?.tag || 'info'
</script>
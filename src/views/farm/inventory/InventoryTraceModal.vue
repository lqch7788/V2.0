<!--
  库存追溯弹窗
  对标 V1.1 src/components/farm/inventory/InventoryTraceModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="库存追溯" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="record">
      <el-descriptions :column="2" border class="mb-4">
        <el-descriptions-item label="物料编码">{{ record.code }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ record.name }}</el-descriptions-item>
        <el-descriptions-item label="批次">{{ record.batch }}</el-descriptions-item>
        <el-descriptions-item label="库存量">{{ record.stock }}</el-descriptions-item>
      </el-descriptions>
      <h4 class="font-semibold mb-2">流转记录</h4>
      <el-timeline>
        <el-timeline-item
          v-for="(event, idx) in traceEvents"
          :key="idx"
          :timestamp="event.time"
          placement="top"
          :color="eventColor(event.type)"
        >
          <el-card shadow="never">
            <div class="font-semibold">{{ event.title }}</div>
            <p class="text-xs text-gray-500 mt-1">{{ event.description }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  record: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const traceEvents = computed(() => [
  { time: '2026-06-15 10:00', type: 'inbound', title: '入库', description: '采购入库 100kg' },
  { time: '2026-06-18 14:30', type: 'outbound', title: '领用', description: '生产领用 30kg' },
  { time: '2026-06-19 09:15', type: 'transfer', title: '调拨', description: '从 A 仓调至 B 仓 20kg' },
])

const eventColor = (type) => {
  const map = { inbound: '#10b981', outbound: '#f59e0b', transfer: '#3b82f6' }
  return map[type] || '#9ca3af'
}
</script>
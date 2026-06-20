<!--
  追溯链条组件
  对标 V1.1 src/components/farm/trace/TraceChain.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3">追溯链条</h3>
    <el-timeline>
      <el-timeline-item
        v-for="(node, idx) in chain"
        :key="idx"
        :timestamp="node.time"
        placement="top"
        :color="getColor(node.type)"
      >
        <el-card shadow="never">
          <div class="flex items-center gap-2">
            <el-icon :size="18" :color="getColor(node.type)">
              <component :is="getIcon(node.type)" />
            </el-icon>
            <span class="font-semibold">{{ node.title }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ node.description }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { Box, Promotion, Ticket, VideoPlay } from '@element-plus/icons-vue'

defineProps({
  chain: { type: Array, default: () => [] },
})

const COLOR_MAP = { seed: '#10b981', plant: '#059669', harvest: '#f59e0b', sale: '#3b82f6' }
const ICON_MAP = { seed: Box, plant: VideoPlay, harvest: Promotion, sale: Ticket }

const getColor = (type) => COLOR_MAP[type] || '#9ca3af'
const getIcon = (type) => ICON_MAP[type] || Box
</script>
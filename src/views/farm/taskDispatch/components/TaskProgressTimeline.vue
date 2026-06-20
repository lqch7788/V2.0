<!--
  任务进度时间线
  对标 V1.1 src/components/farm/taskDispatch/components/TaskProgressTimeline.tsx
-->
<template>
  <div class="task-progress-timeline">
    <el-timeline>
      <el-timeline-item
        v-for="(step, idx) in steps"
        :key="idx"
        :timestamp="step.time"
        placement="top"
        :color="stepColor(step.status)"
      >
        <el-card shadow="never" class="!border">
          <div class="flex items-center gap-2">
            <el-icon :size="18" :color="stepColor(step.status)">
              <component :is="stepIcon(step.status)" />
            </el-icon>
            <span class="font-semibold">{{ step.label }}</span>
            <el-tag :type="stepTagType(step.status)" size="small">{{ step.statusText }}</el-tag>
          </div>
          <p v-if="step.remark" class="text-xs text-gray-500 mt-1">{{ step.remark }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { CircleCheck, Clock, VideoPlay } from '@element-plus/icons-vue'

defineProps({
  steps: { type: Array, default: () => [] },
})

const COLOR_MAP = {
  completed: '#10b981',
  executing: '#3b82f6',
  pending: '#9ca3af',
  failed: '#ef4444',
}
const ICON_MAP = { completed: CircleCheck, executing: VideoPlay, pending: Clock, failed: Clock }
const TAG_MAP = { completed: 'success', executing: 'primary', pending: 'info', failed: 'danger' }

const stepColor = (s) => COLOR_MAP[s] || '#9ca3af'
const stepIcon = (s) => ICON_MAP[s] || Clock
const stepTagType = (s) => TAG_MAP[s] || 'info'
</script>

<style scoped>
.task-progress-timeline :deep(.el-card) {
  border-radius: 8px;
}
</style>
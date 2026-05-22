<template>
  <div class="ui-timeline">
    <div v-for="(item, index) in items" :key="index" class="timeline-item">
      <!-- 节点 -->
      <div :class="['timeline-node', nodeClass(item.status)]">
        <el-icon v-if="item.status === 'completed'" :size="16"><Check /></el-icon>
        <el-icon v-else-if="item.status === 'processing'" :size="16"><Clock /></el-icon>
        <el-icon v-else :size="16"><More /></el-icon>
      </div>
      <!-- 连接线 -->
      <div v-if="index < items.length - 1" :class="['timeline-line', { 'is-completed': item.status === 'completed' }]" />
      <!-- 内容 -->
      <div class="timeline-content">
        <div class="timeline-header">
          <span :class="['timeline-title', { 'is-pending': item.status === 'pending' }]">{{ item.title }}</span>
          <span v-if="item.time" class="timeline-time">{{ item.time }}</span>
        </div>
        <div v-if="item.description" :class="['timeline-desc', { 'is-pending': item.status === 'pending' }]">
          {{ item.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Check, Clock, More } from '@element-plus/icons-vue'

defineProps({
  items: {
    type: Array,
    default: () => [
      { title: '步骤1', status: 'completed', time: '10:00', description: '已完成' },
      { title: '步骤2', status: 'processing', time: '11:00', description: '进行中' },
      { title: '步骤3', status: 'pending', time: '', description: '待处理' }
    ]
  }
})

const nodeClass = (status) => ({
  'node-completed': status === 'completed',
  'node-processing': status === 'processing',
  'node-pending': status === 'pending'
})
</script>

<style scoped>
.ui-timeline {
  width: 100%;
  position: relative;
}

.timeline-item {
  position: relative;
  padding-left: 2rem;
  padding-bottom: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-node {
  position: absolute;
  left: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.node-completed {
  border-color: #059669;
  color: #059669;
}

.node-processing {
  border-color: #3b82f6;
  color: #3b82f6;
  animation: pulse 2s infinite;
}

.node-pending {
  border-color: #d1d5db;
  color: #d1d5db;
}

.timeline-line {
  position: absolute;
  left: 15px;
  top: 32px;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-line.is-completed {
  background: #059669;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.timeline-title.is-pending {
  color: #9ca3af;
}

.timeline-time {
  font-size: 12px;
  color: #6b7280;
}

.timeline-desc {
  font-size: 14px;
  color: #6b7280;
  margin-top: 0.25rem;
}

.timeline-desc.is-pending {
  color: #d1d5db;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

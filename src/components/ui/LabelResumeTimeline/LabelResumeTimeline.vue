<template>
  <div class="ui-label-resume-timeline">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="timeline-item"
    >
      <div class="item-marker">
        <div :class="['marker-dot', item.status]" />
        <div v-if="index < items.length - 1" class="marker-line" />
      </div>
      <div class="item-content">
        <div class="content-header">
          <span class="content-title">{{ item.title }}</span>
          <span class="content-time">{{ item.time }}</span>
        </div>
        <div class="content-body">
          <slot :name="'body-' + index" :item="item">
            <div v-if="item.description" class="content-desc">{{ item.description }}</div>
            <div v-if="item.labels && item.labels.length" class="content-labels">
              <span v-for="label in item.labels" :key="label" class="label-tag">{{ label }}</span>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [
      {
        title: '简历投递',
        time: '2024-01-15',
        status: 'completed',
        description: '已投递简历',
        labels: ['已投递']
      },
      {
        title: '简历筛选',
        time: '2024-01-16',
        status: 'completed',
        description: '简历通过筛选',
        labels: ['通过']
      },
      {
        title: '面试邀请',
        time: '2024-01-18',
        status: 'processing',
        description: '等待面试',
        labels: ['待面试']
      }
    ]
  }
})
</script>

<style scoped>
.ui-label-resume-timeline {
  padding: 0.5rem 0;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.item-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid;
  background: white;
  z-index: 1;
}

.marker-dot.completed {
  border-color: #059669;
  background: #059669;
}

.marker-dot.processing {
  border-color: #3b82f6;
  background: #3b82f6;
  animation: pulse 2s infinite;
}

.marker-dot.pending {
  border-color: #d1d5db;
  background: white;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  margin-top: 4px;
}

.item-content {
  flex: 1;
  padding-top: -4px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.content-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.content-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.content-body {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.content-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.content-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.label-tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  color: #6b7280;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

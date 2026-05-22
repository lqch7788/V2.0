<template>
  <div class="ui-gantt">
    <!-- 时间轴头部 -->
    <div class="gantt-header">
      <div class="header-task-name">任务名称</div>
      <div class="header-timeline">
        <div
          v-for="date in timelineDates"
          :key="date"
          class="timeline-header-cell"
          :style="{ width: cellWidth + 'px' }"
        >
          {{ formatDate(date) }}
        </div>
      </div>
    </div>

    <!-- 任务行 -->
    <div class="gantt-body">
      <div v-for="task in tasks" :key="task.id" class="gantt-row">
        <div class="task-name">{{ task.name }}</div>
        <div class="task-timeline">
          <div
            class="gantt-bar"
            :style="getBarStyle(task)"
            :title="task.name + ': ' + formatDate(task.startDate) + ' - ' + formatDate(task.endDate)"
          >
            <div class="bar-progress" :style="{ width: task.progress + '%' }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  startDate: { type: Date, default: () => new Date() },
  endDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  cellWidth: { type: Number, default: 40 }
})

const timelineDates = computed(() => {
  const dates = []
  const current = new Date(props.startDate)
  while (current <= props.endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
})

const getBarStyle = (task) => {
  const start = new Date(task.startDate)
  const end = new Date(task.endDate)
  const totalDays = (props.endDate - props.startDate) / (24 * 60 * 60 * 1000)
  const startOffset = (start - props.startDate) / (24 * 60 * 60 * 1000)
  const duration = (end - start) / (24 * 60 * 60 * 1000)

  return {
    left: (startOffset * props.cellWidth) + 'px',
    width: (duration * props.cellWidth) + 'px'
  }
}

const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.ui-gantt {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.gantt-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-task-name {
  width: 200px;
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  border-right: 1px solid #e5e7eb;
}

.header-timeline {
  flex: 1;
  display: flex;
  overflow-x: auto;
}

.timeline-header-cell {
  flex-shrink: 0;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  border-right: 1px solid #f3f4f6;
}

.gantt-body {
  max-height: 400px;
  overflow-y: auto;
}

.gantt-row {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
}

.gantt-row:hover {
  background: #f9fafb;
}

.task-name {
  width: 200px;
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-timeline {
  flex: 1;
  position: relative;
  height: 48px;
  display: flex;
  align-items: center;
}

.gantt-bar {
  position: absolute;
  height: 24px;
  background: linear-gradient(to right, #10b981, #059669);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.15s;
}

.gantt-bar:hover {
  opacity: 0.85;
}

.bar-progress {
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.3s;
}
</style>

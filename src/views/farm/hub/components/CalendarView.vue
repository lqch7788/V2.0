<!--
  农场 Hub 日历视图
  对标 V1.1 src/components/farm/hub/components/CalendarView.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <el-calendar v-model="selectedDate">
      <template #date-cell="{ data }">
        <div class="calendar-cell" :class="{ 'has-task': hasTask(data.day) }">
          <span class="day-number">{{ data.day.split('-').slice(2).join('') }}</span>
          <div v-if="hasTask(data.day)" class="task-dot"></div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
})

const selectedDate = ref(new Date())

const hasTask = (day) => {
  return props.tasks.some((t) => t.date === day)
}
</script>

<style scoped>
.calendar-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.day-number {
  font-size: 14px;
}
.task-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #059669;
  margin-top: 4px;
}
.has-task {
  background: #f0fdf4;
  border-radius: 4px;
}
</style>
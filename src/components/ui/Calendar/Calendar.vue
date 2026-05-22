<template>
  <div class="ui-calendar">
    <!-- 月份导航 -->
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">
        <el-icon :size="20"><DArrowLeft /></el-icon>
      </button>
      <span class="calendar-title">{{ year }}年{{ month + 1 }}月</span>
      <button class="nav-btn" @click="nextMonth">
        <el-icon :size="20"><DArrowRight /></el-icon>
      </button>
    </div>

    <!-- 星期标题 -->
    <div class="calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <!-- 日期网格 -->
    <div class="calendar-grid">
      <div v-for="(date, index) in calendarDays" :key="index" class="calendar-cell">
        <button
          v-if="date"
          :class="['day-btn', dayClass(date)]"
          :disabled="isDisabled(date)"
          @click="handleDateClick(date)"
        >
          <span>{{ date.getDate() }}</span>
          <div v-if="hasEvent(date) && !isSelected(date)" class="event-dots">
            <span v-for="i in Math.min(hasEvent(date), 3)" :key="i" class="event-dot" />
          </div>
        </button>
      </div>
    </div>

    <!-- 事件列表 -->
    <div v-if="events.length > 0" class="calendar-events">
      <h4 class="events-title">本月事件</h4>
      <div v-for="(event, index) in monthEvents.slice(0, 5)" :key="index" class="event-item">
        <span class="event-dot" :style="{ background: event.color || '#059669' }" />
        <span class="event-text">{{ event.date.getDate() }}日 {{ event.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  selected: { type: Date, default: () => new Date() },
  events: { type: Array, default: () => [] }
})

const emit = defineEmits(['change', 'date-click'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const viewDate = ref(props.selected || new Date())

const year = computed(() => viewDate.value.getFullYear())
const month = computed(() => viewDate.value.getMonth())

const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value, 1)
  const lastDay = new Date(year.value, month.value + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()

  const days = []
  for (let i = 0; i < startingDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year.value, month.value, i))
  return days
})

const monthEvents = computed(() => {
  return props.events.filter(e => e.date.getMonth() === month.value && e.date.getFullYear() === year.value)
})

const today = new Date()

const isSelected = (date) => date.toDateString() === props.selected?.toDateString()

const isToday = (date) => date.toDateString() === today.toDateString()

const isDisabled = (date) => date < new Date(today.getFullYear(), today.getMonth(), today.getDate())

const hasEvent = (date) => props.events.filter(e => e.date.toDateString() === date.toDateString()).length

const dayClass = (date) => ({
  'is-selected': isSelected(date),
  'is-today': isToday(date),
  'is-disabled': isDisabled(date)
})

const handleDateClick = (date) => {
  emit('change', date)
  emit('date-click', date)
}

const prevMonth = () => viewDate.value = new Date(year.value, month.value - 1, 1)
const nextMonth = () => viewDate.value = new Date(year.value, month.value + 1, 1)
</script>

<style scoped>
.ui-calendar {
  width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.nav-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.nav-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.calendar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-cell {
  aspect-ratio: 1;
  padding: 0.125rem;
}

.day-btn {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.day-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.day-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.day-btn.is-selected {
  background: #059669;
  color: white;
}

.day-btn.is-today:not(.is-selected) {
  border: 1px solid #34d399;
}

.event-dots {
  position: absolute;
  bottom: 2px;
  display: flex;
  gap: 2px;
}

.event-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #059669;
}

.calendar-events {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.events-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>

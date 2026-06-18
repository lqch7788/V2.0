<!--
  ScheduleCalendarView.vue - 排班日历视图（月/周/日）
  V1.1 ScheduleCalendar.tsx 1:1 对齐
  从 Schedule.vue 提取（1454 行 → 多子组件拆分）
-->
<template>
  <div class="space-y-4">
    <!-- 日历工具栏：上一天/今天/下一天 + 月/周/日 切换 -->
    <div class="flex items-center justify-between bg-white rounded-lg shadow p-3">
      <div class="flex items-center gap-2">
        <el-button text @click="$emit('prev')">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button size="small" type="primary" plain @click="$emit('today')">今天</el-button>
        <el-button text @click="$emit('next')">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <span class="ml-4 text-lg font-semibold text-gray-800">
          {{ currentYear }}年{{ currentMonth }}月
        </span>
      </div>
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <el-button :type="viewMode === 'month' ? 'primary' : ''" size="small" @click="$emit('update:viewMode', 'month')">月</el-button>
        <el-button :type="viewMode === 'week' ? 'primary' : ''" size="small" @click="$emit('update:viewMode', 'week')">周</el-button>
        <el-button :type="viewMode === 'day' ? 'primary' : ''" size="small" @click="$emit('update:viewMode', 'day')">日</el-button>
      </div>
    </div>

    <!-- 月视图 -->
    <div v-if="viewMode === 'month'" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="grid grid-cols-7 bg-gray-50 border-b">
        <div v-for="day in weekdays" :key="day" class="py-2 text-center text-sm font-medium text-gray-600">
          {{ day }}
        </div>
      </div>
      <div class="grid grid-cols-7">
        <div
          v-for="dateStr in monthDateRange"
          :key="dateStr"
          @click="$emit('dateClick', dateStr)"
          :class="['min-h-24 border-b border-r border-gray-300 p-1 cursor-pointer transition-colors',
            selectedDay === dateStr ? 'bg-blue-500' : 'bg-blue-50 hover:bg-blue-100',
            !isCurrentMonth(dateStr) ? 'bg-gray-100' : '']"
        >
          <div :class="['text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
            isToday(dateStr) ? 'bg-red-500 text-white' : '',
            !isCurrentMonth(dateStr) ? 'text-gray-400' : selectedDay === dateStr ? 'text-white' : 'text-gray-700']">
            {{ formatMonthDay(dateStr) }}
          </div>
          <div class="space-y-0.5">
            <div
              v-for="schedule in getSchedulesForDate(dateStr).slice(0, 3)"
              :key="schedule.id"
              @click.stop="$emit('view', schedule)"
              :class="['text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer',
                getShiftColor(schedule.shift),
                schedule.status === '已取消' ? 'opacity-50 line-through' : '']"
            >
              {{ schedule.staffName || schedule.staff_name }} {{ schedule.shift }}
            </div>
            <div v-if="getSchedulesForDate(dateStr).length > 3" class="text-xs text-gray-500 px-1">
              +{{ getSchedulesForDate(dateStr).length - 3 }} 更多
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-else-if="viewMode === 'week'" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="grid grid-cols-7 bg-gray-50 border-b">
        <div v-for="day in weekDays" :key="day.date"
          :class="['py-3 text-center cursor-pointer transition-colors',
            selectedDay === day.date ? 'bg-blue-500 text-white' : 'bg-blue-50 hover:bg-blue-100']"
          @click="$emit('update:selectedDay', day.date)">
          <div :class="['text-xs mb-1', selectedDay === day.date ? 'text-white/80' : 'text-gray-500']">{{ day.weekday }}</div>
          <div :class="['text-lg font-medium w-8 h-8 mx-auto flex items-center justify-center rounded-full',
            isToday(day.date) ? 'bg-red-500 text-white' : selectedDay === day.date ? 'text-white' : 'text-gray-700']">
            {{ day.day }}
          </div>
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-800 mb-3">{{ formatWeekdayTitle(selectedDay) }}</h3>
        <div v-if="getSchedulesForDate(selectedDay).length === 0" class="text-gray-400 text-center py-8">暂无排班</div>
        <div v-else class="space-y-2">
          <div v-for="schedule in getSchedulesForDate(selectedDay)" :key="schedule.id"
            @click="$emit('view', schedule)"
            :class="['flex items-center justify-between p-3 rounded-lg border cursor-pointer',
              schedule.status === '已取消' ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50',
              schedule.status === '已执行' ? 'border-green-200' : 'border-gray-200']">
            <div class="flex items-center gap-3">
              <div :class="['w-2 h-2 rounded-full', getShiftColor(schedule.shift)]" />
              <div>
                <div class="font-medium text-gray-800">{{ getStaffName(schedule) }}</div>
                <div class="text-sm text-gray-500">{{ getWorkZone(schedule) }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-700">{{ schedule.shift }}</div>
              <div class="text-sm text-gray-500">{{ getShiftTime(schedule.shift) }}</div>
            </div>
            <span :class="['px-2 py-1 rounded text-xs', getStatusClass(schedule.status)]">
              {{ schedule.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日视图 -->
    <div v-else-if="viewMode === 'day'" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b">
        <h3 class="text-xl font-medium text-gray-800">{{ formatDayTitle(selectedDay) }}</h3>
      </div>
      <div class="p-4">
        <div v-if="getSchedulesForDate(selectedDay).length === 0" class="text-gray-400 text-center py-12">暂无排班</div>
        <div v-else class="space-y-3">
          <div v-for="schedule in getSchedulesForDate(selectedDay)" :key="schedule.id"
            @click="$emit('view', schedule)"
            :class="['p-4 rounded-lg border cursor-pointer',
              schedule.status === '已取消' ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50',
              schedule.status === '已执行' ? 'border-green-200' : 'border-gray-200']">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div :class="['w-3 h-3 rounded', getShiftColor(schedule.shift)]" />
                <span class="font-medium text-gray-800">{{ getStaffName(schedule) }}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-600">{{ getWorkZone(schedule) }}</span>
              </div>
              <span :class="['px-3 py-1 rounded-full text-sm', getStatusClass(schedule.status)]">
                {{ schedule.status }}
              </span>
            </div>
            <div class="mt-2 flex items-center gap-6 text-sm text-gray-500">
              <span>班次: {{ schedule.shift }}</span>
              <span>时间: {{ getShiftTime(schedule.shift) }}</span>
              <span v-if="schedule.checkIn">签到: {{ schedule.checkIn }}</span>
              <span v-if="schedule.checkOut">签退: {{ schedule.checkOut }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  viewMode: { type: String, default: 'month' },
  selectedDay: { type: String, required: true },
  currentYear: { type: Number, required: true },
  currentMonth: { type: Number, required: true },
  weekdays: { type: Array, required: true },
  monthDateRange: { type: Array, required: true },
  weekDays: { type: Array, required: true },
  schedules: { type: Array, default: () => [] },
  isCurrentMonth: { type: Function, required: true },
  isToday: { type: Function, required: true },
  formatMonthDay: { type: Function, required: true },
  formatWeekdayTitle: { type: Function, required: true },
  formatDayTitle: { type: Function, required: true },
  getSchedulesForDate: { type: Function, required: true },
  getShiftColor: { type: Function, required: true },
  getShiftTime: { type: Function, required: true },
  getStaffName: { type: Function, required: true },
  getWorkZone: { type: Function, required: true },
  getStatusClass: { type: Function, required: true },
})

defineEmits(['prev', 'next', 'today', 'view', 'dateClick', 'update:viewMode', 'update:selectedDay'])
</script>

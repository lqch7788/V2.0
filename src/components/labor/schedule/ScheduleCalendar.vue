<template>
  <div class="space-y-4">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button text @click="handlePrev">
          <el-icon :size="20" class="text-gray-600"><ArrowLeft /></el-icon>
        </el-button>
        <el-button text @click="handleToday" class="text-blue-600">今天</el-button>
        <el-button text @click="handleNext">
          <el-icon :size="20" class="text-gray-600"><ArrowRight /></el-icon>
        </el-button>
        <div class="ml-4 text-lg font-medium text-gray-800">
          {{ formatDate(selectedDate) }}
        </div>
      </div>

      <!-- 视图切换 -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <el-button
          :type="viewMode === 'month' ? 'primary' : ''"
          size="small"
          @click="onViewModeChange('month')"
        >月</el-button>
        <el-button
          :type="viewMode === 'week' ? 'primary' : ''"
          size="small"
          @click="onViewModeChange('week')"
        >周</el-button>
        <el-button
          :type="viewMode === 'day' ? 'primary' : ''"
          size="small"
          @click="onViewModeChange('day')"
        >日</el-button>
      </div>
    </div>

    <!-- 月视图 -->
    <div v-if="viewMode === 'month'" class="bg-white rounded-lg shadow overflow-hidden">
      <!-- 星期标题 -->
      <div class="grid grid-cols-7 bg-gray-50 border-b">
        <div
          v-for="day in weekdays"
          :key="day"
          class="py-2 text-center text-sm font-medium text-gray-600"
        >
          {{ day }}
        </div>
      </div>
      <!-- 日期网格 -->
      <div class="grid grid-cols-7">
        <div
          v-for="dateStr in monthDateRange"
          :key="dateStr"
          @click="onDateChange(dateStr)"
          :class="[
            'min-h-24 border-b border-r p-1 cursor-pointer transition-colors',
            isSelected(dateStr) ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'hover:bg-gray-50',
            !isCurrentMonth(dateStr) ? 'bg-gray-50' : ''
          ]"
        >
          <div :class="[
            'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
            isToday(dateStr) ? 'bg-red-500 text-white' : '',
            !isCurrentMonth(dateStr) ? 'text-gray-400' : 'text-gray-700'
          ]">
            {{ formatDay(dateStr) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-else-if="viewMode === 'week'" class="bg-white rounded-lg shadow overflow-hidden p-4">
      <div class="text-center text-lg font-medium text-gray-800 mb-4">
        {{ formatDate(selectedDate) }}
      </div>
      <div class="text-gray-400 text-center py-8">周视图 - 待实现</div>
    </div>

    <!-- 日视图 -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden p-4">
      <div class="text-xl font-medium text-gray-800 mb-4">
        {{ formatDate(selectedDate) }}
      </div>
      <div class="text-gray-400 text-center py-12">日视图 - 待实现</div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

type ViewMode = 'month' | 'week' | 'day'

const props = defineProps({})

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}

const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  return date.getDate()
}

const isToday = (dateStr) => {
  return dateStr === new Date().toISOString().split('T')[0]
}

const isSelected = (dateStr) => {
  return dateStr === props.selectedDate
}

const isCurrentMonth = (dateStr) => {
  const date = new Date(dateStr)
  const selected = new Date(props.selectedDate)
  return date.getMonth() === selected.getMonth() && date.getFullYear() === selected.getFullYear()
}

const handlePrev = () => {
  const date = new Date(props.selectedDate)
  if (props.viewMode === 'day') {
    date.setDate(date.getDate() - 1)
  } else if (props.viewMode === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setMonth(date.getMonth() - 1)
  }
  props.onDateChange(date.toISOString().split('T')[0])
}

const handleNext = () => {
  const date = new Date(props.selectedDate)
  if (props.viewMode === 'day') {
    date.setDate(date.getDate() + 1)
  } else if (props.viewMode === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setMonth(date.getMonth() + 1)
  }
  props.onDateChange(date.toISOString().split('T')[0])
}

const handleToday = () => {
  props.onDateChange(new Date().toISOString().split('T')[0])
}
</script>

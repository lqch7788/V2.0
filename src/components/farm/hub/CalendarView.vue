<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <!-- 日历头部导航 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button
          class="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors"
          @click="goToPrevious"
        >
          <ChevronLeft class="w-5 h-5 text-gray-600" />
        </button>
        <button
          class="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors"
          @click="goToNext"
        >
          <ChevronRight class="w-5 h-5 text-gray-600" />
        </button>
        <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
        <button
          class="px-3 py-1 text-sm rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
          @click="goToToday"
        >
          今天
        </button>
      </div>

      <!-- 视图切换 -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          v-for="type in viewTypes"
          :key="type"
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="viewType === type
            ? 'bg-white text-emerald-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'"
          @click="viewType = type"
        >
          {{ type === 'day' ? '日' : type === 'week' ? '周' : '月' }}
        </button>
      </div>
    </div>

    <!-- 日历内容 -->
    <div class="mt-4">
      <!-- ========== 日视图 ========== -->
      <template v-if="viewType === 'day'">
        <div class="space-y-4">
          <template v-if="dayTasks.length === 0">
            <div class="text-center py-12 text-gray-400">
              <CalendarIcon class="w-12 h-12 mx-auto mb-2" />
              <p>当天没有任务安排</p>
            </div>
          </template>
          <template v-else>
            <div class="space-y-3">
              <div
                v-for="task in dayTasks"
                :key="task.id"
                class="p-4 rounded-xl border border-gray-100 hover:shadow-md cursor-pointer transition-shadow"
                :class="taskCardBg(task.status)"
                @click="onSelectTask?.(task)"
              >
                <!-- 任务头部：类型图标 + 标题 + 状态 -->
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-3">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      :class="getTypeColorClass(task.typeName)"
                    >
                      <Clock class="w-5 h-5" />
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ task.greenhouseName || task.fieldName || '' }}
                        <span v-if="task.assigneeName"> &middot; {{ task.assigneeName }}</span>
                        <span v-else> &middot; 未分配</span>
                      </p>
                    </div>
                  </div>
                  <span
                    class="px-2 py-1 rounded-full text-xs"
                    :class="[
                      statusColors[task.status]?.bg || 'bg-gray-100',
                      statusColors[task.status]?.text || 'text-gray-600',
                    ]"
                  >
                    {{ task.statusName || task.status }}
                  </span>
                </div>
                <!-- 任务信息：计划日期 + 进度 -->
                <div class="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span>计划：{{ task.dueDate || '未设置' }}</span>
                  <span>进度：{{ task.progress || 0 }}%</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- ========== 周视图 ========== -->
      <template v-if="viewType === 'week'">
        <div class="overflow-x-auto">
          <div class="min-w-[700px]">
            <!-- 星期头部 -->
            <div class="grid grid-cols-7 gap-2 mb-2">
              <div
                v-for="(day, i) in weekDays"
                :key="i"
                class="text-center py-2 rounded-lg"
                :class="isToday(day) ? 'bg-emerald-100' : 'bg-gray-50'"
              >
                <div class="text-xs text-gray-500">{{ WEEK_DAYS_ZH[i] }}</div>
                <div
                  class="text-lg font-medium"
                  :class="isToday(day) ? 'text-emerald-600' : 'text-gray-900'"
                >
                  {{ format(day, 'd') }}
                </div>
              </div>
            </div>

            <!-- 任务网格 -->
            <div class="grid grid-cols-7 gap-2 min-h-[400px]">
              <div
                v-for="(day, dayIndex) in weekDays"
                :key="dayIndex"
                class="rounded-lg p-2 min-h-[400px] cursor-pointer transition-colors"
                :class="isToday(day)
                  ? 'bg-emerald-50 border-2 border-emerald-200'
                  : 'bg-gray-50 hover:bg-gray-100'"
                @click="handleSelectDate(day)"
              >
                <div class="space-y-1">
                  <template v-if="getTasksForDate(day).length === 0">
                    <div class="text-center text-gray-300 text-xs py-4">-</div>
                  </template>
                  <template v-else>
                    <div
                      v-for="task in getTasksForDate(day).slice(0, 5)"
                      :key="task.id"
                      class="px-2 py-1 rounded text-xs text-white truncate cursor-pointer"
                      :class="getTypeColorClass(task.typeName)"
                      :title="`${task.title} - ${task.greenhouseName || ''}`"
                      @click.stop="onSelectTask?.(task)"
                    >
                      {{ task.title || task.typeName || '任务' }}
                    </div>
                    <div
                      v-if="getTasksForDate(day).length > 5"
                      class="text-xs text-gray-500 text-center"
                    >
                      +{{ getTasksForDate(day).length - 5 }} 更多
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ========== 月视图 ========== -->
      <template v-if="viewType === 'month'">
        <div class="overflow-x-auto">
          <div class="min-w-[700px]">
            <!-- 星期头部 -->
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div
                v-for="(day, i) in WEEK_DAYS_ZH"
                :key="i"
                class="text-center py-2 bg-gray-50 rounded-lg"
              >
                <div class="text-sm font-medium text-gray-600">{{ day }}</div>
              </div>
            </div>

            <!-- 日期网格 -->
            <div class="space-y-1">
              <div
                v-for="(week, weekIndex) in monthWeeks"
                :key="weekIndex"
                class="grid grid-cols-7 gap-1"
              >
                <div
                  v-for="(day, dayIndex) in week"
                  :key="dayIndex"
                  class="min-h-[80px] p-2 rounded-lg cursor-pointer transition-colors"
                  :class="monthCellClass(day)"
                  @click="handleSelectDate(day)"
                >
                  <div
                    class="text-sm font-medium mb-1"
                    :class="isToday(day) ? 'text-emerald-600' : 'text-gray-700'"
                  >
                    {{ format(day, 'd') }}
                  </div>
                  <div class="space-y-0.5">
                    <div
                      v-for="task in getTasksForDate(day).slice(0, 3)"
                      :key="task.id"
                      class="px-1 py-0.5 rounded text-xs text-white truncate"
                      :class="getTypeColorClass(task.typeName)"
                      :title="task.title"
                      @click.stop="onSelectTask?.(task)"
                    >
                      {{ task.title }}
                    </div>
                    <div
                      v-if="getTasksForDate(day).length > 3"
                      class="text-xs text-gray-500"
                    >
                      +{{ getTasksForDate(day).length - 3 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
/**
 * 日历视图组件
 * 功能：按日/周/月展示任务安排
 * 从 V1.1 CalendarView.tsx 1:1 映射转换
 */
import { ref, computed } from 'vue'
import {
  format,
  isSameDay,
  parseISO,
  eachDayOfInterval,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-vue-next'
import { TASK_TYPES } from '@/constants/taskDispatch'
// ========== Props ==========
const props = defineProps({
  /** 任务列表 */
  tasks: {
    type: Array,
    default: () => [],
  },
  /** 选中任务回调 */
  onSelectTask: {
    type: Function,
    default: undefined,
  },
  /** 选中日期回调 */
  onSelectDate: {
    type: Function,
    default: undefined,
  },
})

// ========== 常量 ==========
/** 视图类型选项 */
const viewTypes = ['day', 'week', 'month']

/** 中文星期标题（周一为起始） */
const WEEK_DAYS_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/** 任务类型预设颜色（哈希兜底用） */
const PRESET_TYPE_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
]

/**
 * 状态颜色映射（用于日视图任务卡片的状态徽章）
 * 与 V1.1 完全一致
 */
const statusColors = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  pending: { bg: 'bg-blue-100', text: 'text-blue-600' },
  accepted: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  waiting_acceptance: { bg: 'bg-purple-100', text: 'text-purple-600' },
  completed: { bg: 'bg-green-100', text: 'text-green-600' },
  rejected: { bg: 'bg-red-100', text: 'text-red-600' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-400' },
  abandoned: { bg: 'bg-orange-100', text: 'text-orange-600' },
}

// ========== 响应式状态 ==========
/** 当前视图类型 */
const viewType = ref('week')

/** 当前导航日期 */
const currentDate = ref(new Date())

/** 选中的日期 */
const selectedDate = ref(null)

// ========== 工具函数 ==========

/**
 * 获取某天的所有任务
 * @param {Date} date - 目标日期
 * @returns {import('vue').ComputedRef<Task[]>} - 该日期的任务列表
 */
function getTasksForDate(date) {
  return props.tasks.filter((task) => {
    try {
      if (!task.dueDate) return false
      const taskDate = parseISO(task.dueDate)
      return isSameDay(taskDate, date)
    } catch {
      return false
    }
  })
}

/**
 * 获取任务类型的 CSS 背景色类名
 * 优先从 TASK_TYPES 查找匹配（按 value 或 label），找不到则用哈希兜底
 * @param {string} typeName - 任务类型名称
 * @returns {string} CSS 类名（如 'bg-green-500'）
 */
function getTypeColorClass(typeName) {
  if (!typeName) return PRESET_TYPE_COLORS[0]
  // 优先从 TASK_TYPES 查找
  const found = TASK_TYPES.find((t) => t.value === typeName || t.label === typeName)
  if (found) return found.color
  // 兜底：哈希取色
  const hash = typeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PRESET_TYPE_COLORS[hash % PRESET_TYPE_COLORS.length]
}

// ========== 计算属性 ==========

/** 日历标题 */
const title = computed(() => {
  if (viewType.value === 'day') {
    return format(currentDate.value, 'yyyy年M月d日 EEEE', { locale: zhCN })
  } else if (viewType.value === 'week') {
    const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })
    const weekEndRaw = addDays(weekStart, 6)
    return `${format(weekStart, 'M月d日', { locale: zhCN })} - ${format(weekEndRaw, 'M月d日', { locale: zhCN })}`
  } else {
    return format(currentDate.value, 'yyyy年M月', { locale: zhCN })
  }
})

/** 日视图的任务列表 */
const dayTasks = computed(() => {
  const date = selectedDate.value || currentDate.value
  return getTasksForDate(date)
})

/** 周视图的 7 天数组（周一~周日） */
const weekDays = computed(() => {
  const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
})

/** 月视图的周数组（二维数组，每行 7 天） */
const monthWeeks = computed(() => {
  const monthStart = startOfMonth(currentDate.value)
  const monthEnd = endOfMonth(currentDate.value)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = startOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: addDays(calendarEnd, 6) })
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
})

// ========== 任务卡背景色 ==========
/** 根据任务状态返回日视图卡片的背景色 */
function taskCardBg(status) {
  const map = {
    completed: 'bg-gray-50',
    in_progress: 'bg-blue-50',
    pending: 'bg-white',
    rejected: 'bg-red-50',
  }
  return map[status] || 'bg-orange-50'
}

// ========== 月视图单元格样式 ==========
/** 返回月视图日期单元格的样式类 */
function monthCellClass(day) {
  const currentMonth = currentDate.value
  if (!isSameMonth(day, currentMonth)) return 'bg-gray-50 text-gray-300'
  if (isToday(day)) return 'bg-emerald-100 hover:bg-emerald-200'
  return 'bg-gray-50 hover:bg-gray-100'
}

// ========== 导航函数 ==========
/** 回到上一段（日:前一天 / 周:前一周 / 月:前一月） */
function goToPrevious() {
  if (viewType.value === 'day') {
    currentDate.value = addDays(currentDate.value, -1)
  } else if (viewType.value === 'week') {
    currentDate.value = subWeeks(currentDate.value, 1)
  } else {
    currentDate.value = subMonths(currentDate.value, 1)
  }
}

/** 前进到下一段（日:后一天 / 周:后一周 / 月:后一月） */
function goToNext() {
  if (viewType.value === 'day') {
    currentDate.value = addDays(currentDate.value, 1)
  } else if (viewType.value === 'week') {
    currentDate.value = addWeeks(currentDate.value, 1)
  } else {
    currentDate.value = addMonths(currentDate.value, 1)
  }
}

/** 回到今天 */
function goToToday() {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

/** 选中某一天，月视图点击时自动切换到日视图 */
function handleSelectDate(date) {
  selectedDate.value = date
  currentDate.value = date
  if (viewType.value === 'month') {
    viewType.value = 'day'
  }
  props.onSelectDate?.(date)
}
</script>

<style scoped>
/* 日历视图组件样式 - 主要依赖 Tailwind，此处仅补充必要样式 */
</style>

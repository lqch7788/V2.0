<template>
  <!-- 汇总表日期筛选器组件 -->
  <div class="flex flex-wrap items-center gap-3">
    <!-- 模式切换分段按钮组 -->
    <div class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
      <el-button
        v-for="opt in MODE_OPTIONS"
        :key="opt.value"
        :type="mode === opt.value ? 'primary' : ''"
        :class="[
          '!border-none !rounded-md transition-colors',
          mode === opt.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        ]"
        size="small"
        @click="handleModeChange(opt.value)"
      >
        {{ opt.label }}
      </el-button>
    </div>

    <!-- 自定义日期范围输入 -->
    <div v-if="mode === 'custom'" class="flex items-center gap-2">
      <el-date-picker
        v-model="startDateLocal"
        type="date"
        placeholder="开始日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :clearable="false"
        @change="handleDateChange"
      />
      <span class="text-gray-400 text-sm">至</span>
      <el-date-picker
        v-model="endDateLocal"
        type="date"
        placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :clearable="false"
        @change="handleDateChange"
      />
      <el-icon class="text-gray-400"><Calendar /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Calendar } from '@element-plus/icons-vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'month'
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:mode', 'update:startDate', 'update:endDate', 'change'])

const MODE_OPTIONS = [
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年度' },
  { value: 'custom', label: '自定义' },
]

// 本地日期状态
const startDateLocal = ref(props.startDate)
const endDateLocal = ref(props.endDate)

// 监听外部日期变化
watch(() => props.startDate, (val) => { startDateLocal.value = val })
watch(() => props.endDate, (val) => { endDateLocal.value = val })

// 模式切换
const handleModeChange = (mode) => {
  emit('update:mode', mode)

  if (mode !== 'custom') {
    const range = getDateRange(mode)
    startDateLocal.value = range.start
    endDateLocal.value = range.end
    emit('update:startDate', range.start)
    emit('update:endDate', range.end)
    emit('change', mode, range.start, range.end)
  }
}

// 日期变化
const handleDateChange = () => {
  emit('update:startDate', startDateLocal.value)
  emit('update:endDate', endDateLocal.value)
  emit('change', 'custom', startDateLocal.value, endDateLocal.value)
}

// 获取日期范围
function getDateRange(mode) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  switch (mode) {
    case 'month': {
      const lastDay = new Date(year, month, 0).getDate()
      return {
        start: `${year}-${String(month).padStart(2, '0')}-01`,
        end: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
      }
    }
    case 'quarter': {
      const q = Math.floor((month - 1) / 3)
      const qStartMonth = q * 3 + 1
      const qEndMonth = q * 3 + 3
      const lastDay = new Date(year, qEndMonth, 0).getDate()
      return {
        start: `${year}-${String(qStartMonth).padStart(2, '0')}-01`,
        end: `${year}-${String(qEndMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
      }
    }
    case 'year':
    default:
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      }
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    <div class="flex items-center gap-4 flex-wrap">
      <!-- 时间范围 -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">时间:</span>
        <el-date-picker
          v-model="localDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
          value-format="YYYY-MM-DD"
          @change="handleDateRangeChange"
        />
      </div>

      <!-- 快捷筛选按钮 -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <el-button
          v-for="period in ['本周', '本月', '本季', '本年']"
          :key="period"
          size="small"
          :type="quickFilterPeriod === period ? 'primary' : 'default'"
          :plain="quickFilterPeriod !== period"
          @click="handleQuickFilter(period)"
        >
          {{ period }}
        </el-button>
      </div>

      <!-- 重置按钮 -->
      <el-button size="default" @click="handleReset">
        <el-icon><RefreshRight /></el-icon>
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'

const props = defineProps({
  dateRange: { type: Array, default: () => [] },
  quickFilterPeriod: { type: String, default: '' }
})

const emit = defineEmits(['update:dateRange', 'update:quickFilterPeriod', 'reset'])

const localDateRange = ref(props.dateRange)

watch(() => props.dateRange, (val) => { localDateRange.value = val })

const handleDateRangeChange = (val) => {
  emit('update:dateRange', val || [])
}

const handleQuickFilter = (period) => {
  emit('update:quickFilterPeriod', period)
}

const handleReset = () => {
  localDateRange.value = []
  emit('reset')
}
</script>

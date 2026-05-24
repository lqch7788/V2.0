<template>
  <div class="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg">
    <!-- 搜索框 -->
    <div v-if="config.search" class="flex-1 min-w-[200px]">
      <div class="relative">
        <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="16">
          <Search />
        </el-icon>
        <el-input
          v-model="localSearch"
          type="text"
          :placeholder="config.search.placeholder || '搜索...'"
          clearable
          class="pl-9"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 日期范围 -->
    <div v-if="config.dateRange" class="flex items-center gap-2">
      <el-date-picker
        v-model="startDate"
        type="date"
        :placeholder="config.dateRange.startPlaceholder || '开始日期'"
        value-format="YYYY-MM-DD"
        style="width: 140px"
        @change="(val) => handleDateChange('start', val)"
      />
      <span class="text-gray-400">-</span>
      <el-date-picker
        v-model="endDate"
        type="date"
        :placeholder="config.dateRange.endPlaceholder || '结束日期'"
        value-format="YYYY-MM-DD"
        style="width: 140px"
        @change="(val) => handleDateChange('end', val)"
      />
    </div>

    <!-- 状态下拉框 -->
    <div v-if="config.status" class="w-40">
      <el-select
        v-model="localStatus"
        :placeholder="config.status.placeholder || '选择状态'"
        clearable
        @change="handleStatusChange"
      >
        <el-option
          v-for="option in config.status.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
          <div class="flex items-center gap-2">
            <span v-if="option.color" class="w-2 h-2 rounded-full" :style="{ backgroundColor: option.color }" />
            {{ option.label }}
          </div>
        </el-option>
      </el-select>
    </div>

    <!-- 自定义筛选 -->
    <div v-if="config.customFilters" class="flex items-center gap-2">
      <slot name="customFilters" />
    </div>

    <!-- 重置按钮 -->
    <el-button
      v-if="hasFilters && onReset"
      text
      @click="handleReset"
    >
      <el-icon><Close /></el-icon>
      重置
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      search: { value: '', onChange: null },
      dateRange: { value: { start: '', end: '' }, onChange: null },
      status: { value: '', options: [], onChange: null },
      customFilters: null
    })
  },
  onReset: Function,
  className: {
    type: String,
    default: ''
  }
})

const localSearch = ref(props.config.search?.value || '')
const localStatus = ref(props.config.status?.value || '')
const startDate = ref(props.config.dateRange?.value?.start || '')
const endDate = ref(props.config.dateRange?.value?.end || '')

const hasFilters = computed(() => {
  return localSearch.value || startDate.value || endDate.value || localStatus.value
})

const handleSearch = (value) => {
  props.config.search?.onChange?.(value)
}

const handleDateChange = (type, value) => {
  const newRange = {
    start: type === 'start' ? value : startDate.value || null,
    end: type === 'end' ? value : endDate.value || null
  }
  props.config.dateRange?.onChange?.(newRange)
}

const handleStatusChange = (value) => {
  props.config.status?.onChange?.(value)
}

const handleReset = () => {
  localSearch.value = ''
  localStatus.value = ''
  startDate.value = ''
  endDate.value = ''
  props.onReset?.()
}
</script>

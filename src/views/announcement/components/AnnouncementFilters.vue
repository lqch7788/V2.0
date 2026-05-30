<template>
  <!-- 公告筛选器组件 -->
  <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
    <div class="flex flex-wrap items-end gap-4">
      <!-- 公告标题搜索 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">公告标题</label>
        <el-input
          v-model="localSearch"
          placeholder="搜索公告标题..."
          clearable
          @input="handleSearchChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 类型筛选 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">公告类型</label>
        <el-select v-model="localType" placeholder="全部类型" @change="handleTypeChange">
          <el-option label="全部类型" value="全部" />
          <el-option label="经营方向" value="经营方向" />
          <el-option label="产量目标" value="产量目标" />
          <el-option label="成本控制" value="成本控制" />
          <el-option label="效益分析" value="效益分析" />
        </el-select>
      </div>

      <!-- 开始日期 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
        <el-date-picker
          v-model="localStartDate"
          type="date"
          placeholder="选择开始日期"
          value-format="YYYY-MM-DD"
          @change="handleStartDateChange"
        />
      </div>

      <!-- 结束日期 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <el-date-picker
          v-model="localEndDate"
          type="date"
          placeholder="选择结束日期"
          value-format="YYYY-MM-DD"
          @change="handleEndDateChange"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <el-button size="small" @click="handleReset">重置</el-button>
        <el-button size="small" type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <!-- 插槽（导出/发布按钮） -->
      <div v-if="$slots.default" class="flex items-center gap-3 ml-auto">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

// Props 定义
const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  typeFilter: {
    type: String,
    default: '全部'
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

// Emits 定义
const emit = defineEmits([
  'update:searchKeyword',
  'update:typeFilter',
  'update:startDate',
  'update:endDate',
  'searchChange',
  'typeChange',
  'startDateChange',
  'endDateChange',
  'reset'
])

// 本地副本
const localSearch = ref(props.searchKeyword)
const localType = ref(props.typeFilter)
const localStartDate = ref(props.startDate)
const localEndDate = ref(props.endDate)

// 监听 props 变化同步本地值
watch(() => props.searchKeyword, (val) => { localSearch.value = val })
watch(() => props.typeFilter, (val) => { localType.value = val })
watch(() => props.startDate, (val) => { localStartDate.value = val })
watch(() => props.endDate, (val) => { localEndDate.value = val })

// 搜索处理
const handleSearchChange = (val) => {
  emit('update:searchKeyword', val)
  emit('searchChange', val)
}

// 类型切换处理
const handleTypeChange = (val) => {
  emit('update:typeFilter', val)
  emit('typeChange', val)
}

// 开始日期处理
const handleStartDateChange = (val) => {
  emit('update:startDate', val)
  emit('startDateChange', val)
}

// 结束日期处理
const handleEndDateChange = (val) => {
  emit('update:endDate', val)
  emit('endDateChange', val)
}

// 重置处理
const handleReset = () => {
  localSearch.value = ''
  localType.value = '全部'
  localStartDate.value = ''
  localEndDate.value = ''
  emit('update:searchKeyword', '')
  emit('update:typeFilter', '全部')
  emit('update:startDate', '')
  emit('update:endDate', '')
  emit('reset')
}

const handleSearch = () => {
  emit('searchChange', localSearch.value)
}
</script>

<style scoped>
</style>

<!--
  通用审批筛选器组件
  对标 V1.1 src/components/approval/ApprovalFilters.tsx (230 行)
  功能：关键词搜索 + 高级筛选（类型/状态/类别/优先级/日期范围）
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <!-- 基础筛选 -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-[240px] relative">
        <el-icon class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" color="#9ca3af">
          <Search />
        </el-icon>
        <el-input
          v-model="localKeyword"
          placeholder="搜索单号、标题、申请人..."
          clearable
          class="!pl-9"
          @keyup.enter="handleKeywordSearch"
          @clear="handleKeywordSearch"
        />
      </div>
      <el-button @click="handleKeywordSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button
        :type="showAdvanced || hasActiveFilters ? 'primary' : 'default'"
        @click="showAdvanced = !showAdvanced"
      >
        <el-icon><Filter /></el-icon>
        高级筛选
      </el-button>
      <el-button v-if="hasActiveFilters" type="warning" @click="handleReset">
        <el-icon><Close /></el-icon>
        清除筛选
      </el-button>
    </div>

    <!-- 高级筛选 -->
    <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-gray-200 space-y-4">
      <!-- 审批类型 -->
      <div>
        <div class="text-sm text-gray-700 mb-2">审批类型</div>
        <div class="flex flex-wrap gap-2">
          <el-button
            v-for="opt in approvalTypeOptions"
            :key="opt.value"
            :type="filters.type?.includes(opt.value) ? 'primary' : 'default'"
            size="small"
            @click="toggleArrayFilter('type', opt.value, filters.type)"
          >
            {{ opt.label }}
          </el-button>
        </div>
      </div>

      <!-- 审批状态 -->
      <div>
        <div class="text-sm text-gray-700 mb-2">审批状态</div>
        <div class="flex flex-wrap gap-2">
          <el-button
            v-for="opt in statusOptions"
            :key="opt.value"
            :type="filters.status?.includes(opt.value) ? 'primary' : 'default'"
            size="small"
            @click="toggleArrayFilter('status', opt.value, filters.status)"
          >
            {{ opt.label }}
          </el-button>
        </div>
      </div>

      <!-- 优先级 -->
      <div>
        <div class="text-sm text-gray-700 mb-2">优先级</div>
        <div class="flex flex-wrap gap-2">
          <el-button
            v-for="opt in priorityOptions"
            :key="opt.value"
            :type="filters.priority?.includes(opt.value) ? 'primary' : 'default'"
            size="small"
            @click="toggleArrayFilter('priority', opt.value, filters.priority)"
          >
            {{ opt.label }}
          </el-button>
        </div>
      </div>

      <!-- 申请日期范围 -->
      <div>
        <div class="text-sm text-gray-700 mb-2">申请日期</div>
        <el-date-picker
          v-model="localDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Close, Filter, Search } from '@element-plus/icons-vue'

const props = defineProps({
  filters: { type: Object, required: true },
})

const emit = defineEmits(['search', 'filter-change', 'reset'])

// 本地状态
const localKeyword = ref(props.filters.keyword || '')
const localDateRange = ref(props.filters.dateRange || [])
const showAdvanced = ref(false)

// 选项
const approvalTypeOptions = [
  { value: 'material_request', label: '领料申请' },
  { value: 'return_material', label: '退料申请' },
  { value: 'purchase_request', label: '采购申请' },
  { value: 'production_plan', label: '生产计划' },
  { value: 'task_dispatch', label: '任务派发' },
  { value: 'leave', label: '请假' },
  { value: 'overtime', label: '加班' },
  { value: 'resignation', label: '离职' },
]

const statusOptions = [
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'partially_approved', label: '部分通过' },
  { value: 'draft', label: '草稿' },
]

const priorityOptions = [
  { value: 'urgent', label: '加急' },
  { value: 'high', label: '高' },
  { value: 'normal', label: '普通' },
  { value: 'low', label: '低' },
]

// 计算属性：是否有任何激活的筛选条件
const hasActiveFilters = computed(() => {
  return (
    !!props.filters.keyword ||
    !!props.filters.dateRange?.length ||
    (props.filters.type?.length > 0) ||
    (props.filters.status?.length > 0) ||
    (props.filters.priority?.length > 0) ||
    (props.filters.category?.length > 0)
  )
})

const handleKeywordSearch = () => {
  emit('search', localKeyword.value)
}

const toggleArrayFilter = (key, value, current) => {
  const arr = [...(current || [])]
  const idx = arr.indexOf(value)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(value)
  }
  emit('filter-change', { [key]: arr })
}

const handleDateChange = (val) => {
  emit('filter-change', { dateRange: val || [] })
}

const handleReset = () => {
  localKeyword.value = ''
  localDateRange.value = []
  emit('reset')
}
</script>
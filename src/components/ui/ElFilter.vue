<template>
  <div
    :class="[
      'filter-wrapper',
      variant === 'card'
        ? 'filter-card bg-white rounded-xl border border-gray-200'
        : 'bg-[#F2F6FA] rounded-xl shadow-sm',
      className
    ]"
  >
    <!-- 筛选字段区域 -->
    <div class="filter-fields">
      <!-- 关键字搜索 -->
      <div v-if="search !== false" class="filter-item" :style="{ minWidth: searchWidth }">
        <label v-if="searchLabel" class="filter-label">{{ searchLabel }}</label>
        <el-input
          v-model="localSearch"
          :placeholder="searchPlaceholder"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 日期范围 -->
      <div v-if="dateRange !== false" class="filter-item filter-date-range">
        <label v-if="dateRangeLabel" class="filter-label">{{ dateRangeLabel }}</label>
        <el-date-picker
          v-model="localDateRange"
          type="daterange"
          :start-placeholder="startPlaceholder"
          :end-placeholder="endPlaceholder"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
      </div>

      <!-- 下拉选择 -->
      <div
        v-for="(select, index) in selectList"
        :key="index"
        class="filter-item"
        :style="{ minWidth: select.width || '120px' }"
      >
        <label v-if="select.label" class="filter-label">{{ select.label }}</label>
        <el-select
          v-model="localSelects[index]"
          :placeholder="select.placeholder || '请选择'"
          clearable
          @change="(val) => handleSelectChange(index, val)"
        >
          <el-option
            v-for="opt in select.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          >
            <div class="flex items-center gap-2">
              <span
                v-if="opt.color"
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: opt.color }"
              />
              {{ opt.label }}
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- 自定义插槽 -->
      <slot />
    </div>

    <!-- 操作按钮区域 -->
    <div class="filter-actions">
      <el-button
        v-if="showMore"
        :size="size"
        class="filter-btn-more"
        @click="handleMoreToggle"
      >
        <el-icon class="mr-1">
          <ArrowUp v-if="moreExpanded" />
          <ArrowDown v-else />
        </el-icon>
        {{ moreExpanded ? '收起' : '更多' }}
      </el-button>

      <el-button
        v-if="showReset"
        :size="size"
        class="filter-btn-reset"
        @click="handleReset"
      >
        <el-icon class="mr-1"><RefreshLeft /></el-icon>
        重置
      </el-button>

      <el-button
        v-if="showSearch"
        type="primary"
        :size="size"
        @click="handleSearch"
      >
        <el-icon class="mr-1"><Search /></el-icon>
        搜索
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Search, RefreshLeft, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  /** 容器样式变体：card=白底卡片, toolbar=工具栏灰底 */
  variant: {
    type: String,
    default: 'toolbar',
    validator: (val) => ['card', 'toolbar'].includes(val)
  },
  /** 自定义 class */
  className: {
    type: String,
    default: ''
  },
  /** 尺寸 */
  size: {
    type: String,
    default: 'default'
  },

  /* ---------- 关键字搜索 ---------- */
  search: {
    type: [Boolean, String],
    default: false
  },
  searchLabel: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  },
  searchWidth: {
    type: String,
    default: '200px'
  },
  searchValue: {
    type: String,
    default: ''
  },

  /* ---------- 日期范围 ---------- */
  dateRange: {
    type: [Boolean, Object],
    default: false
  },
  dateRangeLabel: {
    type: String,
    default: ''
  },
  startPlaceholder: {
    type: String,
    default: '开始日期'
  },
  endPlaceholder: {
    type: String,
    default: '结束日期'
  },
  dateRangeValue: {
    type: Array,
    default: () => [null, null]
  },

  /* ---------- 下拉选择数组 ---------- */
  selectList: {
    type: Array,
    default: () => []
  },
  selectValues: {
    type: Array,
    default: () => []
  },

  /* ---------- 按钮控制 ---------- */
  showSearch: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: true
  },
  showMore: {
    type: Boolean,
    default: false
  },
  moreExpanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'search',
  'reset',
  'update:searchValue',
  'update:dateRangeValue',
  'update:selectValues',
  'more-toggle'
])

/* ======================== 本地状态 ======================== */
const localSearch = ref(props.searchValue)
const localDateRange = ref(props.dateRangeValue)
const localSelects = ref([...props.selectValues])

watch(() => props.searchValue, (val) => { localSearch.value = val })
watch(() => props.dateRangeValue, (val) => { localDateRange.value = val })
watch(() => props.selectValues, (val) => { localSelects.value = [...val] }, { deep: true })

/* 快捷日期选项 */
const dateShortcuts = computed(() => [
  { text: '今天', value: () => {
    const today = new Date()
    return [today, today]
  }},
  { text: '最近7天', value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
    return [start, end]
  }},
  { text: '最近30天', value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
    return [start, end]
  }},
  { text: '本月', value: () => {
    const end = new Date()
    const start = new Date(end.getFullYear(), end.getMonth(), 1)
    return [start, end]
  }}
])

/* ======================== 事件处理 ======================== */
function handleSearch() {
  emit('update:searchValue', localSearch.value)
  emit('search', {
    search: localSearch.value,
    dateRange: localDateRange.value,
    selects: localSelects.value
  })
}

function handleReset() {
  localSearch.value = ''
  localDateRange.value = [null, null]
  localSelects.value = props.selectList.map(() => '')
  emit('update:searchValue', '')
  emit('update:dateRangeValue', [null, null])
  emit('update:selectValues', localSelects.value)
  emit('reset')
}

function handleDateChange(val) {
  emit('update:dateRangeValue', val || [null, null])
}

function handleSelectChange(index, val) {
  const newVals = [...localSelects.value]
  newVals[index] = val
  localSelects.value = newVals
  emit('update:selectValues', newVals)
}

function handleMoreToggle() {
  emit('more-toggle', !props.moreExpanded)
}
</script>

<style scoped>
/* ======================== 与 V1.1 FilterToolbar / FilterBar 一致 ======================== */
.filter-wrapper {
  padding: 16px;
}

/* card 变体：左右同行布局（与 V1.1 FilterBar 一致） */
.filter-wrapper.filter-card {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.filter-wrapper.filter-card .filter-fields {
  flex: 1;
}

.filter-wrapper.filter-card .filter-actions {
  margin-top: 0;
}

/* 筛选字段容器 */
.filter-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

/* 单个筛选项 */
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.filter-item:deep(.el-input__wrapper),
.filter-item:deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  border-radius: 0.5rem;
  padding: 0 12px;
  transition: all 0.2s;
}

.filter-item:deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
  color: #111827;
}

.filter-item:deep(.el-input__wrapper.is-focus),
.filter-item:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
}

/* 标签样式 */
.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151; /* text-gray-700 */
  line-height: 1.4;
  margin-bottom: 2px;
}

/* 日期范围选择器宽度 */
.filter-date-range :deep(.el-date-editor--daterange) {
  width: 260px;
}

.filter-date-range :deep(.el-input__wrapper) {
  padding: 0 8px 0 30px;
}

/* 操作按钮区域 */
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.filter-actions :deep(.el-button) {
  border-radius: 0.5rem;
  font-weight: 500;
}

.filter-actions :deep(.el-button--primary) {
  background-color: #059669;
  border-color: #059669;
}

.filter-actions :deep(.el-button--primary:hover) {
  background-color: #047857;
  border-color: #047857;
}

/* 重置按钮：outline 样式 */
.filter-btn-reset {
  border: 1px solid #e5e7eb !important;
  background-color: #ffffff !important;
  color: #374151 !important;
}

.filter-btn-reset:hover {
  background-color: #f9fafb !important;
  border-color: #e5e7eb !important;
  color: #374151 !important;
}

/* 更多按钮：blue 样式 */
.filter-btn-more {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #ffffff !important;
}

.filter-btn-more:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
  color: #ffffff !important;
}
</style>

<template>
  <div class="space-y-4">
    <!-- 表格容器 -->
    <div
      class="border border-gray-200 rounded-lg overflow-auto"
      :style="{ maxHeight: scroll?.y ? `${scroll.y}px` : undefined }"
    >
      <el-table
        ref="tableRef"
        :data="displayData"
        :stripe="stripe"
        :border="border"
        :height="height"
        v-loading="loading"
        element-loading-text="加载中..."
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        :row-class-name="rowClassName"
        :highlight-current-row="true"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      >
        <!-- 多选列 -->
        <el-table-column
          v-if="rowSelection !== false"
          type="selection"
          width="48"
          align="center"
        />

        <!-- 通过 slot 传入自定义列 -->
        <slot />

        <!-- 空数据 -->
        <template #empty>
          <div class="py-8 text-gray-500 text-sm">暂无数据</div>
        </template>
      </el-table>
    </div>

    <!-- 分页 -->
    <div
      v-if="pagination !== false && paginationConfig"
      class="flex items-center justify-between"
    >
      <!-- 左侧信息 -->
      <div class="text-sm text-gray-500">
        <template v-if="paginationConfig.showTotal">
          {{ paginationConfig.showTotal(paginationConfig.total || 0) }}
        </template>
        <template v-else>
          共 {{ paginationConfig.total || 0 }} 条
        </template>
      </div>

      <!-- 分页器 -->
      <div class="flex items-center gap-1 el-table-pagination">
        <button
          class="el-pagination-ext-btn"
          :disabled="currentPage === 1"
          @click="handleCurrentChange(1)"
        >
          <el-icon><DArrowLeft /></el-icon>
        </button>

        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="paginationConfig.total || 0"
          layout="sizes, prev, pager, next"
          :background="true"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />

        <button
          class="el-pagination-ext-btn"
          :disabled="currentPage === totalPages"
          @click="handleCurrentChange(totalPages)"
        >
          <el-icon><DArrowRight /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  /** 表格数据 */
  data: {
    type: Array,
    default: () => []
  },
  /** 加载状态 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 是否显示斑马纹 */
  stripe: {
    type: Boolean,
    default: true
  },
  /** 是否显示边框 */
  border: {
    type: Boolean,
    default: false
  },
  /** 表格高度 */
  height: {
    type: [String, Number],
    default: undefined
  },
  /** 分页配置，传 false 禁用分页 */
  pagination: {
    type: [Object, Boolean],
    default: () => ({
      current: 1,
      pageSize: 20,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: null
    })
  },
  /** 行选择配置，传 false 禁用选择 */
  rowSelection: {
    type: [Object, Boolean],
    default: () => ({})
  },
  /** 滚动配置 */
  scroll: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'selection-change',
  'sort-change',
  'row-click',
  'page-change',
  'page-size-change'
])

const tableRef = ref(null)

/* ======================== 分页逻辑 ======================== */
const paginationConfig = computed(() => {
  if (props.pagination === false) return null
  return {
    current: 1,
    pageSize: 20,
    total: props.data.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: null,
    ...props.pagination
  }
})

const currentPage = ref(paginationConfig.value?.current || 1)
const pageSize = ref(paginationConfig.value?.pageSize || 20)

watch(
  () => props.pagination,
  (val) => {
    if (val && val !== false) {
      currentPage.value = val.current || 1
      pageSize.value = val.pageSize || 20
    }
  },
  { deep: true }
)

const totalPages = computed(() => {
  if (!paginationConfig.value) return 0
  return Math.ceil((paginationConfig.value.total || 0) / pageSize.value)
})

const displayData = computed(() => {
  if (props.pagination === false) return props.data
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
})

function handleCurrentChange(page) {
  currentPage.value = page
  emit('page-change', page, pageSize.value)
  if (props.pagination && typeof props.pagination.onChange === 'function') {
    props.pagination.onChange(page, pageSize.value)
  }
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  emit('page-size-change', size)
  if (props.pagination && typeof props.pagination.onChange === 'function') {
    props.pagination.onChange(1, size)
  }
}

/* ======================== 事件转发 ======================== */
function handleSelectionChange(selection) {
  emit('selection-change', selection)
}

function handleSortChange({ column, prop, order }) {
  emit('sort-change', { column, prop, order })
}

function handleRowClick(row, column, event) {
  emit('row-click', row, column, event)
}

/* ======================== 样式配置 ======================== */
const headerCellStyle = {
  backgroundColor: '#f9fafb', /* bg-gray-50 */
  color: '#6b7280',           /* text-gray-500 */
  fontWeight: 500,
  height: '48px',
  padding: '0 16px',
  fontSize: '14px'
}

const cellStyle = {
  padding: '16px',
  fontSize: '14px',
  color: '#374151'            /* text-gray-700 */
}

function rowClassName({ rowIndex }) {
  const classes = []
  if (props.stripe && rowIndex % 2 === 1) {
    classes.push('el-table--striped-row')
  }
  return classes.join(' ')
}

/* ======================== 对外暴露方法 ======================== */
defineExpose({
  getTableRef: () => tableRef.value,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected)
})
</script>

<style scoped>
/* 覆盖 Element Plus 默认表格样式，与 V1.1 ProTable 完全一致 */
:deep(.el-table) {
  --el-table-header-bg-color: #f9fafb;
  --el-table-row-hover-bg-color: #f9fafb;
  --el-table-current-row-bg-color: #f3f4f6;
  --el-table-border-color: #e5e7eb;
  font-size: 14px;
}

:deep(.el-table__header-wrapper th) {
  font-weight: 500;
}

:deep(.el-table__body-wrapper .el-table__row) {
  transition: background-color 0.2s ease;
}

:deep(.el-table__body-wrapper .el-table__row:hover > td) {
  background-color: #f9fafb !important;
}

:deep(.el-table--striped .el-table__body-wrapper .el-table__row.el-table__row--striped td) {
  background-color: rgba(249, 250, 251, 0.5) !important;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f9fafb !important;
}

:deep(.el-table .el-table__cell) {
  padding: 16px 16px;
}

:deep(.el-table th.el-table__cell) {
  padding: 0 16px;
  height: 48px;
}

:deep(.el-table__empty-block) {
  padding: 32px 0;
}

:deep(.el-table__empty-text) {
  color: #6b7280;
  font-size: 14px;
}

/* 分页器样式：emerald-600 主题 + 首页末页扩展按钮 */
.el-table-pagination :deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #059669 !important;
  color: #ffffff !important;
}

.el-table-pagination :deep(.el-pagination.is-background .el-pager li:hover) {
  color: #059669;
}

.el-pagination-ext-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  padding: 0 4px;
  border-radius: 2px;
  background-color: #f4f4f5;
  color: #606266;
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.el-pagination-ext-btn:hover:not(:disabled) {
  color: #059669;
}

.el-pagination-ext-btn:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>

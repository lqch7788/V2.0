<template>
  <div class="flex flex-col">
    <!-- 表格容器 -->
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <!-- 表格标题栏 -->
      <div v-if="title" class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      </div>

      <!-- 表格 -->
      <el-table
        :data="data"
        :row-key="rowKey"
        :header-cell-style="{ background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', fontWeight: 600 }"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列 -->
        <el-table-column v-if="selectable" type="selection" width="55" />

        <!-- 数据列 -->
        <el-table-column
          v-for="col in columns"
          :key="col.key"
          :prop="col.key"
          :label="col.title"
          :width="col.width"
          :sortable="col.sortable ? 'custom' : false"
        >
          <template #default="{ row }">
            <slot :name="col.key" :row="row">
              {{ row[col.key] }}
            </slot>
          </template>
        </el-table-column>
      </el-table>

      <!-- 加载状态 -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50">
        <el-icon class="is-loading text-emerald-600" :size="32"><Loading /></el-icon>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && data.length === 0" class="h-32 flex items-center justify-center text-gray-500">
        {{ emptyText }}
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination" class="mt-4">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="(val) => onPageSizeChange?.(val)"
        @current-change="(val) => onPageChange?.(val)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
  onSort?: (config) => void
  pagination?: PaginationConfig
  onPageChange?: (page) => void
  onPageSizeChange?: (pageSize) => void
  loading?: boolean
  emptyText?: string
  className?: string
  title?: string
}

const props = defineProps({"selectable":"false","selectedRows":"() => []","loading":"false","emptyText":"'暂无数据'","className":"''"})

const currentPage = ref(props.pagination?.page || 1)
const currentPageSize = ref(props.pagination?.pageSize || 20)

watch(() => props.pagination?.page, (val) => {
  if (val) currentPage.value = val
})

const handleSelectionChange = (selection) => {
  const keys = selection.map((row) => {
    return typeof props.rowKey === 'function'
      ? props.rowKey(row)
      : String(row[props.rowKey])
  })
  props.onSelectionChange?.(keys)
}
</script>

<style scoped>
:deep(.el-table th.el-table__cell) {
  background: linear-gradient(to right, #10b981, #059669) !important;
  color: white !important;
}

:deep(.el-table--enable-row-hover) {
  --el-table-row-hover-bg-color: rgba(16, 185, 129, 0.1);
}
</style>

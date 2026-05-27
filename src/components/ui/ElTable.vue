<template>
  <div class="space-y-4">
    <div class="border border-gray-200 rounded-lg overflow-auto" :style="{ maxHeight: scroll?.y ? scroll.y + 'px' : undefined }">
      <el-table
        ref="tableRef"
        :data="displayData"
        :stripe="stripe"
        :border="border"
        :height="height"
        v-loading="loading"
        element-loading-text="加载中..."
        :highlight-current-row="true"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      >
        <el-table-column v-if="rowSelection !== false" type="selection" width="48" align="center" />
        <slot />
        <template #empty>
          <div class="py-8 text-gray-500 text-sm">暂无数据</div>
        </template>
      </el-table>
    </div>

    <div v-if="pagination !== false && paginationConfig" class="flex items-center justify-between">
      <div class="text-sm text-gray-500">共 {{ paginationConfig.total || 0 }} 条</div>
      <div class="flex items-center gap-1">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="paginationConfig.total || 0"
          layout="sizes, prev, pager, next"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  stripe: { type: Boolean, default: true },
  border: { type: Boolean, default: false },
  height: { type: [String, Number], default: undefined },
  pagination: { type: [Object, Boolean], default: () => ({ current: 1, pageSize: 20, total: 0 }) },
  rowSelection: { type: [Object, Boolean], default: () => ({}) },
  scroll: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['selection-change', 'sort-change', 'row-click', 'page-change', 'page-size-change'])

const tableRef = ref(null)

const paginationConfig = computed(() => {
  if (props.pagination === false) return null
  return { current: 1, pageSize: 20, total: props.data.length, ...props.pagination }
})

const currentPage = ref(paginationConfig.value?.current || 1)
const pageSize = ref(paginationConfig.value?.pageSize || 20)

watch(() => props.pagination, (val) => {
  if (val && val !== false) { currentPage.value = val.current || 1; pageSize.value = val.pageSize || 20 }
}, { deep: true })

const displayData = computed(() => {
  if (props.pagination === false) return props.data
  const start = (currentPage.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

function handleCurrentChange(page) { currentPage.value = page; emit('page-change', page, pageSize.value) }
function handleSizeChange(size) { pageSize.value = size; currentPage.value = 1; emit('page-size-change', size) }
function handleSelectionChange(selection) { emit('selection-change', selection) }
function handleSortChange({ column, prop, order }) { emit('sort-change', { column, prop, order }) }
function handleRowClick(row, column, event) { emit('row-click', row, column, event) }

defineExpose({
  getTableRef: () => tableRef.value,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected)
})
</script>

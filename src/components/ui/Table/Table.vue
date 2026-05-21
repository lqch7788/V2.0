<template>
  <div class="table-container" :style="{ maxHeight: scroll ? scroll.y : undefined }">
    <el-table
      :data="data"
      :border="border"
      :stripe="stripe"
      :size="size"
      :class="['ui-table', className]"
      @select="handleSelect"
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <slot />
    </el-table>
  </div>
</template>

<script setup>
import { ElTable } from 'element-plus'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  border: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  },
  className: {
    type: String,
    default: ''
  },
  scroll: Object
})

const emit = defineEmits(['select', 'select-all', 'selection-change', 'sort-change'])

const handleSelect = (selection, row) => {
  emit('select', selection, row)
}

const handleSelectAll = (selection) => {
  emit('select-all', selection)
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleSortChange = ({ column, prop, order }) => {
  emit('sort-change', column, prop, order)
}
</script>

<style scoped>
/* V1.1 Table 样式 */
.table-container {
  overflow: auto;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

:deep(.el-table) {
  width: 100%;
  font-size: 0.875rem;
}

:deep(.el-table th.el-table__cell) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #6b7280;
}

:deep(.el-table td.el-table__cell) {
  padding: 1rem;
}

:deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(249, 250, 251, 0.5);
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #f9fafb;
}
</style>

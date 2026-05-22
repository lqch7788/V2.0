<template>
  <div class="ui-pagination">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      :small="small"
      :disabled="disabled"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ currentPage: 1, pageSize: 10 })
  },
  total: {
    type: Number,
    default: 0
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  small: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'current-change', 'size-change', 'change'])

const currentPage = computed({
  get: () => props.modelValue?.currentPage || 1,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, currentPage: val })
  }
})

const pageSize = computed({
  get: () => props.modelValue?.pageSize || 10,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, pageSize: val })
  }
})

const handleCurrentChange = (val) => {
  emit('current-change', val)
  emit('change', { currentPage: val, pageSize: pageSize.value })
}

const handleSizeChange = (val) => {
  currentPage.value = 1
  emit('size-change', val)
  emit('change', { currentPage: 1, pageSize: val })
}
</script>

<style scoped>
/* V1.1 Pagination 样式 */
:deep(.el-pagination) {
  font-weight: 400;
}

:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .btn-next) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

:deep(.el-pagination.is-background .btn-prev:hover),
:deep(.el-pagination.is-background .btn-next:hover) {
  background: #f9fafb;
  border-color: #059669;
  color: #059669;
}

:deep(.el-pagination.is-background .el-pager li) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 400;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  border-color: #059669;
  color: #059669;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #059669;
  border-color: #059669;
  color: white;
}

:deep(.el-pagination .el-pager li.is-disabled) {
  color: #c0c4cc;
}

:deep(.el-pagination__total) {
  color: #6b7280;
}

:deep(.el-pagination__sizes) {
  color: #6b7280;
}
</style>

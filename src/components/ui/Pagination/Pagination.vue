<template>
  <div class="flex items-center gap-2" :class="className">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="showPageSize ? pageSizeOptions.map(String) : undefined"
      :total="totalPages * pageSize"
      :layout="layoutStr"
      background
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElPagination } from 'element-plus'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50, 100] },
  showPageSize: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const emit = defineEmits(['page-change', 'page-size-change'])

const layoutStr = computed(() => props.showPageSize ? 'sizes, prev, pager, next' : 'prev, pager, next')

function handlePageChange(page) { emit('page-change', page) }
function handleSizeChange(size) { emit('page-size-change', size) }
</script>

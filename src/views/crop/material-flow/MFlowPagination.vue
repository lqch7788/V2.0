<template>
  <!-- 分页（V1.1 L777-796 1:1） -->
  <div v-if="total > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white rounded-xl shadow-sm">
    <div class="text-sm text-gray-500">显示 {{ ((page - 1) * pageSize) + 1 }} - {{ Math.min(page * pageSize, total) }} 条，共 {{ total }} 条</div>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="sizes, prev, pager, next"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 }
})
const emit = defineEmits(['page-change', 'size-change'])
const currentPage = computed({ get: () => props.page, set: (v) => emit('page-change', v) })
const currentPageSize = computed({ get: () => props.pageSize, set: (v) => emit('size-change', v) })
const onPageChange = (v) => emit('page-change', v)
const onSizeChange = (v) => emit('size-change', v)
</script>
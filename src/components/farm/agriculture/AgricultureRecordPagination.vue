<template>
  <!-- 农事记录分页组件 -->
  <el-pagination
    :current-page="currentPage"
    :page-size="pageSize"
    :page-sizes="[10, 20, 50]"
    :total="total"
    layout="total, sizes, prev, pager, next"
    @size-change="(s) => $emit('update:pageSize', s)"
    @current-change="(p) => $emit('update:currentPage', p)"
    class="px-4 py-3"
  />
</template>

<script setup>
defineProps({
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
})

defineEmits(['update:currentPage', 'update:pageSize'])
</script>

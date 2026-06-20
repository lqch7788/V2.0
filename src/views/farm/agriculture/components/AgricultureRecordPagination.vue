<!--
  农事记录分页
  对标 V1.1 src/components/farm/agriculture/components/AgricultureRecordPagination.tsx
-->
<template>
  <div class="flex justify-end bg-white rounded-xl p-4 shadow-sm">
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @current-change="$emit('page-change', currentPage)"
      @size-change="$emit('size-change', $event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 20 },
})

defineEmits(['page-change', 'size-change'])

const currentPage = ref(1)
</script>
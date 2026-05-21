<template>
  <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
    <div class="flex items-center gap-2 text-sm text-gray-500">
      <span>每页</span>
      <el-select
        :model-value="pageSize"
        @change="(val) => onPageSizeChange(val)"
        size="small"
        class="w-20"
      >
        <el-option :value="10" label="10条" />
        <el-option :value="20" label="20条" />
        <el-option :value="50" label="50条" />
      </el-select>
    </div>
    <div class="flex items-center gap-2 text-sm text-gray-500">
      <span>共 {{ totalCount }} 条</span>
      <el-button
        size="small"
        :disabled="currentPage === 1"
        @click="() => onPageChange(Math.max(1, currentPage - 1))"
      >
        &lt;
      </el-button>
      <span class="text-sm font-medium text-emerald-600">{{ currentPage }}/{{ totalPages }}</span>
      <el-button
        size="small"
        :disabled="currentPage >= totalPages"
        @click="() => onPageChange(Math.min(totalPages, currentPage + 1))"
      >
        &gt;
      </el-button>
    </div>
  </div>
</template>

<script setup>

defineProps({})
</script>

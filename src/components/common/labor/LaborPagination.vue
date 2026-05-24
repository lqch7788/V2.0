<template>
  <div class="flex items-center justify-between px-4 py-3">
    <!-- 左侧信息 -->
    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-500">
        共 <span class="font-medium text-gray-900">{{ total }}</span> 条记录
      </span>
      <div v-if="onPageSizeChange" class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select
          :model-value="pageSize"
          size="small"
          style="width: 80px"
          @change="(val) => onPageSizeChange?.(val)"
        >
          <el-option
            v-for="size in pageSizeOptions"
            :key="size"
            :label="size"
            :value="size"
          />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
    </div>

    <!-- 分页控制 -->
    <div class="flex items-center gap-1">
      <el-button
        :disabled="page <= 1"
        size="small"
        @click="onPageChange?.(1)"
      >
        <el-icon><DArrowLeft /></el-icon>
      </el-button>
      <el-button
        :disabled="page <= 1"
        size="small"
        @click="onPageChange?.(page - 1)"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>

      <template v-for="p in pageNumbers" :key="p">
        <span v-if="p === 'ellipsis'" class="px-2 text-gray-400">...</span>
        <el-button
          v-else
          :type="page === p ? 'primary' : ''"
          size="small"
          @click="onPageChange?.(p)"
        >
          {{ p }}
        </el-button>
      </template>

      <el-button
        :disabled="page >= totalPages"
        size="small"
        @click="onPageChange?.(page + 1)"
      >
        <el-icon><ArrowRight /></el-icon>
      </el-button>
      <el-button
        :disabled="page >= totalPages"
        size="small"
        @click="onPageChange?.(totalPages)"
      >
        <el-icon><DArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  page: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 20
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  onPageChange: Function,
  onPageSizeChange: Function,
  className: {
    type: String,
    default: ''
  }
})

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const pageNumbers = computed(() => {
  const pages = []
  if (totalPages.value <= 7) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    if (props.page <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages.value)
    } else if (props.page >= totalPages.value - 2) {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = props.page - 1; i <= props.page + 1; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages.value)
    }
  }
  return pages
})
</script>

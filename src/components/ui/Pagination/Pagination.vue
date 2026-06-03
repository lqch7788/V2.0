<!--
  Pagination 分页器
  对应 V1.1 src/components/ui/Pagination.tsx 1:1 翻译
  - 4 个核心功能：首页 / 上一页 / 智能页码 / 下一页 / 末页 / 每页下拉 / 共X页
  - V1.1 L31-66 getPageNumbers：totalPages > 7 时显示省略号
  - V1.1 L26 默认 pageSizeOptions = [10, 20, 50, 100]
-->
<template>
  <div class="flex items-center gap-4" :class="className">
    <!-- 页码按钮（首页/上一页/智能页码/下一页/末页） -->
    <div class="flex items-center gap-1">
      <!-- 首页（V1.1 L78-90） -->
      <button
        :disabled="currentPage === 1"
        class="p-2 rounded-lg transition-colors"
        :class="currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
        @click="onPageChange(1)"
      >
        <el-icon><DArrowLeft /></el-icon>
      </button>

      <!-- 上一页（V1.1 L92-104） -->
      <button
        :disabled="currentPage === 1"
        class="p-2 rounded-lg transition-colors"
        :class="currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
        @click="onPageChange(Math.max(1, currentPage - 1))"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>

      <!-- 智能页码（V1.1 L106-126） -->
      <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
        <button
          v-if="typeof page === 'number'"
          :class="[
            'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors',
            currentPage === page ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          ]"
          @click="onPageChange(page)"
        >
          {{ page }}
        </button>
        <span v-else class="px-2 text-gray-400">{{ page }}</span>
      </template>

      <!-- 下一页（V1.1 L128-140） -->
      <button
        :disabled="currentPage >= totalPages"
        class="p-2 rounded-lg transition-colors"
        :class="currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
        @click="onPageChange(Math.min(totalPages, currentPage + 1))"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>

      <!-- 末页（V1.1 L142-154） -->
      <button
        :disabled="currentPage >= totalPages"
        class="p-2 rounded-lg transition-colors"
        :class="currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
        @click="onPageChange(totalPages)"
      >
        <el-icon><DArrowRight /></el-icon>
      </button>
    </div>

    <!-- 每页下拉（V1.1 L157-173） -->
    <div v-if="showPageSize && onPageSizeChange" class="flex items-center gap-2">
      <span class="text-sm text-gray-500">每页</span>
      <select
        :value="pageSize"
        class="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        @change="handleSizeChange"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}条</option>
      </select>
    </div>

    <!-- 共X页（V1.1 L175-178） -->
    <span class="text-sm text-gray-500">共 {{ totalPages }} 页</span>
  </div>
</template>

<script setup>
/**
 * Pagination 分页器 — 1:1 翻译 V1.1 src/components/ui/Pagination.tsx
 *
 * Props（与 V1.1 PaginationProps 一致）：
 * - currentPage: 当前页
 * - totalPages: 总页数
 * - pageSize: 每页条数
 * - onPageChange: 页码变化回调
 * - onPageSizeChange: 每页条数变化回调
 * - pageSizeOptions: 每页下拉选项，默认 [10, 20, 50, 100]
 * - showPageSize: 是否显示每页下拉
 * - className: 额外 class
 */
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50, 100] },
  showPageSize: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const emit = defineEmits(['page-change', 'page-size-change'])

// 智能页码（1:1 翻译 V1.1 L31-66 getPageNumbers）
const visiblePages = computed(() => {
  const pages = []
  const showEllipsis = props.totalPages > 7
  if (!showEllipsis) {
    for (let i = 1; i <= props.totalPages; i++) pages.push(i)
  } else {
    // 始终显示第一页
    pages.push(1)
    if (props.currentPage > 3) pages.push('...')
    // 显示当前页附近的页码
    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(props.totalPages - 1, props.currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (props.currentPage < props.totalPages - 2) pages.push('...')
    // 始终显示最后一页
    if (props.totalPages > 1) pages.push(props.totalPages)
  }
  return pages
})

function onPageChange(page) {
  emit('page-change', page)
}

function handleSizeChange(e) {
  emit('page-size-change', Number(e.target.value))
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 数据表格 -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="exportMode || batchEditMode" class="px-4 py-3 text-left text-sm font-semibold w-12">
              <el-checkbox
                :model-value="selectedRows.length === data.length && data.length > 0"
                class="order-checkbox border-white"
                @change="onExportSelectAll"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">订单编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">订单名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">订单类型</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">作物信息</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">订单日期</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">预计采收</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="paginatedData.length === 0">
            <td :colspan="exportMode || batchEditMode ? 10 : 9" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
          <tr
            v-for="record in paginatedData"
            :key="record.id"
            class="hover:bg-emerald-50 transition-colors"
          >
            <td v-if="exportMode || batchEditMode" class="px-4 py-3">
              <el-checkbox
                :model-value="selectedRows.includes(record.id)"
                class="order-checkbox"
                @change="() => handleSelectRow(record.id)"
              />
            </td>
            <td class="px-4 py-3 text-sm">
              <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" title="点击查看详情" @click="onDetail(record)">
                {{ record.orderCode }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">{{ record.orderName }}</td>
            <td class="px-4 py-3">
              <OrderTypeBadge :type="record.orderType" />
            </td>
            <td class="px-4 py-3">
              <div class="text-sm text-gray-900">{{ record.cropVariety }}</div>
              <div class="text-xs text-gray-500 truncate" :title="record.cropCategory">{{ record.cropCategory }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ record.plannedQuantity }} {{ record.unit }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.orderDate }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.expectedHarvestDate || '-' }}</td>
            <td class="px-4 py-3">
              <StatusBadge :status="record.status" />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <template v-if="record.status !== CropOrderStatus.COMPLETED">
                  <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors" title="编辑" @click="onEdit(record)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-colors" title="删除" @click="handleDeleteSingle(record)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </template>
                <span v-else class="text-xs text-gray-400">已归档</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select v-model="localPagination.pageSize" class="w-20" size="small" @change="handlePageSizeChange">
          <el-option label="10" :value="10" />
          <el-option label="20" :value="20" />
          <el-option label="50" :value="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current === 1"
          @click="onPageChange(1)"
        >
          <ChevronsLeft class="w-4 h-4" />
        </button>
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current === 1"
          @click="onPageChange(localPagination.current - 1)"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
          <button
            v-if="typeof page === 'number'"
            class="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors"
            :class="localPagination.current === page ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="onPageChange(page)"
          >
            {{ page }}
          </button>
          <span v-else class="px-2 text-gray-400">{{ page }}</span>
        </template>
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current >= totalPages"
          @click="onPageChange(localPagination.current + 1)"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current >= totalPages"
          @click="onPageChange(totalPages)"
        >
          <ChevronsRight class="w-4 h-4" />
        </button>
        <span class="text-sm text-gray-500 ml-2">共 {{ totalPages }} 页</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { showConfirm } from '@/lib/dialogService'
import { CropOrderStatus } from '@/types/crop'
import StatusBadge from './StatusBadge.vue'
import OrderTypeBadge from './OrderTypeBadge.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  pagination: { type: Object, required: true },
  selectedRows: { type: Array, default: () => [] },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true },
})

const emit = defineEmits([
  'update:pagination',
  'update:selectedRows',
  'detail',
  'edit',
  'delete',
  'exportSelectAll',
])

const localPagination = ref({ ...props.pagination })

watch(() => props.pagination, (val) => {
  localPagination.value = { ...val }
}, { deep: true })

watch(localPagination, (val) => {
  emit('update:pagination', { ...val })
}, { deep: true })

const totalPages = computed(() => {
  return Math.ceil(props.data.length / localPagination.value.pageSize) || 1
})

const visiblePages = computed(() => {
  const current = localPagination.value.current
  const total = totalPages.value
  const pages = []
  const showEllipsis = total > 7

  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('...')
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - 2) {
      pages.push('...')
    }
    if (total > 1) {
      pages.push(total)
    }
  }
  return pages
})

const paginatedData = computed(() => {
  const start = (localPagination.value.current - 1) * localPagination.value.pageSize
  const end = start + localPagination.value.pageSize
  return props.data.slice(start, end)
})

function handleSelectRow(id) {
  const rows = [...props.selectedRows]
  const index = rows.indexOf(id)
  if (index > -1) {
    rows.splice(index, 1)
  } else {
    rows.push(id)
  }
  emit('update:selectedRows', rows)
}

function onExportSelectAll() {
  emit('exportSelectAll')
}

async function handleDeleteSingle(record) {
  if (await showConfirm(`确定要删除订单 ${record.orderCode} 吗？`)) {
    emit('delete', [record.id])
  }
}

function onDetail(record) {
  emit('detail', record)
}

function onEdit(record) {
  emit('edit', record)
}

function onPageChange(page) {
  if (page < 1 || page > totalPages.value) return
  localPagination.value = { ...localPagination.value, current: page }
  emit('update:pagination', { ...localPagination.value })
}

function handlePageSizeChange(size) {
  localPagination.value = { pageSize: size, current: 1 }
  emit('update:pagination', { ...localPagination.value })
}
</script>

<style scoped>
/* 加深导出模式复选框默认边框颜色 */
:deep(.order-checkbox .el-checkbox__inner) {
  border-color: #374151;
}

:deep(.order-checkbox:hover .el-checkbox__inner) {
  border-color: #1e3a8a;
}
</style>

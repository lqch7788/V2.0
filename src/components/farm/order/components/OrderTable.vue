<template>
  <!-- 订单数据表格 - 从V1.1 OrderTable.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-center text-sm font-semibold w-12">
              <el-checkbox
                :model-value="isAllSelected"
                @change="$emit('exportSelectAll')"
                class="!border-white"
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
            <td :colspan="showCheckbox ? 10 : 9" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
          <tr
            v-for="record in paginatedData"
            :key="record.id"
            class="hover:bg-emerald-50 transition-colors"
          >
            <td v-if="showCheckbox" class="px-4 py-3 text-center">
              <el-checkbox
                :model-value="selectedRows.includes(record.id)"
                @change="() => handleSelectRow(record.id)"
              />
            </td>
            <td class="px-4 py-3 text-sm">
              <el-button link type="primary" size="small" @click="$emit('detail', record)" title="点击查看详情">
                {{ record.orderCode }}
              </el-button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">{{ record.orderName }}</td>
            <td class="px-4 py-3">
              <span :class="getOrderTypeClass(record.orderType)" class="px-2 py-1 text-xs rounded-full">
                {{ getOrderTypeLabel(record.orderType) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="text-sm text-gray-900">{{ record.cropVariety }}</div>
              <div class="text-xs text-gray-500 truncate max-w-[200px]" :title="record.cropCategory">{{ record.cropCategory }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.plannedQuantity }} {{ record.unit }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.orderDate }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.expectedHarvestDate || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="getStatusClass(record.status)" class="px-2 py-1 text-xs rounded-full">
                {{ getStatusLabel(record.status) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <template v-if="record.status !== 'completed'">
                  <el-button text size="small" @click="$emit('edit', record)" title="编辑">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="handleSingleDelete(record)" title="删除">
                    <el-icon><Delete /></el-icon>
                  </el-button>
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
      <el-pagination
        :current-page="pagination.current"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="data.length"
        layout="total, sizes, prev, pager, next"
        @size-change="(size) => $emit('change', { pageSize: size, current: 1 })"
        @current-change="(page) => $emit('change', { ...pagination, current: page })"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { showConfirm } from '@/lib/dialogService'

const ORDER_TYPE_MAP = {
  breeding: { label: '育种订单', cls: 'bg-pink-100 text-pink-700' },
  seedling: { label: '育苗订单', cls: 'bg-green-100 text-green-700' },
  production: { label: '生产订单', cls: 'bg-purple-100 text-purple-700' },
  research: { label: '研发订单', cls: 'bg-cyan-100 text-cyan-700' },
  other: { label: '其他', cls: 'bg-gray-100 text-gray-700' },
}

const STATUS_MAP = {
  planned: { label: '已计划', cls: 'bg-gray-100 text-gray-700' },
  in_progress: { label: '进行中', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: '已取消', cls: 'bg-red-100 text-red-700' },
}

const props = defineProps({
  data: { type: Array, default: () => [] },
  pagination: { type: Object, default: () => ({ current: 1, pageSize: 10 }) },
  selectedRows: { type: Array, default: () => [] },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true },
})

const emit = defineEmits([
  'change', 'selectionChange', 'detail', 'edit', 'delete', 'add',
  'exportSelectAll', 'exportCancel', 'confirmExport',
])

const showCheckbox = computed(() => props.exportMode || props.batchEditMode)

const isAllSelected = computed(() =>
  props.data.length > 0 && props.selectedRows.length === props.data.length
)

const paginatedData = computed(() => {
  const start = (props.pagination.current - 1) * props.pagination.pageSize
  const end = start + props.pagination.pageSize
  return props.data.slice(start, end)
})

const getOrderTypeLabel = (type) => ORDER_TYPE_MAP[type]?.label || '其他'
const getOrderTypeClass = (type) => ORDER_TYPE_MAP[type]?.cls || 'bg-gray-100 text-gray-700'
const getStatusLabel = (status) => STATUS_MAP[status]?.label || status
const getStatusClass = (status) => STATUS_MAP[status]?.cls || 'bg-gray-100 text-gray-700'

const handleSelectRow = (id) => {
  const rows = props.selectedRows.includes(id)
    ? props.selectedRows.filter(r => r !== id)
    : [...props.selectedRows, id]
  emit('selectionChange', rows)
}

const handleSingleDelete = async (record) => {
  if (await showConfirm(`确定要删除订单 ${record.orderCode} 吗？`)) {
    emit('delete', [record.id])
  }
}
</script>

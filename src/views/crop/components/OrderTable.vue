<template>
  <!-- 订单数据表格组件 - V1.1 OrderTable.tsx 1:1 翻译 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 数据表格 - 支持水平滚动和垂直滚动 -->
    <div class="overflow-auto max-h-[calc(100vh-280px)]">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th
              v-if="exportMode || batchEditMode"
              class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap"
            >
              <el-checkbox
                :model-value="selectedRows.length === data.length && data.length > 0"
                class="border-white rounded"
                @change="onExportSelectAll"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单类型</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物信息</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">计划数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">完成数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">完成进度</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">客户</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">订单日期</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">预计完成时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">创建人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="paginatedData.length === 0">
            <td :colspan="(exportMode || batchEditMode) ? 15 : 14" class="px-4 py-8 text-center text-gray-500">
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
                class="rounded"
                @change="() => handleSelectRow(record.id)"
              />
            </td>
            <td class="px-4 py-3 text-sm">
              <el-button link type="primary" @click="onDetail(record)" title="点击查看详情">
                {{ record.orderCode }}
              </el-button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
              {{ record.orderName }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="getOrderTypeBadgeClass(record.orderType)">
                {{ getOrderTypeLabel(record.orderType) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="text-sm text-gray-900 truncate max-w-xs">{{ record.cropVariety }}</div>
              <div class="text-xs text-gray-500 truncate max-w-xs" :title="record.cropCategory">{{ record.cropCategory }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ record.plannedQuantity }} {{ record.unit }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ record.completedQuantity || 0 }} {{ record.unit }}
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              {{ record.plannedQuantity > 0 ? Math.round(((record.completedQuantity || 0) / record.plannedQuantity) * 100) + '%' : '0%' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate max-w-xs">
              {{ record.customerName || '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ record.orderDate }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ record.expectedCompletionDate || '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="getStatusBadgeClass(record)">
                {{ getStatusLabel(record) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate max-w-xs">
              {{ record.createBy || '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 truncate max-w-xs" :title="record.remarks || '-'">
              {{ record.remarks || '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <template v-if="record.status !== CropOrderStatus.COMPLETED">
                  <el-button link @click="onEdit(record)" title="编辑">
                    <Pencil class="w-4 h-4" />
                  </el-button>
                  <el-button link @click="onDeleteRow(record)" title="删除">
                    <Trash2 class="w-4 h-4" />
                  </el-button>
                </template>
                <template v-else>
                  <span class="text-xs text-gray-400">已归档</span>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页（与V1.1 OrderTable.tsx L237-247 完全一致 - 使用通用 Pagination 组件） -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <Pagination
        :current-page="pagination.current"
        :total-pages="totalPages"
        :page-size="pagination.pageSize"
        :page-size-options="[10, 20, 50]"
        :show-page-size="true"
        @page-change="(page) => onChange({ ...pagination, current: page })"
        @page-size-change="(size) => onChange({ pageSize: size, current: 1 })"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * OrderTable 订单数据表格组件
 * 对应 V1.1 src/components/farm/order/components/OrderTable.tsx 1:1 翻译
 *
 * Props（与 V1.1 OrderTableProps 1:1 对齐）：
 * - data: CropOrder[] 订单数据
 * - pagination: { current, pageSize } 分页状态
 * - onChange: 分页变化回调
 * - selectedRows: string[] 选中行 ID 列表
 * - onSelectionChange: 选中行变化回调
 * - onDetail: 查看详情回调
 * - onEdit: 编辑回调
 * - onDelete: 删除回调（接收 ids: string[]）
 * - onAdd: 新增回调
 * - exportMode: boolean 导出模式
 * - batchEditMode: boolean 批量编辑模式
 * - onExportSelectAll: 全选/取消全选回调
 * - onExportCancel: 取消导出回调
 * - onConfirmExport: 确认导出回调
 * - canCreate: boolean 权限控制
 * - canDelete: boolean 权限控制
 * - canExport: boolean 权限控制
 */
import { computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { CropOrderStatus } from '@/types/crop'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

const props = defineProps({
  data: { type: Array, required: true },
  pagination: { type: Object, required: true },
  onChange: { type: Function, required: true },
  selectedRows: { type: Array, required: true },
  onSelectionChange: { type: Function, required: true },
  onDetail: { type: Function, required: true },
  onEdit: { type: Function, required: true },
  onDelete: { type: Function, required: true },
  onAdd: { type: Function, required: true },
  exportMode: { type: Boolean, required: true },
  batchEditMode: { type: Boolean, required: true },
  onExportSelectAll: { type: Function, required: true },
  onExportCancel: { type: Function, required: true },
  onConfirmExport: { type: Function, required: true },
  canCreate: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true }
})

// 总页数
const totalPages = computed(() => Math.ceil(props.data.length / props.pagination.pageSize) || 1)

// 当前页数据
const paginatedData = computed(() => {
  const start = (props.pagination.current - 1) * props.pagination.pageSize
  const end = start + props.pagination.pageSize
  return props.data.slice(start, end)
})

// 单行选中切换
const handleSelectRow = (id) => {
  if (props.selectedRows.includes(id)) {
    props.onSelectionChange(props.selectedRows.filter(row => row !== id))
  } else {
    props.onSelectionChange([...props.selectedRows, id])
  }
}

// 行内删除（带确认弹窗，与 V1.1 OrderTable.tsx L213-216 行为一致）
const onDeleteRow = (record) => {
  // V1.1 在 OrderTable 内自带 showConfirm 确认；V2.0 抽到 Order.vue 处理
  // 这里直接回调，由父组件负责确认弹窗
  props.onDelete([record.id])
}

// 状态标签（与V1.1 OrderTable.tsx L53-66 1:1 对齐）
const getStatusLabel = (record) => {
  if (record.status === CropOrderStatus.COMPLETED) return '已完成'
  if (record.status === CropOrderStatus.CANCELLED) return '已取消'
  if ((record.completedQuantity || 0) > 0) return '进行中'
  return '已计划'
}

const getStatusBadgeClass = (record) => {
  if (record.status === CropOrderStatus.COMPLETED) {
    return 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full'
  }
  if (record.status === CropOrderStatus.CANCELLED) {
    return 'px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full'
  }
  if ((record.completedQuantity || 0) > 0) {
    return 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'
  }
  return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
}

const getOrderTypeLabel = (type) => {
  switch (type) {
    case 'breeding': return '育种订单'
    case 'seedling': return '育苗订单'
    case 'production': return '生产订单'
    case 'research': return '研发订单'
    case 'other': return '其他'
    default: return type || ''
  }
}

const getOrderTypeBadgeClass = (type) => {
  switch (type) {
    case 'breeding':
      return 'px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full'
    case 'seedling':
      return 'px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full'
    case 'production':
      return 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full'
    case 'research':
      return 'px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full'
    case 'other':
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}
</script>

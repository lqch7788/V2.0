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

<script setup lang="ts">
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
// 修复 P0-A/P0-B：使用共享工具函数（与 Order.vue 复用，避免重复定义）
// 注意：必须保留旧名（getStatusBadgeClass/getOrderTypeLabel/getOrderTypeBadgeClass）
// 因为 template 中通过 _ctx.xxx 引用这些名字，不能改名
import {
  getOrderStatusLabel as getStatusLabel,
  getOrderStatusBadgeClass as getStatusBadgeClass,
  getOrderTypeLabel as getOrderTypeLabel,
  getOrderTypeBadgeClass as getOrderTypeBadgeClass
} from '@/utils/orderHelpers'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

interface CropOrder {
  id: string
  orderCode: string
  orderName: string
  orderType: string
  instanceIds?: string[]
  cropCategory?: string
  cropName?: string
  cropVariety?: string
  plannedQuantity?: number
  completedQuantity?: number
  unit?: string
  supplierId?: string
  supplierName?: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  orderDate?: string
  expectedCompletionDate?: string
  actualHarvestDate?: string
  status: string
  remarks?: string
  createBy?: string
  createTime?: string
  updateTime?: string
}

interface Pagination {
  current: number
  pageSize: number
}

interface Props {
  data: CropOrder[]
  pagination: Pagination
  onChange: (val: Pagination) => void
  selectedRows: string[]
  onSelectionChange: (val: string[]) => void
  onDetail: (record: CropOrder) => void
  onEdit: (record: CropOrder) => void
  onDelete: (ids: string[]) => void
  onAdd: () => void
  exportMode: boolean
  batchEditMode: boolean
  onExportSelectAll: () => void
  onExportCancel: () => void
  onConfirmExport: () => void
  canCreate?: boolean
  canDelete?: boolean
  canExport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canCreate: true,
  canDelete: true,
  canExport: true
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

// 状态标签/类型标签/样式已抽到 @/utils/orderHelpers（修复 P0-A/P0-B 与 Order.vue 复用）
// 模板中继续使用本地 getStatusLabel/getStatusBadgeClass/getOrderTypeLabel/getOrderTypeBadgeClass 名称（已通过 import 别名映射）
</script>

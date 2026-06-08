<template>
  <!-- 订单详情弹窗 - 统一使用 ElModal（V1.1宽度700 → 统一800） -->
  <ElModal
    :model-value="isOpen"
    title="订单详情"
    :width="1600"
    :height="900"
    :show-footer="false"
    @update:model-value="(v) => emit('update:isOpen', v)"
    @close="handleClose"
  >
    <!-- 内容 — V1.1 DetailModal 12 行扁平 grid 布局（与 V1.1 OrderDetailModal.tsx L59-103 字段配置 1:1 对齐） -->
    <div class="space-y-4 modal-form-inputs">
      <div class="grid grid-cols-2 gap-4">
        <!-- 行 1: 订单编号 | 订单类型 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">订单编号</label>
          <p class="text-sm font-medium text-emerald-600">{{ record.orderCode }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">订单类型</label>
          <span :class="getOrderTypeBadgeClass(record.orderType)">
            {{ getOrderTypeLabel(record.orderType) }}
          </span>
        </div>
        <!-- 行 2: 订单名称（fullWidth） -->
        <div class="col-span-2">
          <label class="block text-xs text-gray-500 mb-1">订单名称</label>
          <p class="text-sm font-medium text-gray-900">{{ record.orderName }}</p>
        </div>
        <!-- 行 3: 订单状态 | 订单日期 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">订单状态</label>
          <span :class="getStatusBadgeClass(record.status)">
            {{ getStatusLabel(record) }}
          </span>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">订单日期</label>
          <p class="text-sm text-gray-900">{{ record.orderDate }}</p>
        </div>
        <!-- 行 4: 预计完成日期 | 完成进度 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">预计完成日期</label>
          <p class="text-sm text-gray-900">{{ record.expectedCompletionDate || '-' }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">完成进度</label>
          <p class="text-sm text-gray-900">{{ completionRate }}</p>
        </div>
        <!-- 行 5: 品种路径（fullWidth） -->
        <div class="col-span-2">
          <label class="block text-xs text-gray-500 mb-1">品种路径</label>
          <p class="text-sm text-gray-900">{{ record.cropCategory || '-' }}</p>
        </div>
        <!-- 行 6: 作物品种（fullWidth） -->
        <div class="col-span-2">
          <label class="block text-xs text-gray-500 mb-1">作物品种</label>
          <p class="text-sm text-gray-900">{{ record.cropVariety || '-' }}</p>
        </div>
        <!-- 行 7: 单位 | 完成数量 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">单位</label>
          <p class="text-sm text-gray-900">{{ record.unit || '株' }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">完成数量</label>
          <p class="text-sm text-gray-900">{{ record.completedQuantity || 0 }}</p>
        </div>
        <!-- 行 8: 计划数量 | 完成进度（V1.1 DetailModal L86-87 字段重复，按 V1.1 1:1 保留） -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">计划数量</label>
          <p class="text-sm text-gray-900">{{ record.plannedQuantity }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">完成进度</label>
          <p class="text-sm text-gray-900">{{ record.plannedQuantity > 0 ? Math.round((record.completedQuantity / record.plannedQuantity) * 100) + '%' : '0%' }}</p>
        </div>
        <!-- 行 9: 客户名称 | 客户电话 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">客户名称</label>
          <p class="text-sm text-gray-900">{{ record.customerName || '-' }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">客户电话</label>
          <p class="text-sm text-gray-900">{{ record.customerPhone || '-' }}</p>
        </div>
        <!-- 行 10: 收货地址（fullWidth） -->
        <div class="col-span-2">
          <label class="block text-xs text-gray-500 mb-1">收货地址</label>
          <p class="text-sm text-gray-900">{{ record.deliveryAddress || '-' }}</p>
        </div>
        <!-- 行 11: 创建人 | 创建时间 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">创建人</label>
          <p class="text-sm text-gray-900">{{ record.createBy || '-' }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">创建时间</label>
          <p class="text-sm text-gray-900">{{ record.createTime || '-' }}</p>
        </div>
        <!-- 行 12: 备注（fullWidth） -->
        <div class="col-span-2">
          <label class="block text-xs text-gray-500 mb-1">备注</label>
          <p class="text-sm text-gray-900">{{ record.remarks || '-' }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button size="small" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { computed } from 'vue'
import { ElModal } from '@/components/ui'
import { CropOrderStatus } from '@/types/crop'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close', 'update:isOpen'])

// 完成率（V1.1 DetailModal.tsx L54-56 1:1 对齐）
const completionRate = computed(() => {
  if (!props.record) return '0%'
  return props.record.plannedQuantity > 0
    ? `${Math.round((props.record.completedQuantity / props.record.plannedQuantity) * 100)}%`
    : '0%'
})

// 获取状态标签（与V1.1 DetailModal.tsx L20-33 1:1 对齐）
const getStatusLabel = (record) => {
  if (!record) return ''
  if (record.status === CropOrderStatus.COMPLETED) return '已完成'
  if (record.status === CropOrderStatus.CANCELLED) return '已取消'
  if (record.status === CropOrderStatus.IN_PROGRESS) return '进行中'
  if (record.status === CropOrderStatus.PLANNED) return '已计划'
  // 非终态：根据完成数量判断
  if ((record.completedQuantity || 0) > 0) return '进行中'
  return '已计划'
}

// 获取状态样式（与V1.1 DetailModal.tsx L20-33 1:1 对齐）
const getStatusBadgeClass = (status) => {
  switch (status) {
    case CropOrderStatus.PLANNED:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
    case CropOrderStatus.IN_PROGRESS:
      return 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'
    case CropOrderStatus.COMPLETED:
      return 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full'
    case CropOrderStatus.CANCELLED:
      return 'px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}

// 获取订单类型标签（与V1.1 DetailModal.tsx L36-51 1:1 对齐）
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

// 获取订单类型样式（与V1.1 DetailModal.tsx L36-51 1:1 对齐）
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

// 关闭
const handleClose = () => {
  emit('update:isOpen', false)
  emit('close')
}
</script>

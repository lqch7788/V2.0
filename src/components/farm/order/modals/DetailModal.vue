<template>
  <!-- 订单详情弹窗 - 从V1.1 DetailModal.tsx 1:1迁移 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    title="订单详情"
    width="700px"
    top="5vh"
  >
    <div v-if="record" class="px-2 overflow-y-auto" style="max-height: calc(90vh - 200px)">
      <!-- 订单基本信息 -->
      <div class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <el-icon><Goods /></el-icon>
          订单信息
        </h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">订单编号</p>
              <p class="text-sm font-medium text-emerald-600">{{ record.orderCode }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">订单名称</p>
              <p class="text-sm font-medium text-gray-900">{{ record.orderName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">订单类型</p>
              <span :class="getOrderTypeClass(record.orderType)" class="px-2 py-1 text-xs rounded-full">
                {{ getOrderTypeLabel(record.orderType) }}
              </span>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">订单状态</p>
              <span :class="getStatusClass(record.status)" class="px-2 py-1 text-xs rounded-full">
                {{ getStatusLabel(record.status) }}
              </span>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">订单日期</p>
              <p class="text-sm text-gray-900">{{ record.orderDate }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">预计采收日期</p>
              <p class="text-sm text-gray-900">{{ record.expectedHarvestDate || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 作物信息 -->
      <div class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <el-icon><Location /></el-icon>
          作物信息
        </h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">品种路径</p>
              <p class="text-sm font-medium text-gray-900">{{ record.cropCategory || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">作物品种</p>
              <p class="text-sm font-medium text-gray-900">{{ record.cropVariety }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">供应商</p>
              <p class="text-sm text-gray-900">{{ record.supplierName || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 数量信息 -->
      <div class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <el-icon><Goods /></el-icon>
          数量信息
        </h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">计划数量</p>
              <p class="text-sm font-medium text-gray-900">{{ record.plannedQuantity }} {{ record.unit }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">实际数量</p>
              <p class="text-sm font-medium text-gray-900">{{ record.actualQuantity || 0 }} {{ record.unit }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">完成率</p>
              <p class="text-sm font-medium text-emerald-600">
                {{ record.plannedQuantity > 0 ? Math.round((record.actualQuantity / record.plannedQuantity) * 100) : 0 }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 关联作物实例 -->
      <div v-if="record.instanceIds && record.instanceIds.length > 0" class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3">关联作物实例</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-900">已关联 {{ record.instanceIds.length }} 个作物实例</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="id in record.instanceIds" :key="id" class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">
              {{ id }}
            </span>
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div v-if="record.remarks" class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3">备注</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-900">{{ record.remarks }}</p>
        </div>
      </div>

      <!-- 创建信息 -->
      <div class="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
        <span>创建人：{{ record.createBy }}</span>
        <span>创建时间：{{ record.createTime }}</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Goods, Location } from '@element-plus/icons-vue'

defineProps({
  isOpen: { type: Boolean, default: false },
  record: { type: Object, default: null },
})

defineEmits(['close'])

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

const getOrderTypeLabel = (type) => ORDER_TYPE_MAP[type]?.label || '其他'
const getOrderTypeClass = (type) => ORDER_TYPE_MAP[type]?.cls || 'bg-gray-100 text-gray-700'
const getStatusLabel = (status) => STATUS_MAP[status]?.label || status
const getStatusClass = (status) => STATUS_MAP[status]?.cls || 'bg-gray-100 text-gray-700'
</script>

<template>
  <ElModal
    :model-value="modelValue"
    title="订单详情"
    size="lg"
    :width="800"
    :show-submit="false"
    plain-header
    @close="handleClose"
  >
    <div v-if="record" class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
      <!-- 订单基本信息 -->
      <div class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Package class="w-4 h-4" />
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
              <p class="text-sm"><OrderTypeBadge :type="record.orderType" /></p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">订单状态</p>
              <p class="text-sm"><StatusBadge :status="record.status" /></p>
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
          <MapPin class="w-4 h-4" />
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
          <Package class="w-4 h-4" />
          数量信息
        </h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">计划数量</p>
              <p class="text-sm font-medium text-gray-900">
                {{ record.plannedQuantity }} {{ record.unit }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">实际数量</p>
              <p class="text-sm font-medium text-gray-900">
                {{ record.actualQuantity || 0 }} {{ record.unit }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">完成率</p>
              <p class="text-sm font-medium text-emerald-600">
                {{ record.plannedQuantity > 0
                  ? Math.round((record.actualQuantity / record.plannedQuantity) * 100)
                  : 0 }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 关联信息 -->
      <div v-if="record.instanceIds && record.instanceIds.length > 0" class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 mb-3">关联作物实例</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-900">
            已关联 {{ record.instanceIds.length }} 个作物实例
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="id in record.instanceIds"
              :key="id"
              class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded"
            >
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
      <div class="flex items-center justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleClose">关闭</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { Package, MapPin } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import StatusBadge from './StatusBadge.vue'
import OrderTypeBadge from './OrderTypeBadge.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  record: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

function handleClose() {
  emit('update:modelValue', false)
}
</script>

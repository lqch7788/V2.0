<!--
  出库弹窗组件（1:1 迁移自 V1.1 OutboundModal.tsx）
  2026-06-04 V2.1 铁律改造：写操作走 useInventoryTransactionStore.addTransaction()
                  → POST /api/inventory-transactions → 路由内扣减库存 + 写 inventory_transaction 老表
-->
<template>
  <UnifiedModal
    v-if="isOpen && stock"
    :is-open="isOpen"
    :on-close="handleClose"
    title="出库操作"
    size="xxxl"
    :width="945"
    :show-footer="true"
  >
    <template #footer>
      <div class="flex justify-end gap-3">
        <Button variant="secondary" :disabled="isSubmitting" @click="handleClose">
          <X class="w-4 h-4" /> 取消
        </Button>
        <Button
          variant="destructive"
          :disabled="isSubmitting || !quantity || parseFloat(quantity) <= 0 || parseFloat(quantity) > availableQuantity"
          @click="handleSubmit"
        >
          {{ isSubmitting ? '出库中...' : '确认出库' }}
        </Button>
      </div>
    </template>

    <!-- 库存信息 -->
    <div class="bg-gray-50 rounded-lg p-4 mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">库存信息</h4>
      <div class="grid grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-gray-500 block">实例ID</span>
          <span class="font-mono text-gray-900">{{ stock.instanceId }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">作物名称</span>
          <span class="text-gray-900">{{ stock.cropName }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">当前库存</span>
          <span class="text-gray-900 font-medium">{{ stock.currentQuantity }} {{ stock.unit }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">可用数量</span>
          <span class="text-emerald-600 font-medium">{{ availableQuantity }} {{ stock.unit }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">已冻结</span>
          <span class="text-blue-600">{{ stock.frozenQuantity }} {{ stock.unit }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">入库日期</span>
          <span class="text-gray-900">{{ formatDate(stock.inboundDate) }}</span>
        </div>
      </div>
    </div>

    <!-- 警告信息 -->
    <div v-if="quantity && parseFloat(quantity) > availableQuantity"
         class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
      <AlertTriangle class="w-4 h-4 text-red-500 flex-shrink-0" />
      <span class="text-sm text-red-700">出库数量不能超过可用数量（{{ availableQuantity }}）</span>
    </div>

    <!-- 错误信息 -->
    <div v-if="error"
         class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
      <AlertTriangle class="w-4 h-4 text-red-500 flex-shrink-0" />
      <span class="text-sm text-red-700">{{ error }}</span>
    </div>

    <!-- 出库表单 -->
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4">
        <!-- 出库数量 -->
        <div>
          <Label class="block text-sm font-medium text-gray-700 mb-1">
            出库数量 <span class="text-red-500">*</span>
          </Label>
          <div class="flex items-center gap-2">
            <NumberInput
              :value="quantity"
              @change="(val) => quantity = val"
              :placeholder="`最大 ${availableQuantity}`"
              :decimals="2"
              class="h-10 px-3 flex-1 min-w-0"
            />
            <span class="text-gray-500 shrink-0">{{ stock.unit }}</span>
          </div>
        </div>

        <!-- 业务类型 -->
        <div>
          <Label class="block text-sm font-medium text-gray-700 mb-1">业务类型</Label>
          <Select :value="businessType" @update:value="(val) => businessType = val">
            <SelectTrigger :class="deepInputClass">
              <SelectValue placeholder="其他" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="bt in BUSINESS_TYPE_OPTIONS" :key="bt.value" :value="bt.value">
                {{ OUTBOUND_BUSINESS_TYPE_META[bt.value].label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 业务单号 -->
        <div>
          <Label class="block text-sm font-medium text-gray-700 mb-1">业务单号</Label>
          <Input
            type="text"
            :value="businessCode"
            @change="(e) => businessCode = e.target.value"
            placeholder="请输入业务单号（可选）"
            :class="deepInputClass"
          />
        </div>
      </div>

      <!-- 备注 -->
      <div>
        <Label class="block text-sm font-medium text-gray-700 mb-1">备注</Label>
        <TextArea
          :value="remarks"
          @change="(e) => remarks = e.target.value"
          placeholder="请输入备注信息（可选）"
          :rows="3"
          :class="deepInputClass + ' resize-none'"
        />
      </div>
    </div>
  </UnifiedModal>
</template>

<script setup>
/**
 * 出库弹窗组件（1:1 迁移自 V1.1 OutboundModal.tsx）
 */
import { ref, computed } from 'vue'
import { AlertTriangle, X } from 'lucide-vue-next'
import { UnifiedModal, Button, Input, NumberInput, Label, TextArea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { useInventoryTransactionStore } from '@/stores/useInventoryTransactionStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { OutboundBusinessType, OUTBOUND_BUSINESS_TYPE_META } from '@/constants/outboundConstants'

const deepInputClass = "px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  stock: { type: Object, default: null },
  onSuccess: { type: Function, default: () => {} }
})

const BUSINESS_TYPE_OPTIONS = [
  { value: OutboundBusinessType.CUSTOMER_SALE },
  { value: OutboundBusinessType.TRANSFER_OUT },
  { value: OutboundBusinessType.DAMAGE_LOSS },
  { value: OutboundBusinessType.GIFT_SAMPLE },
  { value: OutboundBusinessType.INVENTORY_ADJUST },
  { value: OutboundBusinessType.OTHER }
]

const quantity = ref('')
const businessType = ref(OutboundBusinessType.OTHER)
const businessCode = ref('')
const remarks = ref('')
const isSubmitting = ref(false)
const error = ref('')

const availableQuantity = computed(() => {
  if (!props.stock) return 0
  return props.stock.currentQuantity - props.stock.frozenQuantity
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try { return new Date(dateStr).toLocaleDateString('zh-CN') } catch { return dateStr }
}

const handleSubmit = async () => {
  const qty = parseFloat(quantity.value)
  if (isNaN(qty) || qty <= 0) {
    error.value = '请输入有效的出库数量'
    return
  }
  if (qty > availableQuantity.value) {
    error.value = `出库数量不能超过可用数量（${availableQuantity.value}）`
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    const result = await useInventoryTransactionStore().addTransaction({
      instanceId: props.stock.instanceId,
      businessId: props.stock.businessId,
      businessType: businessType.value,
      businessCode: businessCode.value || undefined,
      quantity: qty,
      operatorId: 'system',
      operatorName: '系统操作员',
      remarks: remarks.value || undefined
    })

    if (result) {
      useInventoryStore().notifyChange()
      props.onSuccess()
      handleClose()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '出库失败'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  quantity.value = ''
  businessType.value = OutboundBusinessType.OTHER
  businessCode.value = ''
  remarks.value = ''
  error.value = ''
  props.onClose()
}
</script>

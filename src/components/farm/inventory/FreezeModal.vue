<!--
  库存冻结弹窗（订单关联 / 手动独立 双模式）1:1 迁移自 V1.1 FreezeModal.tsx
  2026-07-02 新建 + Phase 3 订单下拉选择
  样式对齐 AddStockModal：Modal 组件 + 渐变绿头部 + 可拖拽缩放最大化

  入口：库存表格操作列"冻结"按钮
  数据流：组件 → freezeInventory API → POST /api/inventory/freeze → inventory_freeze + inventory_stock
-->
<template>
  <Modal
    v-if="isOpen && stock"
    :is-open="isOpen"
    :on-close="onClose"
    :on-submit="handleSubmit"
    :title="titleContent"
    submit-text="确认冻结"
    cancel-text="取消"
    size="lg"
    :width="680"
    :height="580"
  >
    <div class="space-y-4">
      <!-- 库存概览 -->
      <div class="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <div class="text-xs text-gray-500">当前数量</div>
          <div class="text-lg font-semibold text-gray-900">{{ stock.currentQuantity }} {{ stock.unit }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">已冻结</div>
          <div class="text-lg font-semibold text-blue-600">{{ stock.frozenQuantity }} {{ stock.unit }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">可冻结</div>
          <div class="text-lg font-semibold text-emerald-600">{{ available }} {{ stock.unit }}</div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle class="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
        <div class="text-sm text-red-700">{{ error }}</div>
      </div>

      <!-- 冻结方式切换 -->
      <div>
        <Label class="text-gray-700 mb-2">冻结方式</Label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="setMode('manual')"
            :class="['py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all',
              mode === 'manual' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']"
          >
            <User class="w-4 h-4 inline mr-1" />
            手动冻结
          </button>
          <button
            type="button"
            @click="setMode('order')"
            :class="['py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all',
              mode === 'order' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']"
          >
            <ShoppingCart class="w-4 h-4 inline mr-1" />
            关联订单
          </button>
        </div>
      </div>

      <!-- 订单关联模式 -->
      <div v-if="mode === 'order'" class="space-y-3">
        <FormField label="选择订单">
          <div v-if="ordersLoading" class="flex items-center gap-2 py-2 text-gray-500 text-sm">
            <Loader2 class="w-4 h-4 animate-spin" />
            加载活跃订单中...
          </div>
          <div v-else-if="ordersLoadError" class="text-sm text-red-600 flex items-start gap-1">
            <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
            加载订单失败：{{ ordersLoadError }}
          </div>
          <div v-else-if="activeOrders.length === 0" class="text-sm text-amber-600 flex items-start gap-1">
            <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
            暂无可关联的活跃订单（状态为"进行中"或"已确认"的订单）
          </div>
          <Select v-else :value="selectedOrderId" @update:value="(v) => selectedOrderId = v">
            <SelectTrigger>
              <SelectValue placeholder="请选择订单..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="order in activeOrders" :key="order.id" :value="order.id">
                <span class="font-mono text-xs">{{ order.orderCode }}</span>
                <span class="mx-1.5 text-gray-400">|</span>
                <span class="text-gray-700">{{ (order.cropName || order.cropVariety) || '-' }}</span>
                <span v-if="order.cropName && order.cropVariety" class="text-gray-400 ml-0.5">·{{ order.cropVariety }}</span>
                <span class="ml-2 text-emerald-600 font-medium">{{ order.plannedQuantity }}{{ order.unit || '' }}</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <!-- 选中订单详情 -->
        <div v-if="selectedOrder" class="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5 text-sm">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-gray-500">订单编号</span>
              <div class="font-mono font-medium">{{ selectedOrder.orderCode }}</div>
            </div>
            <div>
              <span class="text-gray-500">客户</span>
              <div class="font-medium">{{ selectedOrder.customerName || '-' }}</div>
            </div>
            <div>
              <span class="text-gray-500">作物</span>
              <div>{{ selectedOrder.cropName || selectedOrder.cropVariety || '-' }}{{ selectedOrder.cropName && selectedOrder.cropVariety ? ` · ${selectedOrder.cropVariety}` : '' }}</div>
            </div>
            <div>
              <span class="text-gray-500">交货日期</span>
              <div class="font-medium">{{ selectedOrder.expectedDeliveryDate || '-' }}</div>
            </div>
            <div>
              <span class="text-gray-500">计划数量</span>
              <div class="font-medium text-emerald-600">{{ selectedOrder.plannedQuantity }} {{ selectedOrder.unit || '' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 冻结数量 -->
      <FormField :label="`冻结数量 (${stock.unit || '-'})`">
        <Input
          type="number"
          :min="0"
          :max="available"
          :value="freezeQuantity || ''"
          @change="(e) => { freezeQuantity = Number(e.target.value) || 0; error = '' }"
          :placeholder="mode === 'order' && selectedOrder ? `订单计划 ${selectedOrder.plannedQuantity}${selectedOrder.unit || ''} | 库存可冻 ${available}` : `最大可冻结: ${available}`"
        />
      </FormField>

      <!-- 手动冻结：用途 -->
      <FormField v-if="mode === 'manual'" label="冻结用途">
        <Input
          :value="purpose"
          @change="(e) => { purpose = e.target.value; error = '' }"
          placeholder="如: 内部留种 / 品质待检 / 实验预留 / ..."
        />
      </FormField>

      <!-- 备注 -->
      <FormField label="备注（可选）">
        <TextArea
          :value="remarks"
          @change="(e) => remarks = e.target.value"
          placeholder="补充说明..."
          :rows="2"
        />
      </FormField>
    </div>
  </Modal>
</template>

<script setup>
/**
 * 库存冻结弹窗（1:1 迁移自 V1.1 FreezeModal.tsx）
 */
import { ref, computed, watch, h } from 'vue'
import { Snowflake, ShoppingCart, User, AlertCircle, Loader2 } from 'lucide-vue-next'
import { Modal, FormField, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, TextArea } from '@/components/ui'
import { showAlert } from '@/lib/dialogService'
import { freezeInventory, getActiveOrders } from '@/services/inventoryService'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  stock: { type: Object, default: null },
  onClose: { type: Function, required: true },
  onSuccess: { type: Function, default: undefined }
})

const mode = ref('manual')
const freezeQuantity = ref(0)
const purpose = ref('')
const remarks = ref('')
const error = ref('')

const ordersLoading = ref(false)
const activeOrders = ref([])
const ordersLoadError = ref(null)
const selectedOrderId = ref('')

const selectedOrder = computed(() => activeOrders.value.find(o => o.id === selectedOrderId.value))
const available = computed(() => (props.stock?.currentQuantity ?? 0) - (props.stock?.frozenQuantity ?? 0))

const titleContent = computed(() => h('div', { class: 'flex items-center gap-2' }, [
  h(Snowflake, { class: 'w-5 h-5 text-white' }),
  h('span', null, `冻结库存 - ${props.stock?.instanceId || ''}`)
]))

const setMode = (m) => { mode.value = m; error.value = '' }

// 加载活跃订单 + 重置表单
watch(() => props.isOpen, (open) => {
  if (open) {
    mode.value = 'manual'
    freezeQuantity.value = 0
    purpose.value = ''
    remarks.value = ''
    error.value = ''
    selectedOrderId.value = ''
    ordersLoading.value = true
    ordersLoadError.value = null
    getActiveOrders().then(orders => {
      activeOrders.value = orders
      ordersLoading.value = false
    }).catch((e) => {
      console.error('[FreezeModal] 加载活跃订单失败:', e)
      ordersLoadError.value = e instanceof Error ? e.message : '加载订单列表失败'
      ordersLoading.value = false
    })
  }
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''
  if (!props.stock?.instanceId) return

  if (freezeQuantity.value <= 0) {
    error.value = '请输入有效的冻结数量'
    return
  }
  if (freezeQuantity.value > available.value) {
    error.value = `冻结数量不能超过可冻结数量（${available.value}）`
    return
  }
  if (mode.value === 'manual' && !purpose.value.trim()) {
    error.value = '请填写冻结用途'
    return
  }
  if (mode.value === 'order' && !selectedOrderId.value) {
    error.value = '请选择关联订单'
    return
  }

  const result = await freezeInventory({
    instanceId: props.stock.instanceId,
    freezeType: mode.value,
    freezeQuantity: freezeQuantity.value,
    orderId: mode.value === 'order' ? selectedOrderId.value : undefined,
    purpose: mode.value === 'manual' ? purpose.value.trim() : `订单预留: ${selectedOrder.value?.orderCode || selectedOrderId.value}`,
    remarks: remarks.value.trim() || undefined
  })

  if (result.success) {
    showAlert(`已成功冻结 ${freezeQuantity.value} ${props.stock.unit || ''}`)
    props.onSuccess?.()
    props.onClose()
  } else {
    error.value = result.error || '冻结失败'
  }
}
</script>

<template>
  <!-- 编辑订单弹窗 - 与 V1.1 EditModal.tsx 1:1 翻译（900×650，与 4 模块新增/编辑统一） -->
  <ElModal
    :model-value="isOpen"
    title="编辑订单"
    :width="900"
    :height="650"
    @update:model-value="(v) => emit('update:isOpen', v)"
    @close="handleClose"
  >
    <!-- 表单内容 - 所有字段 2 个一排（grid-cols-2），作物信息/收货地址/备注 单独一行 -->
    <div class="space-y-4 modal-form-inputs">
      <div class="grid grid-cols-2 gap-4">
        <!-- 行 1: 订单编号 | 订单名称 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
          <el-input v-model="form.orderCode" readonly class="bg-gray-50 text-gray-600 border-gray-300" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">订单名称 <span class="text-red-500">*</span></label>
          <el-input v-model="form.orderName" placeholder="请输入订单名称" />
          <p v-if="errors.orderName" class="text-xs text-red-500 mt-1">{{ errors.orderName }}</p>
        </div>

        <!-- 行 2: 订单类型 | 订单日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">订单类型</label>
          <el-select v-model="form.orderType" class="w-full">
            <el-option
              v-for="opt in orderTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">订单日期</label>
          <el-date-picker
            v-model="form.orderDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 行 3: 作物信息（fullWidth，与 V1.1 EditModal.tsx L358-383 1:1 对齐） -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            <span class="text-red-500">*</span> 作物信息
          </label>
          <CropCodeSelector
            v-model="form.cropCode"
            :display-label="form.cropVariety"
            placeholder="搜索或选择作物品种..."
            size="md"
            show-full-path
            @change="handleCropChange"
          />
          <!-- selectedCrop 绿色信息卡（与 V1.1 EditModal.tsx L370-381 1:1） -->
          <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <div class="text-emerald-700 flex items-center gap-1">
              <Leaf class="w-3 h-3 flex-shrink-0" />
              <span>
                {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
                <template v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</template>
              </span>
            </div>
            <div class="text-emerald-600 mt-0.5">
              编码：{{ selectedCrop.cropCode }}
            </div>
          </div>
          <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
        </div>

        <!-- 行 4: 单位 | 计划数量 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
          <el-select v-model="form.unit" class="w-full">
            <el-option label="株" value="株" />
            <el-option label="棵" value="棵" />
            <el-option label="袋" value="袋" />
            <el-option label="公斤" value="公斤" />
            <el-option label="吨" value="吨" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">计划数量 <span class="text-red-500">*</span></label>
          <el-input-number v-model="form.plannedQuantity" :min="0" placeholder="请输入计划数量" class="w-full" />
          <p v-if="errors.plannedQuantity" class="text-xs text-red-500 mt-1">{{ errors.plannedQuantity }}</p>
        </div>

        <!-- 行 5: 完成数量 | 客户 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">完成数量</label>
          <el-input-number v-model="form.completedQuantity" :min="0" placeholder="请输入完成数量" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">客户</label>
          <el-select
            v-model="form.customerId"
            placeholder="请选择客户"
            clearable
            class="w-full"
            @change="handleCustomerChange"
          >
            <el-option
              v-for="customer in customerOptions"
              :key="customer.id"
              :label="customer.customerName"
              :value="customer.id"
            />
          </el-select>
        </div>

        <!-- 行 6: 客户电话 | 预计完成日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">客户电话</label>
          <el-input v-model="form.customerPhone" placeholder="请输入客户电话" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">预计完成日期</label>
          <el-date-picker
            v-model="form.expectedCompletionDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 行 7: 订单状态 | 收货地址 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
          <el-select v-model="form.orderStatus" class="w-full">
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <p v-if="form.orderStatus === 'completed' || form.orderStatus === 'cancelled'" class="text-xs text-orange-500 mt-1">⚠️ 选择终态后订单将无法编辑</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">收货地址</label>
          <el-input v-model="form.deliveryAddress" placeholder="请输入收货地址" />
        </div>

        <!-- 备注 - 单独一行 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="handleClose" :disabled="isSubmitting">取消</el-button>
        <el-button type="primary" size="small" @click="handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? '保存中...' : '保存修改' }}
        </el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * 编辑订单弹窗 - 1:1 翻译 V1.1 EditModal.tsx
 * @see D:/TMcrop/yuanxingtu/V1.1/src/components/farm/order/modals/EditModal.tsx
 */
import { ref, watch, computed, onUnmounted } from 'vue'
import { ElModal } from '@/components/ui'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { useCustomerStore } from '@/stores/modules/customer'
import { CropOrderStatus } from '@/types/crop'
import { showAlert, showConfirm } from '@/lib/dialogService'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf } from 'lucide-vue-next'
import { getVarietyByCode, searchVarieties } from '@/services/cropVarietyService'

const props = defineProps({
  isOpen: Boolean,
  record: Object,
  orderTypeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success', 'update:isOpen'])

const orderDataStore = useOrderDataStore()
const customerStore = useCustomerStore()

// 客户下拉选项
const customerOptions = computed(() => customerStore.customers || [])

// 客户选择变更时自动填充（与 V1.1 EditModal.tsx L444-455 1:1）
const handleCustomerChange = (customerId) => {
  const customer = customerOptions.value.find(c => c.id === customerId)
  if (customer) {
    form.value.customerName = customer.customerName || ''
    form.value.customerPhone = customer.contactPhone || customer.customerPhone || ''
    form.value.deliveryAddress = customer.deliveryAddress || ''
  }
}

// 表单数据（与 V1.1 EditModal.tsx L40-61 1:1 - 含 customerName 字段）
const form = ref({
  orderCode: '',
  orderName: '',
  orderType: 'production',
  cropCode: '',
  cropCategory: '',
  cropVariety: '',
  plannedQuantity: 0,
  completedQuantity: 0,
  unit: '株',
  customerId: '',
  customerName: '',         // 修复 P0-7：补全 customerName 字段（V1.1 EditModal.tsx 用 record.customerName 兜底）
  customerPhone: '',
  deliveryAddress: '',
  orderDate: '',
  expectedCompletionDate: '',
  remarks: '',
  orderStatus: 'in_progress'
})

const selectedCrop = ref(null)
const errors = ref({})
const isSubmitting = ref(false)

// 作物选择回调（与 V1.1 EditModal.tsx L160-184 1:1）
function handleCropChange(code, varietyInfo) {
  form.value.cropCode = code || ''
  selectedCrop.value = varietyInfo
  if (varietyInfo) {
    const fullPath = [
      varietyInfo.categoryName,
      varietyInfo.typeName,
      varietyInfo.varietyName,
      varietyInfo.subVariety1Name,
    ].filter(Boolean).join(' > ')
    const cropName = varietyInfo.subVariety1Name || varietyInfo.varietyName
    form.value.cropVariety = cropName || ''
    form.value.cropCategory = fullPath || ''
    errors.value = { ...errors.value, cropVariety: '' }
  } else {
    form.value.cropVariety = ''
    form.value.cropCategory = ''
  }
}

// 反查初始化 selectedCrop（与 V1.1 EditModal.tsx L115-157 3 重兜底 1:1）
const initSelectedCrop = (record) => {
  if (!record) {
    selectedCrop.value = null
    return
  }
  const cropName = record.cropVariety || ''
  const cropCodeValue = record.cropCode || ''

  // 兜底 1：按 cropCode 精准匹配
  if (cropCodeValue) {
    try {
      const byCode = getVarietyByCode(cropCodeValue)
      if (byCode) {
        selectedCrop.value = byCode
        return
      }
    } catch { /* 静默 */ }
  }
  // 兜底 2：用 cropVariety 模糊搜索
  if (cropName) {
    try {
      const results = searchVarieties(cropName)
      if (results && results.length > 0) {
        const hit = results[0]
        selectedCrop.value = {
          id: '',
          cropCode: hit.value || cropCodeValue,
          categoryName: '',
          typeName: '',
          varietyName: hit.label || cropName,
          subVariety1Name: '',
          fullPath: hit.fullPath || record.cropCategory || cropName
        }
        return
      }
    } catch { /* 静默 */ }
  }
  // 兜底 3：用 record 自身字段拼路径
  if (cropName) {
    selectedCrop.value = {
      id: '',
      cropCode: cropCodeValue,
      categoryName: '',
      typeName: '',
      varietyName: cropName,
      subVariety1Name: '',
      fullPath: record.cropCategory || cropName
    }
    return
  }
  selectedCrop.value = null
}

// 监听打开和记录变化
watch([() => props.isOpen, () => props.record], ([isOpenVal, recordVal]) => {
  if (isOpenVal && recordVal) {
    // 已完成/已取消禁止编辑
    if (recordVal.status === CropOrderStatus.COMPLETED || recordVal.status === CropOrderStatus.CANCELLED) {
      const msg = recordVal.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
      showAlert(`该订单已${msg}，无法编辑`)
      emit('update:isOpen', false)
      return
    }
    if (customerStore.fetchCustomers) customerStore.fetchCustomers()
    // 初始化表单（含 customerName 字段）
    form.value = {
      orderCode: recordVal.orderCode || '',
      orderName: recordVal.orderName || '',
      orderType: recordVal.orderType || 'production',
      cropCode: recordVal.cropCode || '',
      cropCategory: recordVal.cropCategory || '',
      cropVariety: recordVal.cropVariety || '',
      plannedQuantity: recordVal.plannedQuantity || 0,
      completedQuantity: recordVal.completedQuantity || 0,
      unit: recordVal.unit || '株',
      customerId: recordVal.customerId || '',
      customerName: recordVal.customerName || '',
      customerPhone: recordVal.customerPhone || '',
      deliveryAddress: recordVal.deliveryAddress || '',
      orderDate: recordVal.orderDate || '',
      expectedCompletionDate: recordVal.expectedCompletionDate || '',
      remarks: recordVal.remarks || '',
      orderStatus: recordVal.status === CropOrderStatus.COMPLETED
        ? 'completed'
        : recordVal.status === CropOrderStatus.CANCELLED
        ? 'cancelled'
        : 'in_progress'
    }
    initSelectedCrop(recordVal)
    errors.value = {}
  } else if (!isOpenVal) {
    // 关闭时清理 selectedCrop
    selectedCrop.value = null
  }
}, { immediate: true })

const handleClose = () => {
  errors.value = {}
  emit('update:isOpen', false)
  emit('close')
}

onUnmounted(() => {
  // CropCodeSelector 自带点击外部关闭，无需手动清理
})

const handleSubmit = async () => {
  if (props.record && (props.record.status === CropOrderStatus.COMPLETED || props.record.status === CropOrderStatus.CANCELLED)) {
    const msg = props.record.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
    await showAlert(`该订单已${msg}，无法编辑`)
    return
  }

  if (form.value.orderStatus === 'completed') {
    const confirmed = await showConfirm(
      '⚠️ 重要提示：\n\n确认将订单标记为完成吗？\n\n完成后该订单将进入保存档案状态：\n• 无法进行任何编辑操作\n• 无法删除订单\n• 无法关联新的作物实例\n\n此操作不可逆，请确认！'
    )
    if (!confirmed) return
  }
  if (form.value.orderStatus === 'cancelled') {
    const confirmed = await showConfirm(
      '⚠️ 重要提示：\n\n确认取消该订单吗？\n\n取消后该订单将无法操作：\n• 无法进行任何编辑操作\n• 无法删除订单\n• 无法关联新的作物实例\n\n此操作不可逆，请确认！'
    )
    if (!confirmed) return
  }

  errors.value = {}
  if (!form.value.orderCode) errors.value.orderCode = '请输入订单编号'
  if (!form.value.orderName) errors.value.orderName = '请输入订单名称'
  if (!form.value.cropVariety) errors.value.cropVariety = '请选择作物品种'
  if (form.value.plannedQuantity <= 0) errors.value.plannedQuantity = '请输入计划数量'
  if (Object.keys(errors.value).length > 0) return

  if (!props.record) return

  // 修复 P0-5: 与 V1.1 EditModal.tsx L247-251 1:1 — 用户选啥就是啥，禁止用 completedQuantity 反推降级
  const finalStatus = form.value.orderStatus === 'completed'
    ? CropOrderStatus.COMPLETED
    : form.value.orderStatus === 'cancelled'
    ? CropOrderStatus.CANCELLED
    : CropOrderStatus.IN_PROGRESS

  isSubmitting.value = true
  try {
    // 修复 P0-6: updates 补全 4 个客户字段（V1.1 EditModal.tsx L254-274 1:1）
    const updates = {
      orderCode: form.value.orderCode,
      orderName: form.value.orderName,
      orderType: form.value.orderType,
      orderDate: form.value.orderDate,
      expectedCompletionDate: form.value.expectedCompletionDate || '',
      cropCategory: form.value.cropCategory,
      cropName: '',
      cropVariety: form.value.cropVariety,
      cropCode: form.value.cropCode || '',
      plannedQuantity: form.value.plannedQuantity,
      completedQuantity: form.value.completedQuantity,
      unit: form.value.unit,
      remarks: form.value.remarks,
      status: finalStatus,
      customerId: form.value.customerId || undefined,
      customerName: form.value.customerName || props.record.customerName || '',
      customerPhone: form.value.customerPhone || '',
      deliveryAddress: form.value.deliveryAddress || ''
    }

    await orderDataStore.updateOrder(props.record.id, updates)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('更新订单失败:', error)
    await showAlert('更新订单失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  transition: box-shadow 0.15s ease-in-out;
  min-height: 38px;
}
:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #10b981 inset !important;
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 2px rgba(16, 185, 129, 0.2) inset !important;
  outline: none;
}
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-size: 14px !important;
}
:deep(.el-select__wrapper) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  min-height: 38px;
  background: #fff;
}
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #10b981 inset !important;
}
:deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 2px rgba(16, 185, 129, 0.2) inset !important;
}
:deep(.el-select__placeholder) {
  font-size: 14px;
  color: #9ca3af;
}
:deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px #ef4444 inset !important;
}
</style>

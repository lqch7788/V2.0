<template>
  <!-- 编辑订单弹窗 - 统一使用 ElModal（V1.1宽度700 → 统一800） -->
  <ElModal
    :model-value="isOpen"
    title="编辑订单"
    :width="784"
    :height="630"
    @update:model-value="(v) => emit('update:isOpen', v)"
    @close="handleClose"
  >
    <!-- 表单内容 - 所有字段 2 个一排（grid-cols-2），备注单独一行（col-span-2） -->
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

        <!-- 行 3: 作物品种 | 品种路径 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作物品种 <span class="text-red-500">*</span></label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <el-input
              v-model="searchKeyword"
              placeholder="搜索作物品种..."
              :class="errors.cropVariety ? 'border-red-500' : ''"
              class="pl-10"
              @focus="showDropdown = true"
            />
            <button
              v-if="searchKeyword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click.stop="clearSearch"
            >
              <X class="w-4 h-4" />
            </button>
            <!-- 下拉选择列表 -->
            <div
              v-if="showDropdown && filteredVarieties.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(variety, index) in filteredVarieties"
                :key="`${variety.value}-${index}`"
                class="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                @click="handleSelectVariety(variety)"
              >
                <div class="text-sm font-medium text-gray-900">{{ variety.label }}</div>
                <div class="text-xs text-gray-500 truncate">{{ variety.fullPath }}</div>
              </div>
            </div>
          </div>
          <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">品种路径</label>
          <el-input v-model="form.cropCategory" placeholder="选择作物品种后自动填充" readonly class="bg-gray-50 text-gray-600 border-gray-300" />
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
      <!-- 修复轮 8 P0-I1-1：提交期按钮 disabled + 文案变化 -->
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
import { ref, watch, computed, onUnmounted } from 'vue'
import { ElModal } from '@/components/ui'
import { Search, X } from 'lucide-vue-next'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { useCustomerStore } from '@/stores/modules/customer'
import { CropOrderStatus } from '@/types/crop'
import { showAlert, showConfirm } from '@/lib/dialogService'
import { initVarieties, getVarietyOptions } from '@/services/cropVarietyService'

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

// 客户下拉选项（与 V1.1 EditModal.tsx L461 一致）
const customerOptions = computed(() => customerStore.customers || [])

// 客户选择变更时自动填充（与 V1.1 EditModal.tsx L444-455 一致）
const handleCustomerChange = (customerId) => {
  const customer = customerOptions.value.find(c => c.id === customerId)
  if (customer) {
    form.value.customerName = customer.customerName || ''
    form.value.customerPhone = customer.contactPhone || customer.customerPhone || ''
    form.value.deliveryAddress = customer.deliveryAddress || ''
  }
}

// 表单数据（与V1.1 EditModal.tsx L40-59 一致 - 无 customerName/customerPhone 显式字段）
const form = ref({
  orderCode: '',
  orderName: '',
  orderType: 'production',
  cropCategory: '',
  cropVariety: '',
  plannedQuantity: 0,
  completedQuantity: 0,
  unit: '株',
  customerId: '',
  customerPhone: '',
  deliveryAddress: '',
  orderDate: '',
  expectedCompletionDate: '',
  remarks: '',
  orderStatus: 'in_progress'
})

// 错误信息
const errors = ref({})

// 搜索相关状态（与V1.1一致）
const searchKeyword = ref('')
const showDropdown = ref(false)

// 初始化品种数据
initVarieties()
const varietyOptions = computed(() => getVarietyOptions())

// 过滤品种选项
const filteredVarieties = computed(() => {
  if (!searchKeyword.value.trim()) {
    return varietyOptions.value.slice(0, 20)
  }
  const keyword = searchKeyword.value.toLowerCase()
  return varietyOptions.value.filter(opt =>
    opt.label.toLowerCase().includes(keyword) ||
    opt.fullPath.toLowerCase().includes(keyword) ||
    opt.varietyCode.toLowerCase().includes(keyword)
  ).slice(0, 20)
})

// 选择品种
const handleSelectVariety = (variety) => {
  form.value.cropVariety = variety.label
  form.value.cropCategory = variety.fullPath
  searchKeyword.value = variety.label
  showDropdown.value = false
  errors.value = { ...errors.value, cropVariety: '' }
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  form.value.cropVariety = ''
  form.value.cropCategory = ''
}

// 监听下拉框显示状态
watch(showDropdown, (val) => {
  if (val) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

function handleClickOutside() {
  showDropdown.value = false
}

// 监听打开和记录变化（V2.0 第6轮 P0 修复：添加 immediate: true + 修复轮 8 P0-I1-3：弹窗打开时刷新客户列表）
watch([() => props.isOpen, () => props.record], ([isOpenVal, recordVal]) => {
  if (isOpenVal && recordVal) {
    // 如果订单已完成或已取消，禁止编辑
    if (recordVal.status === CropOrderStatus.COMPLETED || recordVal.status === CropOrderStatus.CANCELLED) {
      const msg = recordVal.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
      showAlert(`该订单已${msg}，无法编辑`)
      emit('update:isOpen', false)
      return
    }
    // 修复轮 8 P0-I1-3：弹窗打开时刷新客户列表，确保客户下拉有数据
    if (customerStore.fetchCustomers) customerStore.fetchCustomers()
    // 初始化表单
    form.value = {
      orderCode: recordVal.orderCode || '',
      orderName: recordVal.orderName || '',
      orderType: recordVal.orderType || 'production',
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
    searchKeyword.value = recordVal.cropVariety || ''
    errors.value = {}
  }
}, { immediate: true })

// 关闭（V2.0 第6轮 P0 修复：清理拖动/缩放监听器防内存泄漏）
const handleClose = () => {
  errors.value = {}
  showDropdown.value = false
  emit('update:isOpen', false)
  emit('close')
}

// click-outside 监听器卸载清理（V2.0 第6轮 P0 修复 - 防内存泄漏）
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 提交（修复轮 8 P0-I1-1：加 isSubmitting 状态，提交期间按钮 disabled + 文案变化）
const isSubmitting = ref(false)
const handleSubmit = async () => {
  // 如果订单已完成或已取消，禁止编辑
  if (props.record && (props.record.status === CropOrderStatus.COMPLETED || props.record.status === CropOrderStatus.CANCELLED)) {
    const msg = props.record.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
    await showAlert(`该订单已${msg}，无法编辑`)
    return
  }

  // 如果选择"已完成"或"已取消"，弹出确认警告
  if (form.value.orderStatus === 'completed') {
    const confirmed = await showConfirm(
      '⚠️ 重要提示：\n\n' +
      '确认将订单标记为完成吗？\n\n' +
      '完成后该订单将进入保存档案状态：\n' +
      '• 无法进行任何编辑操作\n' +
      '• 无法删除订单\n' +
      '• 无法关联新的作物实例\n\n' +
      '此操作不可逆，请确认！'
    )
    if (!confirmed) {
      return
    }
  }
  if (form.value.orderStatus === 'cancelled') {
    const confirmed = await showConfirm(
      '⚠️ 重要提示：\n\n' +
      '确认取消该订单吗？\n\n' +
      '取消后该订单将无法操作：\n' +
      '• 无法进行任何编辑操作\n' +
      '• 无法删除订单\n' +
      '• 无法关联新的作物实例\n\n' +
      '此操作不可逆，请确认！'
    )
    if (!confirmed) {
      return
    }
  }

  // 验证（与 V1.1 EditModal.tsx L198-205 一致 - 4 项校验）
  errors.value = {}
  if (!form.value.orderCode) errors.value.orderCode = '请输入订单编号'
  if (!form.value.orderName) errors.value.orderName = '请输入订单名称'
  if (!form.value.cropVariety) errors.value.cropVariety = '请选择作物品种'
  if (form.value.plannedQuantity <= 0) errors.value.plannedQuantity = '请输入计划数量'

  if (Object.keys(errors.value).length > 0) return

  if (!props.record) return

  // 计算最终状态
  const finalStatus = form.value.orderStatus === 'completed'
    ? CropOrderStatus.COMPLETED
    : form.value.orderStatus === 'cancelled'
    ? CropOrderStatus.CANCELLED
    : form.value.completedQuantity > 0
      ? CropOrderStatus.IN_PROGRESS
      : CropOrderStatus.PLANNED

  try {
    const updates = {
      orderCode: form.value.orderCode,
      orderName: form.value.orderName,
      orderType: form.value.orderType,
      orderDate: form.value.orderDate,
      expectedCompletionDate: form.value.expectedCompletionDate || '',
      cropCategory: form.value.cropCategory,
      cropName: '',
      cropVariety: form.value.cropVariety,
      plannedQuantity: form.value.plannedQuantity,
      completedQuantity: form.value.completedQuantity,
      unit: form.value.unit,
      remarks: form.value.remarks,
      status: finalStatus,
      customerId: form.value.customerId || undefined
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
/* V1.1 inputDeepClass 全局样式（修复轮 6 P0-008~016 inputDeepClass 缺失）
   V1.1 EditModal L66 deepInputClass 定义，与 AddModal 同一套样式 */
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
/* 错误状态（V1.1 errors 触发 border-red-500） */
:deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px #ef4444 inset !important;
}
</style>

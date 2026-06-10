<template>
  <!-- 新增订单弹窗 - 统一使用 ElModal（统一800） -->
  <ElModal
    :model-value="isOpen"
    title="新增订单"
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
          <div class="flex gap-2">
            <el-input v-model="form.orderCode" placeholder="点击生成获取编号" class="flex-1" />
            <el-button type="primary" size="small" @click="generateOrderCode">生成</el-button>
          </div>
          <p v-if="errors.orderCode" class="text-xs text-red-500 mt-1">{{ errors.orderCode }}</p>
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

        <!-- 行 3: 创建人 | 作物选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">创建人</label>
          <el-input :model-value="currentUsername" disabled class="bg-gray-50 text-gray-600" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"><span class="text-red-500">*</span> 作物选择</label>
          <CropCodeSelector
            v-model="form.cropCode"
            placeholder="搜索或选择作物品种..."
            size="md"
            show-full-path
            @change="handleCropChange"
          />
          <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <div class="text-emerald-700 flex items-center gap-1">
              <el-icon class="w-3 h-3 flex-shrink-0"><Leaf /></el-icon>
              {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
              <template v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</template>
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
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 行 7: 收货地址（单字段） | （空） -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">收货地址</label>
          <el-input v-model="form.deliveryAddress" placeholder="请输入收货地址" />
        </div>
        <div></div>

        <!-- 备注 - 单独一行 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" @click="handleSubmit">确认创建</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElModal } from '@/components/ui'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { useCustomerStore } from '@/stores/modules/customer'
import { useUserStore } from '@/stores/modules/user'
import { showAlert } from '@/lib/dialogService'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  orderTypeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success', 'update:isOpen'])

const orderDataStore = useOrderDataStore()
const customerStore = useCustomerStore()
const userStore = useUserStore()

// 当前登录用户名
const currentUsername = computed(() => {
  // V1.1 → V2.0 兼容：Login.vue 模拟登录只写 localStorage.username + token，
  // 未触发 userStore.login() 流程，所以 userInfo/currentUser 可能为空。
  // 兜底顺序：userStore → currentUser JSON → localStorage.username（与 CreatePlanModal 一致）
  return userStore.userInfo?.username
    || userStore.userInfo?.name
    || JSON.parse(localStorage.getItem('currentUser') || '{}').username
    || localStorage.getItem('username')
    || '未知用户'
})

const customerOptions = computed(() => customerStore.customers || [])

const handleCustomerChange = (customerId) => {
  const customer = customerOptions.value.find(c => c.id === customerId)
  if (customer) {
    form.value.customerName = customer.customerName || ''
    form.value.customerPhone = customer.contactPhone || customer.customerPhone || ''
    form.value.deliveryAddress = customer.deliveryAddress || ''
  }
}

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
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  orderDate: new Date().toISOString().slice(0, 10),
  expectedCompletionDate: '',
  remarks: ''
})

const selectedCrop = ref(null)

const handleCropChange = (code, varietyInfo) => {
  form.value.cropCode = code
  selectedCrop.value = varietyInfo
  if (varietyInfo) {
    const fullPath = [
      varietyInfo.categoryName,
      varietyInfo.typeName,
      varietyInfo.varietyName,
      varietyInfo.subVariety1Name,
    ].filter(Boolean).join(' > ')
    const cropName = varietyInfo.subVariety1Name || varietyInfo.varietyName
    form.value.cropVariety = cropName
    form.value.cropCategory = fullPath
    errors.value = { ...errors.value, cropVariety: '' }
  } else {
    form.value.cropVariety = ''
    form.value.cropCategory = ''
  }
}

const errors = ref({})

const generateOrderCode = () => {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const timestampStr = `${year}${month}${day}`
  form.value.orderCode = `DD${timestampStr}0001`
}

watch(() => props.isOpen, (val) => {
  if (val) {
    if (customerStore.fetchCustomers) {
      customerStore.fetchCustomers()
    }
    form.value = {
      orderCode: generateOrderCode(),
      orderName: '',
      orderType: 'production',
      cropCode: '',
      cropCategory: '',
      cropVariety: '',
      plannedQuantity: 0,
      completedQuantity: 0,
      unit: '株',
      customerId: '',
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedCompletionDate: '',
      remarks: ''
    }
    selectedCrop.value = null
    errors.value = {}
  }
})

const handleClose = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleSubmit = async () => {
  errors.value = {}
  if (!form.value.orderCode) errors.value.orderCode = '请输入订单编号'
  if (!form.value.orderName) errors.value.orderName = '请输入订单名称'
  if (!form.value.cropVariety) errors.value.cropVariety = '请选择作物品种'
  if (form.value.plannedQuantity <= 0) errors.value.plannedQuantity = '请输入计划数量'

  if (Object.keys(errors.value).length > 0) return

  try {
    const newOrder = {
      orderCode: form.value.orderCode || `DD${Date.now()}`,
      orderName: form.value.orderName,
      orderType: form.value.orderType,
      cropCategory: form.value.cropCategory,
      cropName: '',
      cropVariety: form.value.cropVariety,
      plannedQuantity: form.value.plannedQuantity,
      completedQuantity: form.value.completedQuantity,
      unit: form.value.unit,
      orderDate: form.value.orderDate,
      expectedCompletionDate: form.value.expectedCompletionDate,
      status: 'planned',
      createBy: currentUsername.value,
      remarks: form.value.remarks,
      customerId: form.value.customerId || undefined,
      customerName: form.value.customerName || '',
      customerPhone: form.value.customerPhone,
      deliveryAddress: form.value.deliveryAddress,
      instanceIds: [],
    }

    await orderDataStore.addOrder(newOrder)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('创建订单失败:', error)
    await showAlert('创建订单失败，请重试')
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

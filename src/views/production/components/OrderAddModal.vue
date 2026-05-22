<template>
  <ElModal
    :model-value="modelValue"
    title="新增订单"
    size="lg"
    :width="700"
    :show-submit="false"
    draggable
    @close="handleClose"
  >
    <div class="px-2">
      <div class="grid grid-cols-2 gap-4">
        <!-- 订单编号 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">订单编号</label>
          <div class="flex gap-2">
            <el-input
              v-model="formData.orderCode"
              placeholder="点击生成获取编号"
              :class="errors.orderCode ? 'border-red-500' : ''"
              class="flex-1"
            />
            <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="regenerateCode">
              生成
            </button>
          </div>
          <p v-if="errors.orderCode" class="text-xs text-red-500 mt-1">{{ errors.orderCode }}</p>
        </div>

        <!-- 订单名称 -->
        <div class="col-span-2">
          <label class="block text-sm text-gray-700 mb-1">
            订单名称 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="formData.orderName"
            placeholder="请输入订单名称"
            :class="errors.orderName ? 'border-red-500' : ''"
          />
          <p v-if="errors.orderName" class="text-xs text-red-500 mt-1">{{ errors.orderName }}</p>
        </div>

        <!-- 订单类型 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">订单类型</label>
          <el-select v-model="formData.orderType" class="w-full">
            <el-option
              v-for="opt in orderTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <!-- 订单日期 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">订单日期</label>
          <el-date-picker
            v-model="formData.orderDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 作物品种 -->
        <div class="col-span-2">
          <label class="block text-sm text-gray-700 mb-1">
            <span class="text-red-500">*</span> 作物选择
          </label>
          <CropCodeSelector
            v-model="cropCode"
            @change="handleCropChange"
            placeholder="搜索或选择作物品种..."
            size="md"
            show-full-path
          />
          <div
            v-if="selectedCrop"
            class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs"
          >
            <div class="text-emerald-700 flex items-center gap-1">
              <Leaf class="w-4 h-4 flex-shrink-0" />
              {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
              <template v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</template>
            </div>
            <div class="text-emerald-600 mt-0.5">编码：{{ selectedCrop.cropCode }}</div>
          </div>
          <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
        </div>

        <!-- 单位 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">单位</label>
          <el-select v-model="formData.unit" class="w-full">
            <el-option label="株" value="株" />
            <el-option label="棵" value="棵" />
            <el-option label="袋" value="袋" />
            <el-option label="公斤" value="公斤" />
            <el-option label="吨" value="吨" />
          </el-select>
        </div>

        <!-- 计划数量 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">
            计划数量 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model.number="formData.plannedQuantity"
            type="number"
            placeholder="请输入计划数量"
            :class="errors.plannedQuantity ? 'border-red-500' : ''"
          />
          <p v-if="errors.plannedQuantity" class="text-xs text-red-500 mt-1">{{ errors.plannedQuantity }}</p>
        </div>

        <!-- 实际数量 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">实际数量</label>
          <el-input
            v-model.number="formData.actualQuantity"
            type="number"
            placeholder="请输入实际数量"
          />
        </div>

        <!-- 供应商 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">供应商</label>
          <el-input
            v-model="formData.supplierName"
            placeholder="请输入供应商名称"
          />
        </div>

        <!-- 预计采收日期 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">预计采收日期</label>
          <el-date-picker
            v-model="formData.expectedHarvestDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 备注 -->
        <div class="col-span-2">
          <label class="block text-sm text-gray-700 mb-1">备注</label>
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleClose">取消</button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleSubmit">确认创建</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Leaf } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { showAlert } from '@/lib/dialogService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  orderTypeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'success'])

const formData = ref({
  orderCode: '',
  orderName: '',
  orderType: 'production',
  cropCategory: '',
  cropVariety: '',
  plannedQuantity: 0,
  actualQuantity: 0,
  unit: '株',
  supplierName: '',
  orderDate: new Date().toISOString().split('T')[0],
  expectedHarvestDate: '',
  remarks: '',
})

const errors = ref({})
const cropCode = ref('')
const selectedCrop = ref(null)

// 订单状态
const CropOrderStatus = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    formData.value.orderCode = generateOrderCode()
    cropCode.value = ''
    selectedCrop.value = null
    errors.value = {}
  }
})

function generateOrderCode() {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const timestampStr = `${year}${month}${day}`
  return `DD${timestampStr}0001`
}

function regenerateCode() {
  formData.value.orderCode = generateOrderCode()
}

function handleCropChange(code, varietyInfo) {
  cropCode.value = code
  selectedCrop.value = varietyInfo
  if (varietyInfo) {
    const fullPath = [
      varietyInfo.categoryName,
      varietyInfo.typeName,
      varietyInfo.varietyName,
      varietyInfo.subVariety1Name,
    ].filter(Boolean).join(' > ')
    const cropName = varietyInfo.subVariety1Name || varietyInfo.varietyName
    formData.value.cropVariety = cropName
    formData.value.cropCategory = fullPath
    errors.value.cropVariety = ''
  } else {
    formData.value.cropVariety = ''
    formData.value.cropCategory = ''
  }
}

async function handleSubmit() {
  const newErrors = {}
  if (!formData.value.orderCode) newErrors.orderCode = '请输入订单编号'
  if (!formData.value.orderName) newErrors.orderName = '请输入订单名称'
  if (!formData.value.cropVariety) newErrors.cropVariety = '请选择作物品种'
  if (formData.value.plannedQuantity <= 0) newErrors.plannedQuantity = '请输入计划数量'

  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors
    return
  }

  const newOrder = {
    orderCode: formData.value.orderCode,
    orderName: formData.value.orderName,
    orderType: formData.value.orderType,
    orderDate: formData.value.orderDate,
    expectedHarvestDate: formData.value.expectedHarvestDate || undefined,
    cropCategory: formData.value.cropCategory,
    cropName: '',
    cropVariety: formData.value.cropVariety,
    plannedQuantity: formData.value.plannedQuantity,
    actualQuantity: formData.value.actualQuantity,
    unit: formData.value.unit,
    supplierName: formData.value.supplierName,
    status: CropOrderStatus.PLANNED,
    remarks: formData.value.remarks,
    instanceIds: [],
    createBy: localStorage.getItem('username') || '',
  }

  console.log('[AddModal] 准备创建的订单数据:', JSON.stringify(newOrder, null, 2))

  try {
    const { useOrderDataStore } = await import('@/stores')
    const store = useOrderDataStore()
    const result = await store.addOrder(newOrder)
    console.log('[AddModal] 创建订单成功，返回数据:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('创建订单失败:', error)
    await showAlert('创建订单失败，请重试')
    return
  }

  emit('success')
  emit('update:modelValue', false)

  // 重置表单
  formData.value = {
    orderCode: '',
    orderName: '',
    orderType: 'production',
    cropCategory: '',
    cropVariety: '',
    plannedQuantity: 0,
    actualQuantity: 0,
    unit: '株',
    supplierName: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    remarks: '',
  }
  cropCode.value = ''
  selectedCrop.value = null
  errors.value = {}
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

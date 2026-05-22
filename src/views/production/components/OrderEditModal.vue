<template>
  <ElModal
    :model-value="modelValue"
    title="编辑订单"
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
          <el-input v-model="formData.orderCode" readonly class="bg-gray-50" />
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

        <!-- 作物品种 - 搜索框 -->
        <div class="col-span-2">
          <label class="block text-sm text-gray-700 mb-1">
            作物品种 <span class="text-red-500">*</span>
          </label>
          <div class="relative">
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
            </div>
            <!-- 下拉选择列表 -->
            <div
              v-if="showDropdown && filteredVarieties.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
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

        <!-- 品种路径（自动填充） -->
        <div class="col-span-2">
          <label class="block text-sm text-gray-700 mb-1">品种路径</label>
          <el-input
            v-model="formData.cropCategory"
            readonly
            placeholder="选择作物品种后自动填充"
            class="bg-gray-50"
          />
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

        <!-- 是否完成 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">订单完成</label>
          <el-select v-model="isCompleted" class="w-full">
            <el-option label="否" :value="false" />
            <el-option label="是" :value="true" />
          </el-select>
          <p v-if="isCompleted" class="text-xs text-orange-500 mt-1">⚠️ 选择"是"后订单将无法编辑</p>
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
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleSubmit">保存修改</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import { showAlert, showConfirm } from '@/lib/dialogService'
import {
  initVarieties,
  getVarietyOptions,
} from '@/services/cropVarietyService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  record: { type: Object, default: null },
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
  orderDate: '',
  expectedHarvestDate: '',
  remarks: '',
})

const errors = ref({})
const searchKeyword = ref('')
const showDropdown = ref(false)
const isCompleted = ref(false)

// 订单状态
const CropOrderStatus = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

initVarieties()
const varietyOptions = computed(() => getVarietyOptions())

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

watch(() => props.record, (record) => {
  if (record && props.modelValue) {
    if (record.status === CropOrderStatus.COMPLETED) {
      showAlert('该订单已完成，无法编辑')
      emit('update:modelValue', false)
      return
    }
    formData.value = {
      orderCode: record.orderCode || '',
      orderName: record.orderName || '',
      orderType: record.orderType || 'production',
      cropCategory: record.cropCategory || '',
      cropVariety: record.cropVariety || '',
      plannedQuantity: record.plannedQuantity || 0,
      actualQuantity: record.actualQuantity || 0,
      unit: record.unit || '株',
      supplierName: record.supplierName || '',
      orderDate: record.orderDate || '',
      expectedHarvestDate: record.expectedHarvestDate || '',
      remarks: record.remarks || '',
    }
    searchKeyword.value = record.cropVariety || ''
    isCompleted.value = record.status === CropOrderStatus.COMPLETED
  }
})

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

function handleSelectVariety(variety) {
  formData.value.cropVariety = variety.label
  formData.value.cropCategory = variety.fullPath
  searchKeyword.value = variety.label
  showDropdown.value = false
  errors.value.cropVariety = ''
}

function clearSearch() {
  searchKeyword.value = ''
  formData.value.cropVariety = ''
  formData.value.cropCategory = ''
}

async function handleSubmit() {
  if (props.record && props.record.status === CropOrderStatus.COMPLETED) {
    await showAlert('该订单已完成，无法编辑')
    emit('update:modelValue', false)
    return
  }

  if (isCompleted.value) {
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

  const newErrors = {}
  if (!formData.value.orderCode) newErrors.orderCode = '请输入订单编号'
  if (!formData.value.orderName) newErrors.orderName = '请输入订单名称'
  if (!formData.value.cropVariety) newErrors.cropVariety = '请选择作物品种'
  if (formData.value.plannedQuantity <= 0) newErrors.plannedQuantity = '请输入计划数量'

  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors
    return
  }

  if (!props.record) return

  const updates = {
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
    remarks: formData.value.remarks,
    status: isCompleted.value ? CropOrderStatus.COMPLETED : props.record.status,
  }

  console.log('[EditModal] 准备更新的订单数据:', JSON.stringify(updates, null, 2))

  try {
    const { useOrderDataStore } = await import('@/stores')
    const store = useOrderDataStore()
    const result = await store.updateOrder(props.record.id, updates)
    console.log('[EditModal] 更新订单成功:', result)
  } catch (error) {
    console.error('更新订单失败:', error)
    await showAlert('更新订单失败，请重试')
    return
  }

  emit('success')
  emit('update:modelValue', false)
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

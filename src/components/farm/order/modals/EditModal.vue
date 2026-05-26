<template>
  <!-- 编辑订单弹窗 - 从V1.1 EditModal.tsx 1:1迁移 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    @open="initForm"
    title="编辑订单"
    width="700px"
    top="5vh"
    @confirm="handleSubmit"
  >
    <div class="grid grid-cols-2 gap-4">
      <!-- 订单编号 (只读) -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">订单编号</label>
        <el-input :model-value="formData.orderCode" readonly disabled />
      </div>

      <!-- 订单名称 -->
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">
          订单名称 <span class="text-red-500">*</span>
        </label>
        <el-input
          :model-value="formData.orderName"
          @update:model-value="(v) => formData.orderName = v"
          placeholder="请输入订单名称"
          :class="{ '!border-red-500': errors.orderName }"
        />
        <p v-if="errors.orderName" class="text-xs text-red-500 mt-1">{{ errors.orderName }}</p>
      </div>

      <!-- 订单类型 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">订单类型</label>
        <el-select :model-value="formData.orderType" @update:model-value="(v) => formData.orderType = v" class="w-full">
          <el-option v-for="opt in orderTypeOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
        </el-select>
      </div>

      <!-- 订单日期 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">订单日期</label>
        <el-date-picker
          :model-value="formData.orderDate"
          @update:model-value="(v) => formData.orderDate = v"
          type="date"
          class="w-full"
        />
      </div>

      <!-- 作物品种搜索 -->
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">
          作物品种 <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <el-input
            :model-value="searchKeyword"
            @update:model-value="handleSearchChange"
            @focus="showDropdown = true"
            placeholder="搜索作物品种..."
            :class="{ '!border-red-500': errors.cropVariety }"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix v-if="searchKeyword">
              <el-button text size="small" @click="clearSearch">
                <el-icon><Close /></el-icon>
              </el-button>
            </template>
          </el-input>
          <!-- 下拉选择列表 -->
          <div
            v-if="showDropdown && filteredVarieties.length > 0"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="(variety, index) in filteredVarieties"
              :key="`${variety.value}-${index}`"
              @click="handleSelectVariety(variety)"
              class="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div class="text-sm font-medium text-gray-900">{{ variety.label }}</div>
              <div class="text-xs text-gray-500 truncate">{{ variety.fullPath }}</div>
            </div>
          </div>
        </div>
        <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
      </div>

      <!-- 品种路径 (只读) -->
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">品种路径</label>
        <el-input
          :model-value="formData.cropCategory"
          readonly
          disabled
          placeholder="选择作物品种后自动填充"
        />
      </div>

      <!-- 单位 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">单位</label>
        <el-select :model-value="formData.unit" @update:model-value="(v) => formData.unit = v" class="w-full">
          <el-option value="株" label="株" />
          <el-option value="棵" label="棵" />
          <el-option value="袋" label="袋" />
          <el-option value="公斤" label="公斤" />
          <el-option value="吨" label="吨" />
        </el-select>
      </div>

      <!-- 计划数量 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">
          计划数量 <span class="text-red-500">*</span>
        </label>
        <el-input
          :model-value="formData.plannedQuantity || ''"
          @update:model-value="(v) => { formData.plannedQuantity = Number(v); errors.plannedQuantity = '' }"
          type="number"
          placeholder="请输入计划数量"
        />
        <p v-if="errors.plannedQuantity" class="text-xs text-red-500 mt-1">{{ errors.plannedQuantity }}</p>
      </div>

      <!-- 实际数量 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">实际数量</label>
        <el-input
          :model-value="formData.actualQuantity || ''"
          @update:model-value="(v) => formData.actualQuantity = Number(v)"
          type="number"
          placeholder="请输入实际数量"
        />
      </div>

      <!-- 供应商 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">供应商</label>
        <el-input
          :model-value="formData.supplierName"
          @update:model-value="(v) => formData.supplierName = v"
          placeholder="请输入供应商名称"
        />
      </div>

      <!-- 预计采收日期 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">预计采收日期</label>
        <el-date-picker
          :model-value="formData.expectedHarvestDate"
          @update:model-value="(v) => formData.expectedHarvestDate = v"
          type="date"
          class="w-full"
        />
      </div>

      <!-- 订单完成 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">订单完成</label>
        <el-select :model-value="formData.isCompleted ? 'yes' : 'no'" @update:model-value="(v) => formData.isCompleted = v === 'yes'" class="w-full">
          <el-option value="no" label="否" />
          <el-option value="yes" label="是" />
        </el-select>
        <p v-if="formData.isCompleted" class="text-xs text-orange-500 mt-1">选择"是"后订单将无法编辑</p>
      </div>

      <!-- 备注 -->
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">备注</label>
        <el-input
          :model-value="formData.remarks"
          @update:model-value="(v) => formData.remarks = v"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'
import { showAlert, showConfirm } from '@/lib/dialogService'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  record: { type: Object, default: null },
  orderTypeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'success'])

const searchKeyword = ref('')
const showDropdown = ref(false)
const errors = reactive({})

const formData = reactive({
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
  isCompleted: false,
})

// 品种选项 - 从V1.1的cropVarietyService获取
const varietyOptions = ref([])
const filteredVarieties = computed(() => {
  let list = varietyOptions.value
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(opt =>
      opt.label.toLowerCase().includes(kw) ||
      opt.fullPath.toLowerCase().includes(kw) ||
      (opt.varietyCode || '').toLowerCase().includes(kw)
    )
  }
  return list.slice(0, 20)
})

const loadVarieties = async () => {
  try {
    const { getVarietyOptions } = await import('@/services/cropVarietyService')
    varietyOptions.value = getVarietyOptions()
  } catch {
    varietyOptions.value = []
  }
}

const initForm = async () => {
  if (!props.record || !props.isOpen) return

  // 已完成订单禁止编辑
  if (props.record.status === 'completed') {
    await showAlert('该订单已完成，无法编辑')
    emit('close')
    return
  }

  Object.assign(formData, {
    orderCode: props.record.orderCode || '',
    orderName: props.record.orderName || '',
    orderType: props.record.orderType || 'production',
    cropCategory: props.record.cropCategory || '',
    cropVariety: props.record.cropVariety || '',
    plannedQuantity: props.record.plannedQuantity || 0,
    actualQuantity: props.record.actualQuantity || 0,
    unit: props.record.unit || '株',
    supplierName: props.record.supplierName || '',
    orderDate: props.record.orderDate || '',
    expectedHarvestDate: props.record.expectedHarvestDate || '',
    remarks: props.record.remarks || '',
    isCompleted: props.record.status === 'completed',
  })
  searchKeyword.value = props.record.cropVariety || ''
  showDropdown.value = false
  Object.keys(errors).forEach(k => delete errors[k])

  if (varietyOptions.value.length === 0) {
    await loadVarieties()
  }
}

const handleSearchChange = (val) => {
  searchKeyword.value = val
  showDropdown.value = true
  if (!val.trim()) {
    formData.cropVariety = ''
    formData.cropCategory = ''
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  formData.cropVariety = ''
  formData.cropCategory = ''
}

const handleSelectVariety = (variety) => {
  formData.cropVariety = variety.label
  formData.cropCategory = variety.fullPath
  searchKeyword.value = variety.label
  showDropdown.value = false
  delete errors.cropVariety
}

// 点击外部关闭下拉
const handleClickOutside = () => {
  showDropdown.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleSubmit = async () => {
  if (props.record && props.record.status === 'completed') {
    await showAlert('该订单已完成，无法编辑')
    emit('close')
    return
  }

  if (formData.isCompleted) {
    const confirmed = await showConfirm(
      '确认将订单标记为完成吗？完成后该订单将进入保存档案状态，无法进行任何编辑操作、无法删除订单、无法关联新的作物实例。此操作不可逆，请确认！'
    )
    if (!confirmed) return
  }

  const newErrors = {}
  if (!formData.orderCode) newErrors.orderCode = '请输入订单编号'
  if (!formData.orderName) newErrors.orderName = '请输入订单名称'
  if (!formData.cropVariety) newErrors.cropVariety = '请选择作物品种'
  if (formData.plannedQuantity <= 0) newErrors.plannedQuantity = '请输入计划数量'

  if (Object.keys(newErrors).length > 0) {
    Object.assign(errors, newErrors)
    return
  }

  if (!props.record) return

  const updates = {
    orderCode: formData.orderCode,
    orderName: formData.orderName,
    orderType: formData.orderType,
    orderDate: formData.orderDate,
    expectedHarvestDate: formData.expectedHarvestDate || undefined,
    cropCategory: formData.cropCategory,
    cropName: '',
    cropVariety: formData.cropVariety,
    plannedQuantity: formData.plannedQuantity,
    actualQuantity: formData.actualQuantity,
    unit: formData.unit,
    supplierName: formData.supplierName,
    remarks: formData.remarks,
    status: formData.isCompleted ? 'completed' : props.record.status,
  }

  emit('success', props.record.id, updates)
  emit('close')
}
</script>

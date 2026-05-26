<template>
  <!-- 新增订单弹窗 - 从V1.1 AddModal.tsx 1:1迁移 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    @open="initForm"
    title="新增订单"
    width="700px"
    top="5vh"
    @confirm="handleSubmit"
  >
    <div class="grid grid-cols-2 gap-4">
      <!-- 订单编号 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">订单编号</label>
        <div class="flex gap-2">
          <el-input
            :model-value="formData.orderCode"
            @update:model-value="(v) => formData.orderCode = v"
            placeholder="点击生成获取编号"
            :class="{ '!border-red-500': errors.orderCode }"
          />
          <el-button type="primary" size="default" @click="generateCode" class="whitespace-nowrap">生成</el-button>
        </div>
        <p v-if="errors.orderCode" class="text-xs text-red-500 mt-1">{{ errors.orderCode }}</p>
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

      <!-- 作物品种 -->
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">
          <span class="text-red-500">*</span> 作物品种
        </label>
        <el-input
          :model-value="formData.cropVariety"
          @update:model-value="(v) => { formData.cropVariety = v; errors.cropVariety = '' }"
          placeholder="请输入作物品种名称"
        />
        <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
      </div>

      <!-- 品种路径 -->
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">品种路径</label>
        <el-input
          :model-value="formData.cropCategory"
          @update:model-value="(v) => formData.cropCategory = v"
          placeholder="请输入品种路径"
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
      <el-button type="primary" @click="handleSubmit">确认创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { showAlert } from '@/lib/dialogService'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  orderTypeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'success'])

const generateOrderCode = () => {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `DD${year}${month}${day}0001`
}

const generateCode = () => {
  formData.orderCode = generateOrderCode()
}

const getDefaultForm = () => ({
  orderCode: generateOrderCode(),
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

const formData = reactive(getDefaultForm())
const errors = reactive({})

const initForm = () => {
  Object.assign(formData, getDefaultForm())
  Object.keys(errors).forEach(k => delete errors[k])
}

const handleSubmit = async () => {
  const newErrors = {}
  if (!formData.orderCode) newErrors.orderCode = '请输入订单编号'
  if (!formData.orderName) newErrors.orderName = '请输入订单名称'
  if (!formData.cropVariety) newErrors.cropVariety = '请选择作物品种'
  if (formData.plannedQuantity <= 0) newErrors.plannedQuantity = '请输入计划数量'

  if (Object.keys(newErrors).length > 0) {
    Object.assign(errors, newErrors)
    return
  }

  const newOrder = {
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
    status: 'planned',
    remarks: formData.remarks,
    instanceIds: [],
    createBy: localStorage.getItem('username') || '',
  }

  emit('success', newOrder)
  emit('close')
}
</script>

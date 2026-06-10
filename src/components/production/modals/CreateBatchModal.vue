<template>
  <ElModal
    v-model="visible"
    title="新增生产计划批次"
    :width="784"
    :height="630"
    :show-submit="false"
    :show-cancel="false"
    @close="handleClose"
  >
    <div class="space-y-4 modal-form-inputs">
      <!-- 第一行：计划类型（按钮组，横跨整行） -->
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-gray-700 w-20 shrink-0">计划类型</span>
        <div class="flex gap-2">
          <div
            v-for="option in planTypeOptions"
            :key="option.value"
            :class="[
              'px-4 py-2 rounded-lg cursor-pointer border-2 transition-all text-sm font-medium select-none',
              formData.planType === option.value
                ? `border-emerald-500 ${option.color.bg} ${option.color.text}`
                : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
            ]"
            @click="handlePlanTypeChange(option.value, option.label)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>

      <!-- 第二行：批次号 + 发布人 -->
      <div class="grid grid-cols-2 gap-4 items-start">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">
            生产计划批次号 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2 items-center">
            <input
              :value="formData.batchCode"
              @input="emit('formChange', 'batchCode', $event.target.value)"
              placeholder="点击生成获取编号"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              :class="errors.batchCode ? 'border-red-500' : ''"
            />
            <button
              :class="btnDefault"
              @click="onGenerateCode"
            >
              生成
            </button>
          </div>
          <p v-if="errors.batchCode" class="text-red-500 text-xs mt-1">{{ errors.batchCode }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">发布人</label>
          <input :value="formData.publisher" disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed text-gray-700" />
        </div>
      </div>

      <!-- 第三行：关联订单 + 作物品种 -->
      <div class="grid grid-cols-2 gap-4">
        <!-- 关联订单 - V1.1样式：可展开Checkbox多选 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-medium text-gray-700">关联订单</span>
            <button
              type="button"
              @click="orderExpanded = !orderExpanded"
              class="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              <ChevronUp v-if="orderExpanded" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
              {{ orderExpanded ? '收起' : '展开' }}
            </button>
          </div>
          <div v-if="orderExpanded" class="flex flex-col gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :id="`order-${order.id}`"
                :checked="formData.orderId.includes(order.id)"
                @change="toggleOrder(order)"
                class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <label :for="`order-${order.id}`" class="text-sm cursor-pointer">
                {{ order.orderCode }} - {{ order.orderName }} ({{ order.cropVariety }})
              </label>
            </div>
          </div>
          <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
            {{ formData.orderId.length === 0 ? '未选择' : selectedOrderLabels }}
          </div>
        </div>

        <!-- 作物品种 -->
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">
            作物品种 <span class="text-red-500">*</span>
          </label>
          <CropCodeSelector
            :model-value="formData.cropCode || ''"
            placeholder="搜索或选择作物品种..."
            size="sm"
            show-full-path
            @change="handleCropChange"
          />
          <p v-if="errors.variety" class="text-red-500 text-xs mt-1">{{ errors.variety }}</p>
          <div v-if="selectedCrop" class="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
            <span class="text-emerald-700">
              {{ selectedCrop.categoryName }} &gt; {{ selectedCrop.typeName }} &gt; {{ selectedCrop.varietyName }}
              {{ selectedCrop.subVariety1Name && ` > ${selectedCrop.subVariety1Name}` }}
            </span>
          </div>
        </div>
      </div>

      <!-- 第四行：种植区域 + 生产模式 -->
      <div class="grid grid-cols-2 gap-4">
        <!-- 种植区域 - V1.1样式：可展开Checkbox多选 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-medium text-gray-700">
              种植区域 <span class="text-red-500">*</span>
            </span>
            <button
              type="button"
              @click="greenhouseExpanded = !greenhouseExpanded"
              class="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              <ChevronUp v-if="greenhouseExpanded" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
              {{ greenhouseExpanded ? '收起' : '展开' }}
            </button>
          </div>
          <div v-if="greenhouseExpanded" class="flex flex-col gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            <div
              v-for="g in activeGreenhouses"
              :key="g.id"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :id="`gh-${g.id}`"
                :checked="formData.greenhouseId.includes(g.id)"
                @change="toggleGreenhouse(g)"
                class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <label :for="`gh-${g.id}`" class="text-sm cursor-pointer">{{ g.name }}</label>
            </div>
          </div>
          <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
            {{ formData.greenhouseId.length === 0 ? '请选择' : selectedGreenhouseLabels }}
          </div>
          <p v-if="errors.greenhouseId" class="text-red-500 text-xs mt-1">{{ errors.greenhouseId }}</p>
        </div>

        <!-- 生产模式 - V1.1样式：可展开Checkbox多选 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-medium text-gray-700">
              生产模式 <span class="text-red-500">*</span>
            </span>
            <button
              type="button"
              @click="plantingModeExpanded = !plantingModeExpanded"
              class="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              <ChevronUp v-if="plantingModeExpanded" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
              {{ plantingModeExpanded ? '收起' : '展开' }}
            </button>
          </div>
          <div v-if="plantingModeExpanded" class="flex flex-col gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            <div
              v-for="mode in modes"
              :key="mode.value"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :id="`pm-${mode.value}`"
                :checked="formData.plantingMode.includes(mode.value)"
                @change="togglePlantingMode(mode)"
                class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <label :for="`pm-${mode.value}`" class="text-sm cursor-pointer">{{ mode.label }}</label>
            </div>
          </div>
          <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
            {{ formData.plantingMode.length === 0 ? '请选择' : selectedModeLabels }}
          </div>
          <p v-if="errors.plantingMode" class="text-red-500 text-xs mt-1">{{ errors.plantingMode }}</p>
        </div>
      </div>

      <!-- 第五行：开始时间 + 预计结束时间 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">
            开始时间 <span class="text-red-500">*</span>
          </label>
          <input
            :value="formData.startDate"
            @input="emit('formChange', 'startDate', $event.target.value)"
            type="date"
            class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            :class="errors.startDate ? 'border-red-500' : ''"
          />
          <p v-if="errors.startDate" class="text-red-500 text-xs mt-1">{{ errors.startDate }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">
            预计结束时间 <span class="text-red-500">*</span>
          </label>
          <input
            :value="formData.expectedHarvestDate"
            @input="emit('formChange', 'expectedHarvestDate', $event.target.value)"
            type="date"
            class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            :class="errors.expectedHarvestDate ? 'border-red-500' : ''"
          />
          <p v-if="errors.expectedHarvestDate" class="text-red-500 text-xs mt-1">{{ errors.expectedHarvestDate }}</p>
        </div>
      </div>

      <!-- 第六行：负责人 + 目标产量 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">
            负责人 <span class="text-red-500">*</span>
          </label>
          <select
            :value="formData.responsiblePerson"
            @change="emit('formChange', 'responsiblePerson', $event.target.value)"
            class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            :class="errors.responsiblePerson ? 'border-red-500' : ''"
          >
            <option value="" disabled>请选择负责人</option>
            <option
              v-for="name in responsiblePersons"
              :key="name"
              :value="name"
            >{{ name }}</option>
          </select>
          <p v-if="errors.responsiblePerson" class="text-red-500 text-xs mt-1">{{ errors.responsiblePerson }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">目标产量</label>
            <input
              :value="formData.targetYield"
              @input="emit('formChange', 'targetYield', $event.target.value)"
              type="number"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">单位</label>
            <select
              :value="formData.unit"
              @change="emit('formChange', 'unit', $event.target.value)"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="" disabled>选择单位</option>
              <option label="kg" value="kg">kg</option>
              <option label="吨" value="吨">吨</option>
              <option label="g" value="g">g</option>
              <option label="株" value="株">株</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 第七行：种植面积 + 面积单位 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">种植面积</label>
          <input
            :value="formData.plantingArea"
            @input="handlePlantingAreaInput($event)"
            type="number"
            placeholder="0"
            class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">面积单位</label>
          <select
            :value="formData.plantingAreaUnit"
            @change="emit('formChange', 'plantingAreaUnit', $event.target.value)"
            class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
          >
            <option value="" disabled>选择单位</option>
            <option value="m²">m²</option>
            <option value="亩">亩</option>
            <option value="公顷">公顷</option>
            <option value="km²">km²</option>
          </select>
        </div>
      </div>

      <!-- 第八行：备注说明（横跨整行） -->
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">备注说明</label>
        <textarea
          :value="formData.description"
          @input="emit('formChange', 'description', $event.target.value)"
          rows="2"
          placeholder="输入备注信息..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>

      <!-- 第九行：计划详细说明（横跨整行） -->
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">计划详细说明</label>
        <div class="flex items-center gap-3">
          <button
            :class="btnBlue"
            @click="handleFileUpload"
          >
            <Upload class="w-4 h-4" />
            导入文件
          </button>
          <span class="text-xs text-gray-500">支持 .txt, .md, .docx 格式</span>
          <span v-if="formData.planDetailFileName" class="text-xs text-emerald-600">
            {{ formData.planDetailFileName }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button :class="btnSecondary" @click="onSaveDraft">
          存为草稿
        </button>
        <button :class="btnDefault" @click="onSubmitForApproval">
          提交审批
        </button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronUp, ChevronDown, Upload } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
// 与技术方案共享按钮样式常量
import { btnDefault, btnBlue, btnSecondary } from '@/views/production/constants/buttonStyles'
import { planTypeOptions, getModesByPlanType, RESPONSIBLE_PERSONS } from '../constants'
import { getAllVarieties } from '@/services/cropVarietyService'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  greenhouses: { type: Array, default: () => [] },
  orders: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'update:modelValue',
  'update:formData',
  'close',
  'saveDraft',
  'submitForApproval',
  'generateCode',
  'formChange',
])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// 展开状态
const greenhouseExpanded = ref(false)
const plantingModeExpanded = ref(false)
const orderExpanded = ref(false)

const activeGreenhouses = computed(() => props.greenhouses.filter(g => g.status === 'active'))
const modes = computed(() => getModesByPlanType(props.formData.planType))
const responsiblePersons = RESPONSIBLE_PERSONS

// 订单列表（仅显示 planned 或 in_progress 状态的订单）
const filteredOrders = computed(() => {
  return props.orders.filter(o => o.status === 'planned' || o.status === 'in_progress')
})

// 选中的标签显示
const selectedGreenhouseLabels = computed(() => {
  return props.formData.greenhouseId
    .map(id => props.greenhouses.find(g => g.id === id)?.name)
    .filter(Boolean)
    .join(', ')
})

const selectedModeLabels = computed(() => {
  return props.formData.plantingMode
    .map(v => modes.value.find(m => m.value === v)?.label)
    .filter(Boolean)
    .join(', ')
})

const selectedOrderLabels = computed(() => {
  return props.formData.orderId
    .map(id => filteredOrders.value.find(o => o.id === id)?.orderCode)
    .filter(Boolean)
    .join(', ')
})

const selectedCrop = ref(null)

watch(() => props.formData.cropCode, (code) => {
  if (code) {
    const varieties = getAllVarieties()
    selectedCrop.value = varieties.find(v => v.cropCode === code) || null
  } else {
    selectedCrop.value = null
  }
})

function handlePlanTypeChange(value, label) {
  emit('formChange', 'planType', value)
  emit('formChange', 'planTypeName', label)
  // 切换计划类型时，清空生产模式
  emit('formChange', 'plantingMode', [])
}

function handleCropChange(code, varietyInfo) {
  if (varietyInfo) {
    selectedCrop.value = varietyInfo
    emit('formChange', 'cropCode', varietyInfo.cropCode)
    emit('formChange', 'variety', varietyInfo.subVariety1Name || varietyInfo.varietyName)
    emit('formChange', 'cropName', varietyInfo.varietyName)
  } else {
    selectedCrop.value = null
    emit('formChange', 'cropCode', '')
    emit('formChange', 'variety', '')
    emit('formChange', 'cropName', '')
  }
}

function toggleGreenhouse(greenhouse) {
  const current = [...props.formData.greenhouseId]
  const index = current.indexOf(greenhouse.id)
  if (index === -1) {
    current.push(greenhouse.id)
  } else {
    current.splice(index, 1)
  }
  emit('formChange', 'greenhouseId', current)
}

function togglePlantingMode(mode) {
  const current = [...props.formData.plantingMode]
  const index = current.indexOf(mode.value)
  if (index === -1) {
    current.push(mode.value)
  } else {
    current.splice(index, 1)
  }
  emit('formChange', 'plantingMode', current)
}

function toggleOrder(order) {
  const currentId = [...props.formData.orderId]
  const currentCode = [...props.formData.orderCode]
  const index = currentId.indexOf(order.id)
  if (index === -1) {
    currentId.push(order.id)
    currentCode.push(order.orderCode)
  } else {
    currentId.splice(index, 1)
    currentCode.splice(index, 1)
  }
  emit('formChange', 'orderId', currentId)
  emit('formChange', 'orderCode', currentCode)
}

function handlePlantingAreaInput(event) {
  // 修复 P0: 模板必须传 $event，这里才能拿到 event 对象
  // 修复前：模板写 @input="handlePlantingAreaInput" 没传 $event，函数收到 Event 对象
  // 调用 val.replace() 抛 TypeError → emit 失败 → formData 不更新
  // → 失焦后被 :value="" 覆盖清空 → 种植面积丢失
  const raw = event.target.value
  const formatted = raw.replace(/[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/(\..{2})./g, '$1')
  emit('formChange', 'plantingArea', formatted)
}

function handleFileUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.md,.docx'
  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        emit('formChange', 'planDetail', event.target?.result)
        emit('formChange', 'planDetailFileName', file.name)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function handleClose() {
  emit('close')
}

function onSaveDraft() {
  emit('saveDraft')
}

function onSubmitForApproval() {
  emit('submitForApproval')
}

function onGenerateCode() {
  emit('generateCode')
}
</script>

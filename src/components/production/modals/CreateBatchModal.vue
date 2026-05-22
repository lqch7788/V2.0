<template>
  <ElModal
    v-model="visible"
    title="新增生产计划批次"
    size="xl"
    :show-submit="false"
    :show-cancel="false"
    @close="handleClose"
  >
    <div class="space-y-4 modal-form-inputs">
      <!-- 计划类型和生产计划批次号同一行 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">计划类型 <span class="text-red-500">*</span></label>
          <div class="flex gap-4 flex-wrap">
            <div
              v-for="option in planTypeOptions"
              :key="option.value"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition-all select-none',
                formData.planType === option.value
                  ? `border-emerald-500 ${option.color.bg} ${option.color.text}`
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              ]"
              @click="handlePlanTypeChange(option.value, option.label)"
            >
              <span class="font-medium">{{ option.label }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">生产计划批次号 <span class="text-red-500">*</span></label>
          <div class="flex gap-2">
            <el-input
              v-model="formData.batchCode"
              placeholder="例如：FQ2024-001"
              :class="errors.batchCode ? 'border-red-500' : ''"
            />
            <button class="h-9 px-4 rounded-md text-sm inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="onGenerateCode">生成</button>
          </div>
          <p v-if="errors.batchCode" class="text-red-500 text-xs mt-1">{{ errors.batchCode }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 作物品种 -->
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">作物品种 <span class="text-red-500">*</span></label>
          <CropCodeSelector
            :model-value="formData.cropCode || ''"
            placeholder="搜索或选择作物品种..."
            size="md"
            show-full-path
            @change="handleCropChange"
          />
          <p v-if="errors.variety" class="text-red-500 text-xs mt-1">{{ errors.variety }}</p>
          <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <div class="text-emerald-700 flex items-center gap-1">
              <Leaf class="w-4 h-4" />
              {{ selectedCrop.categoryName }} &gt; {{ selectedCrop.typeName }} &gt; {{ selectedCrop.varietyName }}
              <template v-if="selectedCrop.subVariety1Name"> &gt; {{ selectedCrop.subVariety1Name }}</template>
            </div>
            <div class="text-emerald-600 mt-0.5">编码：{{ selectedCrop.cropCode }}</div>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">种植区域 <span class="text-red-500">*</span></label>
          <el-select v-model="formData.greenhouseId" placeholder="请选择区域" class="w-full" :class="errors.greenhouseId ? 'border-red-500' : ''">
            <el-option
              v-for="g in activeGreenhouses"
              :key="g.id"
              :label="g.name"
              :value="g.id"
            />
          </el-select>
          <p v-if="errors.greenhouseId" class="text-red-500 text-xs mt-1">{{ errors.greenhouseId }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">种植面积（m²） <span class="text-red-500">*</span></label>
          <el-input
            v-model="formData.plantingArea"
            placeholder="例如：1000或1500.50"
            @input="handlePlantingAreaInput"
          />
          <p v-if="errors.plantingArea" class="text-red-500 text-xs mt-1">{{ errors.plantingArea }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">生产模式 <span class="text-red-500">*</span></label>
          <el-select v-model="formData.plantingMode" placeholder="请选择生产模式" class="w-full">
            <el-option
              v-for="mode in modes"
              :key="mode.value"
              :label="mode.label"
              :value="mode.value"
            />
          </el-select>
          <p v-if="errors.plantingMode" class="text-red-500 text-xs mt-1">{{ errors.plantingMode }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">开始时间 <span class="text-red-500">*</span></label>
          <el-input v-model="formData.startDate" type="date" />
          <p v-if="errors.startDate" class="text-red-500 text-xs mt-1">{{ errors.startDate }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">预计结束时间 <span class="text-red-500">*</span></label>
          <el-input v-model="formData.expectedHarvestDate" type="date" />
          <p v-if="errors.expectedHarvestDate" class="text-red-500 text-xs mt-1">{{ errors.expectedHarvestDate }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">目标产量 <span class="text-red-500">*</span></label>
          <el-input v-model="formData.targetYield" placeholder="例如：10000或10000kg" />
          <p v-if="errors.targetYield" class="text-red-500 text-xs mt-1">{{ errors.targetYield }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">负责人 <span class="text-red-500">*</span></label>
          <el-select v-model="formData.responsiblePerson" placeholder="请选择负责人" class="w-full">
            <el-option
              v-for="name in responsiblePersons"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
          <p v-if="errors.responsiblePerson" class="text-red-500 text-xs mt-1">{{ errors.responsiblePerson }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">发布人</label>
          <el-input v-model="formData.publisher" disabled class="bg-blue-50 text-blue-700 font-medium" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">版本号</label>
          <el-input value="V1.0" disabled class="bg-gray-100 cursor-not-allowed" />
        </div>

        <div class="md:col-span-2">
          <label class="text-sm font-medium text-gray-700 block mb-1">备注说明</label>
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="输入相关的备注信息..." />
        </div>

        <div class="md:col-span-1">
          <label class="text-sm font-medium text-gray-700 block mb-1">计划详细说明</label>
          <div class="flex items-center gap-2">
            <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700" @click="handleFileUpload">
              <Upload class="w-4 h-4" />
              导入文件
            </button>
            <span class="text-xs text-gray-500">支持 .txt, .md, .docx 格式文件</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="onSaveDraft">存为草稿</button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="onSubmitForApproval">提交审批</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Leaf, Upload } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import { planTypeOptions, getModesByPlanType, RESPONSIBLE_PERSONS } from '../constants'
import { getAllVarieties } from '@/services/cropVarietyService'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  greenhouses: { type: Array, default: () => [] },
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

const activeGreenhouses = computed(() => props.greenhouses.filter(g => g.status === 'active'))
const modes = computed(() => getModesByPlanType(props.formData.planType))
const responsiblePersons = RESPONSIBLE_PERSONS

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

function handlePlantingAreaInput(val) {
  const formatted = val.replace(/[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/(\..{2})./g, '$1')
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

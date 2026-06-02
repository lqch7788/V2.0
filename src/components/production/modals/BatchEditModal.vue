<template>
  <ElModal
    v-model="visible"
    title="批量编辑生产计划"
    size="xxl"
    :show-submit="false"
    :show-cancel="false"
    @close="handleClose"
  >
    <!-- Info Banner -->
    <div class="p-4 bg-gray-50 border-b border-gray-200 -mx-4 sm:-mx-6 -mt-4">
      <div class="bg-blue-50 rounded-lg p-3 mb-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个生产计划进行批量编辑，
          已编辑 <strong>{{ editedBatchCodes.length }}</strong> 个
        </p>
      </div>

      <div class="flex items-center gap-4 mb-3">
        <div class="flex-1">
          <label class="text-xs text-gray-600 block mb-1">选择生产计划批次号</label>
          <select v-model="localSelectedBatchCode" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white">
            <option value="" disabled>请选择批次号</option>
            <option
              v-for="batch in selectedBatches"
              :key="batch.id"
              :value="batch.batchCode"
            >{{ batch.batchCode }} - {{ batch.cropName }}{{ editedBatchCodes.includes(batch.batchCode) ? ' [已编辑]' : '' }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-4 py-2 modal-form-inputs">
      <template v-if="localSelectedBatchCode && currentBatch">
        <div class="grid grid-cols-4 gap-4">
          <!-- 批次号 - 不可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">生产计划批次号</label>
            <div class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">
              {{ currentBatch.batchCode }}
            </div>
          </div>

          <!-- 作物名称 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">作物名称</label>
            <select v-model="editedDataProxy.cropName" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white" @change="handleCropChange">
              <option value="" disabled>请选择</option>
              <option v-for="crop in cropOptions" :key="crop.name" :value="crop.name">{{ crop.name }}</option>
            </select>
          </div>

          <!-- 作物品种 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">作物品种</label>
            <select v-model="editedDataProxy.variety" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white">
              <option value="" disabled>请选择</option>
              <option v-for="v in currentVarieties" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>

          <!-- 种植面积 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">种植面积</label>
            <input v-model="editedDataProxy.plantingArea" type="number" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <!-- 种植模式 - 可展开Checkbox多选（V1.1样式） -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-gray-700 text-center w-full">种植模式</span>
              <button type="button" @click="plantingModeExpanded = !plantingModeExpanded" class="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700">
                <ChevronUp v-if="plantingModeExpanded" class="w-4 h-4" />
                <ChevronDown v-else class="w-4 h-4" />
                {{ plantingModeExpanded ? '收起' : '展开' }}
              </button>
            </div>
            <div v-if="plantingModeExpanded" class="flex flex-col gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
              <div v-for="mode in plantingModeOptions" :key="mode.value" class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :id="`edit-pm-${mode.value}`"
                  :checked="editedDataProxy.plantingMode.includes(mode.value)"
                  @change="togglePlantingMode(mode.value)"
                  class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label :for="`edit-pm-${mode.value}`" class="text-sm cursor-pointer">{{ mode.label }}</label>
              </div>
            </div>
            <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
              {{ editedDataProxy.plantingMode.length === 0 ? '未选择' : editedDataProxy.plantingMode.map(v => plantingModeOptions.find(m => m.value === v)?.label).filter(Boolean).join(', ') }}
            </div>
          </div>

          <!-- 种植区域 - 可展开Checkbox多选（V1.1样式） -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-gray-700 text-center w-full">种植区域</span>
              <button type="button" @click="greenhouseExpanded = !greenhouseExpanded" class="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700">
                <ChevronUp v-if="greenhouseExpanded" class="w-4 h-4" />
                <ChevronDown v-else class="w-4 h-4" />
                {{ greenhouseExpanded ? '收起' : '展开' }}
              </button>
            </div>
            <div v-if="greenhouseExpanded" class="flex flex-col gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
              <div v-for="g in activeGreenhouses" :key="g.id" class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :id="`edit-gh-${g.id}`"
                  :checked="editedDataProxy.greenhouseId.includes(g.id)"
                  @change="toggleGreenhouse(g)"
                  class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label :for="`edit-gh-${g.id}`" class="text-sm cursor-pointer">{{ g.name }}</label>
              </div>
            </div>
            <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
              {{ editedDataProxy.greenhouseId.length === 0 ? '未选择' : editedDataProxy.greenhouseId.map(id => activeGreenhouses.find(g => g.id === id)?.name).filter(Boolean).join(', ') }}
            </div>
          </div>

          <!-- 开始时间 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">开始时间</label>
            <input v-model="editedDataProxy.startDate" type="date" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <!-- 预计结束时间 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">预计结束时间</label>
            <input v-model="editedDataProxy.expectedHarvestDate" type="date" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <!-- 负责人 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">负责人</label>
            <select v-model="editedDataProxy.responsiblePerson" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white">
              <option value="" disabled>请选择</option>
              <option v-for="name in RESPONSIBLE_PERSONS" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>

          <!-- 目标产量 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">目标产量</label>
            <input v-model="editedDataProxy.targetYield" type="number" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <!-- 发布人 - 不可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">发布人</label>
            <div class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">
              {{ currentBatch.publisher || '-' }}
            </div>
          </div>

          <!-- 初次发布时间 - 不可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">初次发布时间</label>
            <div class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">
              {{ currentBatch.publishDate || '-' }}
            </div>
          </div>

          <!-- 最后修改时间 - 不可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">最后修改时间</label>
            <div class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">
              {{ currentBatch.lastModifyDate || '-' }}
            </div>
          </div>

          <!-- 当前状态 - 不可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">当前状态</label>
            <div class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center">
              <span :class="`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${batchStatusColors[currentBatch.batchStatus || 'draft']}`">
                {{ batchStatusLabels[currentBatch.batchStatus || 'draft'] }}
              </span>
            </div>
          </div>

          <!-- 执行状态 - 仅 published 状态可编辑（V1.1特性） -->
          <div v-if="currentBatch.batchStatus === 'published'">
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">执行状态</label>
            <select v-model="editedDataProxy.executionStatus" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white">
              <option value="" disabled>请选择</option>
              <option value="not_started">未开始</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="suspended">已暂停</option>
            </select>
          </div>

          <!-- 计划是否完成 - 可编辑 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1 text-center">计划是否完成</label>
            <select v-model="localIsCompleted" class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
            <p v-if="editedDataProxy.isCompleted === true" class="text-red-500 text-xs mt-1">⚠️ 选择"是"后计划将归档，无法编辑和删除</p>
          </div>
        </div>

        <!-- 计划详情文件上传 -->
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">计划详情文件</label>
          <div class="flex items-center gap-4">
            <template v-if="editedDataProxy.planDetailFileName">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ editedDataProxy.planDetailFileName }}</span>
                <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700" @click="handleFileUpload">
                  <Upload class="w-4 h-4" />
                  重新上传
                </button>
              </div>
            </template>
            <template v-else>
              <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleFileUpload">
                <Upload class="w-4 h-4" />
                上传计划文件
              </button>
            </template>
            <span class="text-xs text-gray-500">支持 .md, .docx, .txt 格式</span>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleConfirmNext">确认（下一个）</button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600" @click="handleVoid">申请作废</button>
        <!-- V1.1: published 状态显示"保存"，其他状态显示"提交" -->
        <button v-if="currentBatch && currentBatch.batchStatus === 'published'" class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700" @click="handleSave">保存</button>
        <button v-else class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700" @click="handlePublish">提交</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronUp, ChevronDown, Upload } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import { batchStatusColors, batchStatusLabels, RESPONSIBLE_PERSONS, PLANTING_MODES, getModesByPlanType } from '../constants'
import { getAllVarieties } from '@/services/cropVarietyService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  batches: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
  editedBatchCodes: { type: Array, default: () => [] },
  editedBatches: { type: Object, default: () => ({}) },
  selectedBatchCode: { type: String, default: '' },
})

// V1.1: 添加 'save' 事件（已发布批次可走直接保存路径）
const emit = defineEmits([
  'update:modelValue',
  'update:selectedBatchCode',
  'update:editedBatches',
  'update:editedBatchCodes',
  'close',
  'voidWarning',
  'publish',
  'save',
  'confirmNext',
])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const localSelectedBatchCode = computed({
  get: () => props.selectedBatchCode,
  set: (v) => emit('update:selectedBatchCode', v),
})

const greenhouseExpanded = ref(false)
const plantingModeExpanded = ref(false)

const activeGreenhouses = computed(() => props.greenhouses.filter(g => g.status === 'active'))
const selectedBatches = computed(() =>
  props.selectedRows.map(id => props.batches.find(b => b.id === id)).filter(Boolean)
)
const currentBatch = computed(() =>
  localSelectedBatchCode.value ? props.batches.find(b => b.batchCode === localSelectedBatchCode.value) : null
)

const allVarieties = computed(() => getAllVarieties())
const cropOptions = computed(() => {
  const map = new Map()
  allVarieties.value.forEach(v => {
    if (!map.has(v.varietyName)) {
      map.set(v.varietyName, {
        name: v.varietyName,
        typeName: v.typeName,
        varieties: [v.subVariety1Name || v.varietyName].filter(Boolean),
      })
    }
  })
  return Array.from(map.values())
})

const plantingModeOptions = computed(() => {
  if (!currentBatch.value) return PLANTING_MODES
  return getModesByPlanType(currentBatch.value.planType)
})

const currentVarieties = computed(() => {
  const crop = cropOptions.value.find(c => c.name === editedDataProxy.value.cropName)
  return crop?.varieties || []
})

// 计算 editedData - 支持数组类型字段
const editedDataProxy = computed({
  get: () => {
    if (!localSelectedBatchCode.value) return defaultEditedData()
    const base = props.batches.find(b => b.batchCode === localSelectedBatchCode.value) || {}
    const edited = props.editedBatches[localSelectedBatchCode.value] || {}
    return {
      plantingMode: parseArray(edited.plantingMode ?? base.plantingMode),
      cropName: edited.cropName ?? base.cropName ?? '',
      variety: edited.variety ?? base.variety ?? '',
      greenhouseId: parseArray(edited.greenhouseId ?? base.greenhouseId),
      greenhouseName: edited.greenhouseName ?? base.greenhouseName ?? '',
      plantingArea: edited.plantingArea ?? base.plantingArea ?? '',
      startDate: edited.startDate ?? base.startDate ?? '',
      expectedHarvestDate: edited.expectedHarvestDate ?? base.expectedHarvestDate ?? '',
      responsiblePerson: edited.responsiblePerson ?? base.responsiblePerson ?? '',
      targetYield: edited.targetYield ?? base.targetYield ?? '',
      isCompleted: edited.isCompleted ?? undefined,
      executionStatus: edited.executionStatus ?? base.executionStatus ?? '',
      planDetailFileName: edited.planDetailFileName ?? base.planDetailFileName ?? '',
      planDetail: edited.planDetail ?? base.planDetail ?? '',
    }
  },
  set: (val) => {
    if (!localSelectedBatchCode.value) return
    const updated = { ...props.editedBatches, [localSelectedBatchCode.value]: { ...props.editedBatches[localSelectedBatchCode.value], ...val } }
    emit('update:editedBatches', updated)
    if (!props.editedBatchCodes.includes(localSelectedBatchCode.value)) {
      emit('update:editedBatchCodes', [...props.editedBatchCodes, localSelectedBatchCode.value])
    }
  },
})

function defaultEditedData() {
  return {
    plantingMode: [],
    cropName: '',
    variety: '',
    greenhouseId: [],
    greenhouseName: '',
    plantingArea: '',
    startDate: '',
    expectedHarvestDate: '',
    responsiblePerson: '',
    targetYield: '',
    isCompleted: undefined,
    executionStatus: '',
    planDetailFileName: '',
    planDetail: '',
  }
}

// 解析数组（支持字符串逗号分隔、JSON、数组）
function parseArray(val) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val) {
    return val.split(',').filter(Boolean)
  }
  return []
}

const localIsCompleted = computed({
  get: () => {
    const val = editedDataProxy.value.isCompleted
    if (val === undefined || val === null) return 'no'
    return val === true ? 'yes' : 'no'
  },
  set: (val) => handleFieldChange('isCompleted', val === 'yes'),
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.selectedRows.length > 0 && !localSelectedBatchCode.value) {
    const first = selectedBatches.value[0]
    if (first) {
      localSelectedBatchCode.value = first.batchCode
    }
  }
})

function handleFieldChange(field, value) {
  editedDataProxy.value = { ...editedDataProxy.value, [field]: value }
}

function handleCropChange(cropName) {
  const crop = cropOptions.value.find(c => c.name === cropName)
  handleFieldChange('cropName', cropName)
  if (crop) {
    handleFieldChange('variety', crop.varieties[0])
  }
}

function togglePlantingMode(value) {
  const current = [...editedDataProxy.value.plantingMode]
  const index = current.indexOf(value)
  if (index === -1) {
    current.push(value)
  } else {
    current.splice(index, 1)
  }
  handleFieldChange('plantingMode', current)
}

function toggleGreenhouse(greenhouse) {
  const current = [...editedDataProxy.value.greenhouseId]
  const index = current.indexOf(greenhouse.id)
  if (index === -1) {
    current.push(greenhouse.id)
  } else {
    current.splice(index, 1)
  }
  handleFieldChange('greenhouseId', current)
  handleFieldChange('greenhouseName', current.map(id => props.greenhouses.find(g => g.id === id)?.name).filter(Boolean).join(','))
}

function handleFileUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.docx,.txt'
  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFieldChange('planDetailFileName', file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        handleFieldChange('planDetail', event.target?.result)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function handleClose() {
  emit('close')
}

function handleConfirmNext() {
  emit('confirmNext')
}

function handleVoid() {
  emit('voidWarning')
}

function handlePublish() {
  emit('publish')
}

// V1.1: published 状态的批次可走"直接保存"路径
function handleSave() {
  emit('save')
}
</script>

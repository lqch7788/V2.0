<template>
  <!--
    @file BatchEditModal.vue
    @description 批量编辑生产计划弹窗 - 1:1 翻译 V1.1 BatchEditModal.tsx
                 字段布局恢复为 V1.1 的 6 个独立 2-col 行（与新建弹窗保持一致）
    @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\production\modals\BatchEditModal.tsx
    @fix P0-005: 执行状态下拉恢复 3 个选项（pending_execution/in_progress/completed）
    @fix P1-007: 布局从单一 grid-cols-4 改为 6 个独立 grid-cols-2 行
  -->
  <ElModal
    v-model="visible"
    title="批量编辑生产计划"
    size="xxl"
    :show-submit="false"
    :show-cancel="false"
    @close="handleClose"
  >
    <!-- Info Banner - 1:1 对应 V1.1 L144-172 -->
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
          <select
            v-model="localSelectedBatchCode"
            class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
          >
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

    <!-- Content - 1:1 对应 V1.1 L174-491 多个 grid-cols-2 行 -->
    <div class="space-y-4 py-2 modal-form-inputs">
      <template v-if="localSelectedBatchCode && currentBatch">
        <!-- 第一行：批次号 + 作物品种 - 1:1 对应 V1.1 L178-205 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 批次号 - 不可编辑 -->
          <div class="bg-gray-100 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">生产计划批次号</div>
            <div class="text-sm font-medium text-gray-900">{{ currentBatch.batchCode }}</div>
          </div>

          <!-- 作物品种 - 可编辑（与新建一致） -->
          <div>
            <label class="text-xs text-gray-500 block mb-1 text-center">作物品种</label>
            <select
              v-model="editedDataProxy.variety"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="" disabled>请选择品种</option>
              <option v-for="v in currentVarieties" :key="v" :value="v">{{ v }}</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">当前作物：{{ currentBatch.cropName || '-' }}</p>
          </div>
        </div>

        <!-- 第二行：种植区域 + 生产模式 - 1:1 对应 V1.1 L207-294 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 种植区域 - 多选 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-gray-500">种植区域</span>
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
                  :id="`edit-gh-${g.id}`"
                  :checked="editedDataProxy.greenhouseId.includes(g.id)"
                  @change="toggleGreenhouse(g)"
                  class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label :for="`edit-gh-${g.id}`" class="text-sm cursor-pointer">{{ g.name }}</label>
              </div>
            </div>
            <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
              {{ editedDataProxy.greenhouseId.length === 0 ? '请选择' : editedDataProxy.greenhouseId.map(id => activeGreenhouses.find(g => g.id === id)?.name).filter(Boolean).join(', ') }}
            </div>
          </div>

          <!-- 生产模式 - 多选 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-gray-500">生产模式</span>
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
                v-for="mode in plantingModeOptions"
                :key="mode.value"
                class="flex items-center gap-2"
              >
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
              {{ editedDataProxy.plantingMode.length === 0 ? '请选择' : editedDataProxy.plantingMode.map(v => plantingModeOptions.find(m => m.value === v)?.label).filter(Boolean).join(', ') }}
            </div>
          </div>
        </div>

        <!-- 第三行：开始时间 + 预计结束时间 - 1:1 对应 V1.1 L296-316 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">开始时间</label>
            <input
              v-model="editedDataProxy.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">预计结束时间</label>
            <input
              v-model="editedDataProxy.expectedHarvestDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <!-- 第四行：负责人 + 目标产量/单位 - 1:1 对应 V1.1 L318-357 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">负责人</label>
            <select
              v-model="editedDataProxy.responsiblePerson"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="" disabled>请选择</option>
              <option v-for="name in RESPONSIBLE_PERSONS" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 mb-1 block">目标产量</label>
              <input
                v-model="editedDataProxy.targetYield"
                type="number"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">单位</label>
              <select
                v-model="editedDataProxy.unit"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="" disabled>选择单位</option>
                <option value="kg">kg</option>
                <option value="克">克</option>
                <option value="g">g</option>
                <option value="株">株</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 第五行：种植面积 + 面积单位 - 1:1 对应 V1.1 L359-380 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">种植面积</label>
            <input
              v-model="editedDataProxy.plantingArea"
              type="number"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">面积单位</label>
            <select
              v-model="editedDataProxy.plantingAreaUnit"
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

        <!-- 第六行：只读字段（发布人/初次发布时间/最后修改时间/当前状态） - 1:1 对应 V1.1 L382-402 -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gray-100 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">发布人</div>
            <div class="text-sm text-gray-700">{{ currentBatch.publisher || '-' }}</div>
          </div>
          <div class="bg-gray-100 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">初次发布时间</div>
            <div class="text-sm text-gray-700">{{ currentBatch.publishDate || '-' }}</div>
          </div>
          <div class="bg-gray-100 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">最后修改时间</div>
            <div class="text-sm text-gray-700">{{ currentBatch.lastModifyDate || '-' }}</div>
          </div>
          <div class="bg-gray-100 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">当前状态</div>
            <span
              :class="`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${batchStatusColors[currentBatch.batchStatus || 'draft']}`"
            >
              {{ batchStatusLabels[currentBatch.batchStatus || 'draft'] }}
            </span>
          </div>
        </div>

        <!--
          执行状态切换（仅审批通过后可见）- 1:1 对应 V1.1 L404-426
          V1.1: pending_execution / in_progress / completed（3 个选项）
          P0-005: 已恢复 1:1
        -->
        <div v-if="currentBatch.batchStatus === 'published'" class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label class="text-xs text-gray-500 mb-1 block">执行状态</label>
              <select
                v-model="editedDataProxy.executionStatus"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="" disabled>请选择执行状态</option>
                <option value="pending_execution">待执行</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 计划详情文件上传 - 1:1 对应 V1.1 L428-489 -->
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-2">计划详情文件</div>
          <div class="flex items-center gap-4">
            <template v-if="editedDataProxy.planDetailFileName">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ editedDataProxy.planDetailFileName }}</span>
                <button
                  class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  @click="handleFileUpload"
                >
                  <Upload class="w-3 h-3" />
                  重新上传
                </button>
              </div>
            </template>
            <template v-else>
              <button
                class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                @click="handleFileUpload"
              >
                <Upload class="w-3 h-3" />
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
        <!-- 1:1 对应 V1.1 L497-505 -->
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="handleConfirmNext"
        >确认（下一个）</button>
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600"
          @click="handleVoid"
        >申请作废</button>
        <!-- V1.1: published 状态显示"保存"，其他状态显示"提交" -->
        <button
          v-if="currentBatch && currentBatch.batchStatus === 'published'"
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          @click="handleSave"
        >保存</button>
        <button
          v-else
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          @click="handlePublish"
        >提交</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * @file BatchEditModal.vue - 1:1 翻译 V1.1 BatchEditModal.tsx
 * @description 批量编辑生产计划弹窗
 *              字段来源与新建弹窗保持一致
 *              P0-005: 执行状态选项已恢复 V1.1 风格
 *              P1-007: 布局从单一 grid-cols-4 改为多个 grid-cols-2 行
 */
import { computed, ref, watch } from 'vue'
import { ChevronUp, ChevronDown, Upload } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import {
  batchStatusColors,
  batchStatusLabels,
  RESPONSIBLE_PERSONS,
  PLANTING_MODES,
  getModesByPlanType,
  SEED_BREEDING_MODES,
  SEEDLING_MODES
} from '../constants'
import { getAllVarieties } from '@/services/cropVarietyService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  batches: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
  editedBatchCodes: { type: Array, default: () => [] },
  editedBatches: { type: Object, default: () => ({}) },
  selectedBatchCode: { type: String, default: '' }
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
  'confirmNext'
])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const localSelectedBatchCode = computed({
  get: () => props.selectedBatchCode,
  set: (v) => emit('update:selectedBatchCode', v)
})

// 展开状态
const greenhouseExpanded = ref(false)
const plantingModeExpanded = ref(false)

const activeGreenhouses = computed(() => props.greenhouses.filter(g => g.status === 'active'))
const selectedBatches = computed(() =>
  props.selectedRows.map(id => props.batches.find(b => b.id === id)).filter(Boolean)
)
const currentBatch = computed(() =>
  localSelectedBatchCode.value ? props.batches.find(b => b.batchCode === localSelectedBatchCode.value) : null
)

// 全部种植模式映射（用于显示已选值）
const allModes = [...SEED_BREEDING_MODES, ...SEEDLING_MODES, ...PLANTING_MODES]
const modeMap = Object.fromEntries(allModes.map(m => [m.value, m.label]))

// 模式选项 - 根据当前批次的计划类型
const plantingModeOptions = computed(() => {
  if (!currentBatch.value) return PLANTING_MODES
  return getModesByPlanType(currentBatch.value.planType)
})

// 品种选项 - 来自 cropVarietyService
const allVarieties = computed(() => getAllVarieties())
const cropOptions = computed(() => {
  const map = new Map()
  allVarieties.value.forEach(v => {
    if (!map.has(v.varietyName)) {
      map.set(v.varietyName, {
        name: v.varietyName,
        typeName: v.typeName,
        varieties: [v.subVariety1Name || v.varietyName].filter(Boolean)
      })
    }
  })
  return Array.from(map.values())
})

const currentVarieties = computed(() => {
  const crop = cropOptions.value.find(c => c.name === (editedDataProxy.value.cropName || currentBatch.value?.cropName))
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
      plantingAreaUnit: edited.plantingAreaUnit ?? base.plantingAreaUnit ?? '',
      unit: edited.unit ?? base.unit ?? '',
      startDate: edited.startDate ?? base.startDate ?? '',
      expectedHarvestDate: edited.expectedHarvestDate ?? base.expectedHarvestDate ?? '',
      responsiblePerson: edited.responsiblePerson ?? base.responsiblePerson ?? '',
      targetYield: edited.targetYield ?? base.targetYield ?? '',
      executionStatus: edited.executionStatus ?? base.executionStatus ?? '',
      planDetailFileName: edited.planDetailFileName ?? base.planDetailFileName ?? '',
      planDetail: edited.planDetail ?? base.planDetail ?? ''
    }
  },
  set: (val) => {
    if (!localSelectedBatchCode.value) return
    const updated = { ...props.editedBatches, [localSelectedBatchCode.value]: { ...props.editedBatches[localSelectedBatchCode.value], ...val } }
    emit('update:editedBatches', updated)
    if (!props.editedBatchCodes.includes(localSelectedBatchCode.value)) {
      emit('update:editedBatchCodes', [...props.editedBatchCodes, localSelectedBatchCode.value])
    }
  }
})

function defaultEditedData() {
  return {
    plantingMode: [],
    cropName: '',
    variety: '',
    greenhouseId: [],
    greenhouseName: '',
    plantingArea: '',
    plantingAreaUnit: '',
    unit: '',
    startDate: '',
    expectedHarvestDate: '',
    responsiblePerson: '',
    targetYield: '',
    executionStatus: '',
    planDetailFileName: '',
    planDetail: ''
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

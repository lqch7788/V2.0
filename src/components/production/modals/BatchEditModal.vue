<template>
  <el-dialog
    v-model="visible"
    width="1000px"
    :show-close="false"
    align-center
    append-to-body
    class="batch-edit-dialog"
  >
    <template #header>
      <div class="p-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0" style="background:#2563eb">
        <div class="flex items-center gap-4">
          <h3 class="text-lg font-semibold text-white">批量编辑生产计划</h3>
          <span class="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
            已选择 {{ selectedRows.length }} 条
          </span>
        </div>
        <button class="text-white hover:bg-blue-700 w-9 h-9 rounded-lg flex items-center justify-center transition-colors" @click="handleClose">
          <X class="w-5 h-5" />
        </button>
      </div>
    </template>

    <!-- Info Banner -->
    <div class="p-4 bg-gray-50 border-b border-gray-200">
      <div class="bg-blue-50 rounded-lg p-3 mb-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个生产计划进行批量编辑，
          已编辑 <strong>{{ editedBatchCodes.length }}</strong> 个
        </p>
      </div>

      <div class="flex items-center gap-4 mb-3">
        <div class="flex-1">
          <label class="text-xs text-gray-600 block mb-1">选择生产计划批次号</label>
          <el-select v-model="localSelectedBatchCode" placeholder="请选择批次号" class="w-full">
            <el-option
              v-for="batch in selectedBatches"
              :key="batch.id"
              :label="`${batch.batchCode} - ${batch.cropName}${editedBatchCodes.includes(batch.batchCode) ? ' [已编辑]' : ''}`"
              :value="batch.batchCode"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 overflow-y-auto max-h-[50vh]">
      <template v-if="localSelectedBatchCode && currentBatch">
        <div class="grid grid-cols-4 gap-3 mb-3">
          <!-- 批次号 - 不可编辑 -->
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">生产计划批次号</div>
            <div class="text-sm font-medium text-gray-900">{{ currentBatch.batchCode }}</div>
          </div>

          <!-- 种植模式 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">种植模式</div>
            <el-select v-model="editedData.plantingMode" placeholder="请选择" class="w-full" size="small">
              <el-option
                v-for="mode in plantingModeOptions"
                :key="mode.value"
                :label="mode.label"
                :value="mode.value"
              />
            </el-select>
          </div>

          <!-- 作物名称 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">作物名称</div>
            <el-select v-model="editedData.cropName" placeholder="请选择" class="w-full" size="small" @change="handleCropChange">
              <el-option
                v-for="crop in cropOptions"
                :key="crop.name"
                :label="crop.name"
                :value="crop.name"
              />
            </el-select>
          </div>

          <!-- 作物品种 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">作物品种</div>
            <el-select v-model="editedData.variety" placeholder="请选择" class="w-full" size="small">
              <el-option
                v-for="v in currentVarieties"
                :key="v"
                :label="v"
                :value="v"
              />
            </el-select>
          </div>

          <!-- 种植区域 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">种植区域</div>
            <el-select v-model="editedData.greenhouseId" placeholder="请选择" class="w-full" size="small" @change="handleGreenhouseChange">
              <el-option
                v-for="g in activeGreenhouses"
                :key="g.id"
                :label="g.name"
                :value="g.id"
              />
            </el-select>
          </div>

          <!-- 种植面积 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">种植面积</div>
            <el-input v-model="editedData.plantingArea" size="small" />
          </div>

          <!-- 开始时间 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">开始时间</div>
            <el-date-picker v-model="editedData.startDate" type="date" size="small" class="w-full" value-format="YYYY-MM-DD" />
          </div>

          <!-- 预计结束时间 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">预计结束时间</div>
            <el-date-picker v-model="editedData.expectedHarvestDate" type="date" size="small" class="w-full" value-format="YYYY-MM-DD" />
          </div>

          <!-- 负责人 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">负责人</div>
            <el-select v-model="editedData.responsiblePerson" placeholder="请选择" class="w-full" size="small">
              <el-option
                v-for="name in RESPONSIBLE_PERSONS"
                :key="name"
                :label="name"
                :value="name"
              />
            </el-select>
          </div>

          <!-- 目标产量 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">目标产量</div>
            <el-input v-model="editedData.targetYield" size="small" />
          </div>

          <!-- 发布人 - 不可编辑 -->
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">发布人</div>
            <div class="text-sm text-gray-700">{{ currentBatch.publisher || '-' }}</div>
          </div>

          <!-- 初次发布时间 - 不可编辑 -->
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">初次发布时间</div>
            <div class="text-sm text-gray-700">{{ currentBatch.publishDate || '-' }}</div>
          </div>

          <!-- 最后修改时间 - 不可编辑 -->
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">最后修改时间</div>
            <div class="text-sm text-gray-700">{{ currentBatch.lastModifyDate || '-' }}</div>
          </div>

          <!-- 当前状态 - 不可编辑 -->
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">当前状态</div>
            <span :class="`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${batchStatusColors[currentBatch.batchStatus || 'draft']}`">
              {{ batchStatusLabels[currentBatch.batchStatus || 'draft'] }}
            </span>
          </div>

          <!-- 计划是否完成 - 可编辑 -->
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">计划是否完成</div>
            <el-select v-model="localIsCompleted" placeholder="请选择" class="w-full" size="small">
              <el-option label="否" value="no" />
              <el-option label="是" value="yes" />
            </el-select>
            <p v-if="editedData.isCompleted === true" class="text-xs text-red-600 mt-1 font-medium">
              ⚠️ 选择"是"后计划将归档，无法编辑和删除
            </p>
          </div>
        </div>

        <!-- 计划详情文件上传 -->
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-2">计划详情文件</div>
          <div class="flex items-center gap-4">
            <template v-if="editedData.planDetailFileName">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ editedData.planDetailFileName }}</span>
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
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleConfirmNext">确认（下一个）</button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600" @click="handleVoid">申请作废</button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700" @click="handlePublish">提交</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { X as Close, Upload } from 'lucide-vue-next'
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

const emit = defineEmits([
  'update:modelValue',
  'update:selectedBatchCode',
  'update:editedBatches',
  'update:editedBatchCodes',
  'close',
  'voidWarning',
  'publish',
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
  const crop = cropOptions.value.find(c => c.name === editedData.value.cropName)
  return crop?.varieties || []
})

const editedData = computed({
  get: () => {
    if (!localSelectedBatchCode.value) return {}
    const base = props.batches.find(b => b.batchCode === localSelectedBatchCode.value) || {}
    const edited = props.editedBatches[localSelectedBatchCode.value] || {}
    return {
      plantingMode: edited.plantingMode ?? base.plantingMode ?? '',
      cropName: edited.cropName ?? base.cropName ?? '',
      variety: edited.variety ?? base.variety ?? '',
      greenhouseId: edited.greenhouseId ?? base.greenhouseId ?? '',
      greenhouseName: edited.greenhouseName ?? base.greenhouseName ?? '',
      plantingArea: edited.plantingArea ?? base.plantingArea ?? '',
      startDate: edited.startDate ?? base.startDate ?? '',
      expectedHarvestDate: edited.expectedHarvestDate ?? base.expectedHarvestDate ?? '',
      responsiblePerson: edited.responsiblePerson ?? base.responsiblePerson ?? '',
      targetYield: edited.targetYield ?? base.targetYield ?? '',
      isCompleted: edited.isCompleted ?? undefined,
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

const localIsCompleted = computed({
  get: () => {
    const val = editedData.value.isCompleted
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
  editedData.value = { ...editedData.value, [field]: value }
}

function handleCropChange(cropName) {
  const crop = cropOptions.value.find(c => c.name === cropName)
  handleFieldChange('cropName', cropName)
  if (crop) {
    handleFieldChange('variety', crop.varieties[0])
  }
}

function handleGreenhouseChange(greenhouseId) {
  const gh = activeGreenhouses.value.find(g => g.id === greenhouseId)
  handleFieldChange('greenhouseId', greenhouseId)
  if (gh) {
    handleFieldChange('greenhouseName', gh.name)
  }
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
</script>

<style scoped>
.batch-edit-dialog :deep(.el-dialog__header) {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}
.batch-edit-dialog :deep(.el-dialog__body) {
  padding: 0;
}
.batch-edit-dialog :deep(.el-dialog__footer) {
  padding: 0;
}
</style>

<template>
  <!--
    @file BatchEditModal.vue
    @description 批量编辑生产计划弹窗 - 1:1 翻译 V1.1 BatchEditModal.tsx
                 字段布局恢复为 V1.1 的 6 个独立 2-col 行（与新建弹窗保持一致）
    @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\production\modals\BatchEditModal.tsx
    @fix P0-005: 执行状态下拉恢复 3 个选项（pending_execution/in_progress/completed）
    @fix P1-007: 布局从单一 grid-cols-4 改为 6 个独立 grid-cols-2 行
    @fix 2026-06-04: 用本地 formState 替代 computed + v-model（v-model 在 computed 子属性上不写回 props，edits 永不持久化）
    @fix 2026-06-04: 改用 #header 插槽的 ElModal 包装 + 移除 :show-close="false"，确保关闭按钮渲染
  -->
  <ElModal
    v-model="visible"
    title="批量编辑生产计划"
    :width="900"
    :height="650"
    :show-submit="false"
    :show-cancel="false"
    @close="handleClose"
  >
    <!-- Info Banner - 1:1 V1.1 L251-278 -->
    <div class="p-4 bg-gray-50 border-b border-gray-300 -mx-4 sm:-mx-6 -mt-4">
      <div class="bg-blue-50 rounded-lg p-3 mb-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个生产计划进行批量编辑，已编辑
          <strong>{{ editedBatchCodes.length }}</strong> 个
        </p>
      </div>

      <div class="flex items-center gap-4 mb-3">
        <div class="flex-1">
          <label class="text-xs text-gray-600 block mb-1">选择生产计划批次号</label>
          <select
            v-model="localSelectedBatchCode"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner bg-white"
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

          <!-- 作物品种 - 可编辑（与新建一致） - 1:1 对应 V1.1 L182-201 -->
          <div>
            <div class="text-xs text-gray-500 mb-1">作物品种</div>
            <CropCodeSelector
              :model-value="formState.cropCode || currentBatch.cropCode || ''"
              :display-label="currentBatch.variety"
              placeholder="搜索或选择作物品种..."
              size="sm"
              show-full-path
              @change="handleCropChange"
            />
            <div
              v-if="selectedCrop"
              class="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs"
            >
              <span class="text-emerald-700">
                {{ selectedCrop.categoryName }} &gt; {{ selectedCrop.typeName }} &gt; {{ selectedCrop.varietyName }}
                {{ selectedCrop.subVariety1Name && ` > ${selectedCrop.subVariety1Name}` }}
              </span>
            </div>
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
                  :checked="isGreenhouseChecked(g.name)"
                  @change="(e) => toggleGreenhouseByName(g.name, e.target.checked)"
                  class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label :for="`edit-gh-${g.id}`" class="text-sm cursor-pointer">{{ g.name }}</label>
              </div>
              <div v-if="activeGreenhouses.length === 0" class="text-xs text-gray-400 py-2 px-1">暂无温室数据（请先访问系统管理→温室模块加载数据）</div>
            </div>
            <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
              <!-- 1:1 对应 V1.1 L72-76：直接展示 greenhouseName 字符串（后端 API 返的逗号分隔名字）-->
              {{ formState.greenhouseName || '请选择' }}
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
                  :checked="formState.plantingMode.includes(mode.value)"
                  @change="togglePlantingMode(mode.value)"
                  class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label :for="`edit-pm-${mode.value}`" class="text-sm cursor-pointer">{{ mode.label }}</label>
              </div>
            </div>
            <div v-else class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 flex items-center">
              {{ formState.plantingMode.length === 0 ? '请选择' : formState.plantingMode.map(v => plantingModeOptions.find(m => m.value === v)?.label).filter(Boolean).join(', ') }}
            </div>
          </div>
        </div>

        <!-- 第三行：开始时间 + 预计结束时间 - 1:1 对应 V1.1 L296-316 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">开始时间</label>
            <input
              :value="formState.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @input="handleFieldChange('startDate', $event.target.value)"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">预计结束时间</label>
            <input
              :value="formState.expectedHarvestDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @input="handleFieldChange('expectedHarvestDate', $event.target.value)"
            />
          </div>
        </div>

        <!-- 第四行：负责人 + 目标产量/单位（按计划类型分流） - 1:1 V1.1 L424-509 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">负责人</label>
            <select
              :value="formState.responsiblePerson"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
              @change="handleFieldChange('responsiblePerson', $event.target.value)"
            >
              <option value="" disabled>请选择</option>
              <option v-for="name in RESPONSIBLE_PERSONS" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <!-- 育苗计划：目标投入 + 目标产出 - 1:1 V1.1 L443-484 -->
          <div v-if="currentPlanType === 'seedling'" class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 mb-1 block">目标投入（母株/种子/分株基数）</label>
              <input
                :value="formState.targetInputCount === 0 || formState.targetInputCount == null ? '' : formState.targetInputCount"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                @input="handleTargetInputChange"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">目标产出（成活/扩繁/嫁接苗）</label>
              <input
                :value="formState.targetOutputCount === 0 || formState.targetOutputCount == null ? '' : formState.targetOutputCount"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                @input="handleTargetOutputChange"
              />
            </div>
          </div>
          <!-- 育种 / 种植计划：目标产量 + 单位 -->
          <div v-else class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 mb-1 block">目标产量</label>
              <input
                :value="formState.targetYield"
                type="number"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                @input="handleFieldChange('targetYield', $event.target.value)"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">单位</label>
              <select
                :value="formState.unit"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                @change="handleFieldChange('unit', $event.target.value)"
              >
                <option value="" disabled>选择单位</option>
                <option value="kg">kg</option>
                <option value="吨">吨</option>
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
              :value="formState.plantingArea"
              type="number"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @input="handleFieldChange('plantingArea', $event.target.value)"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">面积单位</label>
            <select
              :value="formState.plantingAreaUnit"
              class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
              @change="handleFieldChange('plantingAreaUnit', $event.target.value)"
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
                :value="formState.executionStatus"
                class="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                @change="handleFieldChange('executionStatus', $event.target.value)"
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
            <template v-if="formState.planDetailFileName">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ formState.planDetailFileName }}</span>
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
      <div class="flex gap-3">
        <!-- 1:1 V1.1 L233-247 footer - 顺序：确认（下一个）→ 申请作废 → 保存/提交 -->
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="handleConfirmNext"
        >
          <Check class="w-4 h-4" /> 确认（下一个）
        </button>
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600"
          @click="handleVoid"
        >
          <AlertTriangle class="w-4 h-4" /> 申请作废
        </button>
        <!-- 1:1 V1.1 L243：pending/rejected → "提交"(publish)；其他 → "保存"(save) -->
        <button
          v-if="currentBatch && (currentBatch.batchStatus === 'pending' || currentBatch.batchStatus === 'rejected')"
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          @click="handlePublish"
        >提交</button>
        <button
          v-else
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          @click="handleSave"
        >保存</button>
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
 *              2026-06-04: 改用本地 formState + 显式 handler（修复 v-model 在 computed 子属性上不写回 props 的 bug）
 *              2026-06-04: 配合 ElModal #header 插槽 + 移除 :show-close="false"
 */
import { computed, ref, watch } from 'vue'
import { ChevronUp, ChevronDown, Upload, Check, AlertTriangle } from 'lucide-vue-next'
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
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'

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

// 模式选项 - 根据当前批次的计划类型（与 CreateBatchModal 一致）
const plantingModeOptions = computed(() => {
  if (!currentBatch.value) return PLANTING_MODES
  return getModesByPlanType(currentBatch.value.planType)
})

// 1:1 V1.1 L186-187 currentPlanType
const currentPlanType = computed(() => formState.value.planType || currentBatch.value?.planType || 'planting')

// 已选品种的详情（用于显示完整路径）- 1:1 对应 V1.1 setSelectedCrop + selectedCrop
const selectedCrop = ref(null)

/**
 * 本地表单状态（修复 v-model 失效问题）
 * 旧实现：editedDataProxy 是 computed（get 返回新对象，set 调用 emit），
 *        但 Vue 的 v-model="editedDataProxy.field" 展开为对返回对象的临时属性赋值，
 *        set 永远不会被调用，导致 editedBatches 永远为空。
 * 新实现：本地 formState ref + 显式 handler 直接 emit
 *        （更接近 V1.1 React 风格的 onChange + 1:1 行为对齐）
 */
const formState = ref(defaultEditedData())

function defaultEditedData() {
  return {
    cropCode: '',
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
    targetInputCount: 0,
    targetOutputCount: 0,
    planType: '',
    executionStatus: '',
    plantingMode: [],
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

/**
 * 当选中批次变化时，从 base + edited 合并到 formState
 * 与 V1.1 editedData = { ...editedBatches[selectedBatchCode], ...base } 等价
 *
 * 2026-06-14 P0 修复: 增加 `props.editedBatches` 依赖
 * 根因: 之前只 watch currentBatch，导致以下场景 formState 永远不重置：
 *   1. 用户先在弹窗里编辑字段 A（emit 父组件）
 *   2. 父组件 editedBatches 更新（但 currentBatch 没变）
 *   3. 切换到另一个批次再切回 —— currentBatch 引用变化（find 返回新对象）watch 才触发
 *   4. 但如果用户没切换批次，edited 一直累积在 formState 里没问题
 *   **真正的"互相清零"根因**：之前 handleFieldChange 用 `props.editedBatches[code]` 读父级旧值做合并
 *   当父级在某些时序下没及时同步 currentEdited 时，会用空对象覆盖已保存的字段
 * 修复方案：watch 同时依赖 currentBatch + props.editedBatches（确保父级变化也重置）
 *          + handleFieldChange 用 formState 做唯一数据源，不再读父级旧值
 */
watch([currentBatch, () => props.editedBatches], ([batch, editedMap]) => {
  selectedCrop.value = null
  if (!batch) {
    formState.value = defaultEditedData()
    return
  }
  const edited = editedMap?.[batch.batchCode] || {}
  formState.value = {
    cropCode: edited.cropCode ?? batch.cropCode ?? '',
    cropName: edited.cropName ?? batch.cropName ?? '',
    variety: edited.variety ?? batch.variety ?? '',
    greenhouseId: parseArray(edited.greenhouseId ?? batch.greenhouseId),
    greenhouseName: edited.greenhouseName ?? batch.greenhouseName ?? '',
    plantingArea: edited.plantingArea ?? batch.plantingArea ?? '',
    plantingAreaUnit: edited.plantingAreaUnit ?? batch.plantingAreaUnit ?? '',
    unit: edited.unit ?? batch.unit ?? '',
    startDate: edited.startDate ?? batch.startDate ?? '',
    expectedHarvestDate: edited.expectedHarvestDate ?? batch.expectedHarvestDate ?? '',
    responsiblePerson: edited.responsiblePerson ?? batch.responsiblePerson ?? '',
    targetYield: edited.targetYield ?? batch.targetYield ?? '',
    targetInputCount: edited.targetInputCount ?? batch.targetInputCount ?? 0,
    targetOutputCount: edited.targetOutputCount ?? batch.targetOutputCount ?? 0,
    planType: edited.planType ?? batch.planType ?? '',
    executionStatus: edited.executionStatus ?? batch.executionStatus ?? '',
    plantingMode: parseArray(edited.plantingMode ?? batch.plantingMode),
    planDetailFileName: edited.planDetailFileName ?? batch.planDetailFileName ?? '',
    planDetail: edited.planDetail ?? batch.planDetail ?? ''
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.selectedRows.length > 0 && !localSelectedBatchCode.value) {
    const first = selectedBatches.value[0]
    if (first) {
      localSelectedBatchCode.value = first.batchCode
    }
  }
})

/**
 * 单字段变更 - 1:1 翻译 V1.1 handleFieldChange
 * 直接 emit 'update:editedBatches' 和 'update:editedBatchCodes'
 *
 * 2026-06-14 P0 修复: 用 formState 做唯一数据源
 * 根因（旧实现）：`const currentEdited = props.editedBatches[code] || {}` 读父级旧值做合并
 *   当父级响应式系统还没及时把上一 emit 同步过来时，currentEdited 是空对象，
 *   然后 `{ ...currentEdited, [field]: value }` 会丢弃已编辑的其他字段
 *   → "输入 input A 后再输入 input B，input A 被清零" 现象
 * 修复（新实现）：emit 时直接用 formState 当前完整内容作为该批次的 edited，
 *   formState 始终是最新（每次输入都同步写），不再依赖父级旧值做合并
 */
function handleFieldChange(field, value) {
  // 1) 写 formState（保证 formState 始终是该字段的最新值）
  formState.value = { ...formState.value, [field]: value }
  if (!localSelectedBatchCode.value) return
  // 2) emit 完整 formState（剥掉 formState 私有字段如有）
  //    父组件 updated 公式: { ...props.editedBatches, [code]: { ...formState } }
  //    但 formState 包含 defaultEditedData() 全字段，直接用作该 code 的 edited
  //    这就确保了：emit 的 edited 永远包含所有已编辑字段的最新值
  const updated = {
    ...props.editedBatches,
    [localSelectedBatchCode.value]: { ...formState.value }
  }
  emit('update:editedBatches', updated)
  if (!props.editedBatchCodes.includes(localSelectedBatchCode.value)) {
    emit('update:editedBatchCodes', [...props.editedBatchCodes, localSelectedBatchCode.value])
  }
}

// 作物变更 - 1:1 对应 V1.1 handleCropChange
function handleCropChange(code, varietyInfo) {
  if (varietyInfo) {
    selectedCrop.value = varietyInfo
    handleFieldChange('cropCode', varietyInfo.cropCode)
    handleFieldChange('cropName', varietyInfo.varietyName)
    handleFieldChange('variety', varietyInfo.subVariety1Name || varietyInfo.varietyName)
  } else {
    selectedCrop.value = null
    handleFieldChange('cropCode', '')
    handleFieldChange('cropName', '')
    handleFieldChange('variety', '')
  }
}

function togglePlantingMode(value) {
  const current = [...(formState.value.plantingMode || [])]
  const index = current.indexOf(value)
  if (index === -1) {
    current.push(value)
  } else {
    current.splice(index, 1)
  }
  handleFieldChange('plantingMode', current)
}

// 1:1 翻译 V1.1 L226-235 handleFieldChange('greenhouseName', ...)
// 因为后端 API greenhouseId 永远 null，只能按 name 字符串匹配
function toggleGreenhouseByName(name, checked) {
  const currentNames = (formState.value.greenhouseName || '').split(',').map(s => s.trim()).filter(Boolean)
  const index = currentNames.indexOf(name)
  if (checked && index === -1) {
    currentNames.push(name)
    handleFieldChange('greenhouseName', currentNames.join(','))
  } else if (!checked && index !== -1) {
    currentNames.splice(index, 1)
    handleFieldChange('greenhouseName', currentNames.join(','))
  }
}

function isGreenhouseChecked(name) {
  const currentNames = (formState.value.greenhouseName || '').split(',').map(s => s.trim()).filter(Boolean)
  return currentNames.includes(name)
}

// 育苗计划目标投入/产出 - 1:1 V1.1 L451-481
function handleTargetInputChange(event) {
  const v = event.target.value
  if (v === '') {
    handleFieldChange('targetInputCount', 0)
    return
  }
  const n = Number(v)
  if (!Number.isNaN(n) && n >= 0) handleFieldChange('targetInputCount', n)
}

function handleTargetOutputChange(event) {
  const v = event.target.value
  if (v === '') {
    handleFieldChange('targetOutputCount', 0)
    return
  }
  const n = Number(v)
  if (!Number.isNaN(n) && n >= 0) handleFieldChange('targetOutputCount', n)
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

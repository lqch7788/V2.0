<template>
  <!--
    @file 技术方案新增弹窗 - 1:1 翻译 V1.1 src/components/techSolution/CreateModal.tsx
    @description 父组件完全持有 form 状态，子组件通过 props 接收 + 字段级 update:form 事件回写
    @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\techSolution\CreateModal.tsx
    ✅ 修复: 完全照搬 V1.1 模式——弹窗打开/字段更新/提交 全链路对齐
  -->
  <ElModal
    :model-value="visible"
    title="新增方案"
    :width="900"
    :height="650"

    @update:model-value="(v) => !v && emit('close')"
    @close="emit('close')"
  >
    <div class="p-2">
      <div class="space-y-4">
        <!-- 第一行：方案编号 + 方案标题（V1.1 L188-216） -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案编号</label>
            <div class="flex gap-2">
              <input
                :value="form?.code ?? ''"
                :class="inputClass"
                placeholder="请输入方案编号"
                @input="(e) => handleFieldChange('code', e.target.value)"
              />
              <button
                :class="btnDefault + ' flex-shrink-0'"
                @click="handleGenerateCode"
              >生成</button>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案标题 <span class="text-red-500">*</span></label>
            <input
              :value="form?.title ?? ''"
              :class="inputClass"
              placeholder="请输入方案标题"
              @input="(e) => handleFieldChange('title', e.target.value)"
            />
          </div>
        </div>

        <!-- 第二行：关联生产批次号（V1.1 L219-225，独占整行，从生产计划列表动态生成） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">关联生产批次号</label>
          <el-select
            :model-value="form?.relatedBatchCode ?? ''"
            class="w-full"
            placeholder="请选择"
            @update:model-value="handleRelatedBatchChange"
          >
            <el-option
              v-for="opt in relatedBatchOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <!-- 第三行：作物品种 + 种植模式（V1.1 L228-284，修复 P0-B1 行为） -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">作物品种 <span class="text-red-500">*</span></label>
            <CropCodeSelector
              :model-value="form?.cropCode ?? ''"
              :placeholder="isLockedByBatch ? '已从关联批次自动填充' : '搜索或选择作物品种...'"
              size="md"
              show-full-path
              :disabled="isLockedByBatch"
              @update:model-value="(v) => handleFieldChange('cropCode', v)"
              @change="handleCropChange"
            />
            <!-- 修复 P0-B1：V1.1 L249-275 1:1 还原 selectedCrop/selectedBatch 详情卡片 -->
            <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div class="text-emerald-700 flex items-center gap-1">
                <Leaf class="w-3 h-3 flex-shrink-0" />
                {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
                <span v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</span>
              </div>
              <div class="text-emerald-600 mt-0.5">
                编码：{{ selectedCrop.cropCode }}
              </div>
            </div>
            <div v-else-if="selectedBatch" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div class="text-emerald-700 flex items-center gap-1">
                <Leaf class="w-3 h-3 flex-shrink-0" />
                作物：{{ selectedBatch.cropName || '-' }}
                <span v-if="selectedBatch.variety"> · {{ selectedBatch.variety }}</span>
              </div>
              <div v-if="selectedBatch.plantingMode" class="text-emerald-600 mt-0.5">
                种植模式：{{ plantingModeDisplay || selectedBatch.plantingMode }}
              </div>
              <div v-if="selectedBatchDisplayCode" class="text-emerald-600 mt-0.5">编码：{{ selectedBatchDisplayCode }}</div>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">种植模式</label>
            <!-- ✅ 修复 P0: 关联批次锁定时显示中文 div（V1.1 L270-274 1:1） -->
            <div
              v-if="isLockedByBatch"
              class="h-10 px-3 border border-gray-400 bg-gray-50 rounded-lg text-sm text-gray-900 flex items-center"
            >
              {{ plantingModeDisplay || '（未设置）' }}
            </div>
            <el-select
              v-else
              :model-value="form?.plantingMode ?? ''"
              class="w-full"
              placeholder="选择种植模式"
              @update:model-value="(v) => handleFieldChange('plantingMode', v)"
            >
              <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
            </el-select>
          </div>
        </div>

        <!-- 第四行：适用范围（可多选，独占整行，V1.1 L287-322） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">适用范围（可多选）</label>
          <div class="space-y-2">
            <button
              type="button"
              :class="btnGhost + ' flex items-center gap-1 text-gray-600'"
              @click="scopeExpanded = !scopeExpanded"
            >
              <component :is="scopeExpanded ? ChevronUp : ChevronDown" class="w-4 h-4" />
              <span>{{ scopeExpanded ? '收起' : '展开' }}</span>
            </button>
            <div v-if="scopeExpanded" class="flex flex-wrap gap-2">
              <label v-for="scope in TECH_SOLUTION_SCOPES" :key="scope" class="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="(form?.scopes || []).includes(scope)"
                  @change="(e) => toggleScope(scope, e.target.checked)"
                  class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="text-sm">{{ scope }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 第五行：编制人 + 版本 + 创建日期（3 列，V1.1 L325-342 1:1） -->
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">编制人</label>
            <el-select
              :model-value="form?.author ?? ''"
              class="w-full"
              @update:model-value="(v) => handleFieldChange('author', v)"
            >
              <el-option v-for="op in operatorOptions" :key="op.value" :label="op.label" :value="op.value" />
            </el-select>
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">版本</label>
            <input
              :value="form?.version ?? ''"
              :class="inputClass"
              @input="(e) => handleFieldChange('version', e.target.value)"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">创建日期</label>
            <input :value="todayLocal()" disabled :class="inputClass + ' bg-gray-50'" />
          </div>
        </div>

        <!-- 第六行：备注（V1.1 L344-352，rows=3） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">备注</label>
          <textarea
            :value="form?.remarks ?? ''"
            rows="3"
            :class="inputClass + ' resize-y'"
            placeholder="请输入备注信息"
            @input="(e) => handleFieldChange('remarks', e.target.value)"
          ></textarea>
        </div>

        <!-- 第七行：方案内容（V1.1 L354-362） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">方案内容</label>
          <textarea
            :value="form?.content ?? ''"
            rows="6"
            :class="inputClass + ' resize-y'"
            placeholder="请输入方案内容（也可通过下方导入文件自动填充）"
            @input="(e) => handleFieldChange('content', e.target.value)"
          ></textarea>
        </div>

        <!-- 第八行：方案详细（V1.1 L364-376） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">方案详细</label>
          <div class="flex items-center gap-2">
            <button :class="btnBlue" @click="handleFileUpload">
              <Upload class="w-3 h-3" />
              导入文件
            </button>
            <span class="text-xs text-gray-500">支持 .txt, .md, .docx 格式文件</span>
            <span v-if="form?.planDetailFileName" class="text-xs text-emerald-600">{{ form.planDetailFileName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮（V1.1 Modal showFooter + footer） -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button :class="btnSecondary" @click="emit('submit', 'draft')">存为草稿</button>
        <button :class="btnDefault" @click="emit('submit', 'submit')">提交审批</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * @file TechSolutionCreateModal.vue
 * @description 完全对齐 V1.1 CreateModal.tsx 父组件拥有 form 状态的模式
 * - 父组件通过 :form="form" 传整个 form 对象
 * - 子组件 emit 字段级 update:form 事件，父组件做 { ...form, field: value } 合并
 * - 所有 form 字段名/类型与 V1.1 NewPlanForm 一致
 */
import { ref, computed, onMounted } from 'vue'
import { ElModal } from '@/components/ui'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf, Upload, ChevronDown, ChevronUp } from 'lucide-vue-next'
// 修复 P0-B7-FALLBACK：V1.1 老 production_plans 数据 cropCode 为 null，
// 通过 cropName 反查作物品种库拿 cropCode（与 V1.1 L114 行为 1:1）
import { findOrCreateVarietyByName, getVarietyByCode } from '@/services/cropVarietyService'
// 修复 P0-005：从共享常量文件导入 28 个适用范围枚举
import { TECH_SOLUTION_SCOPES } from '../constants/techSolutionScopes'
// 第二阶段 Y1 重构：种植模式加载抽 composable
import { usePlantingModes } from '@/composables/production/usePlantingModes'
// 修复 P1-2/P1-3：去重文件读取
import { pickAndReadFile } from '@/utils/fileUpload'
// 编号生成：与 V1.1 一致使用全局函数
import { generateTechSolutionCode } from '@/utils/techSolutionHelpers'
// 修复 P0-B2：生成方案编号失败提示
import { showAlert } from '@/lib/dialogService'

// 样式常量
import { btnDefault, btnSecondary, btnBlue, btnGhost, inputClassStrong as inputClass } from '../constants/buttonStyles'

// 种植模式字典
const { plantingModes, loadPlantingModes } = usePlantingModes()

onMounted(() => {
  loadPlantingModes()
})

// ==================== Props & Emits ====================

/**
 * 父组件传整个 form 对象（普通对象，不是 ref）。
 * Vue 3 模板属性绑定对顶层 ref 会自动 unwrap，所以 :form="form" 已经是 value。
 * 为防御起见用 `?? {}` 兜底。
 */
const props = defineProps({
  visible: Boolean,
  form: { type: Object, default: () => ({}) },
  selectedCrop: Object,
  operatorOptions: { type: Array, default: () => [] },
  // ✅ 修复 P0: V1.1 关联生产批次号下拉从生产计划列表动态生成
  batches: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit', 'update:visible', 'field-change', 'update:selectedCrop'])

// 适用范围折叠状态（V1.1 L177 scopeExpanded=true 首屏直接展示复选框）
const scopeExpanded = ref(true)

// ✅ 修复 P0: 关联生产批次号下拉项（V1.1 CreateModal L72-83 1:1 翻译）
// V1.1 用 useMemo 从 batches 派生 [{ value, label }]
// V2.0 字段映射：batch.batchCode (V1.1) → plan.batchCode (V2.0)；
//                batch.cropName → plan.cropName
//                batch.variety → plan.variety（仅 V2.0 有，V1.1 没有）
const relatedBatchOptions = computed(() => {
  const opts = [{ value: '', label: '不关联' }]
  for (const b of props.batches || []) {
    const code = b.batchCode || b.id
    if (code) {
      const labelCrop = b.cropName || b.variety || ''
      opts.push({
        value: code,
        label: `${code} - ${labelCrop}`,
      })
    }
  }
  return opts
})

// ✅ 修复 P0: 关联批次后锁定（V1.1 L121 isLockedByBatch 1:1）
// 当 relatedBatchCode 非空时，作物品种 + 种植模式字段被禁用/锁定
const isLockedByBatch = computed(() => !!props.form?.relatedBatchCode)

// ✅ 修复 P0: 关联生产批次号变化处理（V1.1 L94-118 handleRelatedBatchChange 1:1）
// 选"不关联"（空 value）→ 清空自动填的字段
// 选具体批次 → 自动填 form.crop + form.cropCode + form.plantingMode（V1.1 L111-117 行为 1:1）
function handleRelatedBatchChange(value) {
  if (!value) {
    emit('field-change', { field: 'relatedBatchCode', value: '' })
    emit('field-change', { field: 'cropCode', value: '' })
    emit('field-change', { field: 'crop', value: '' })
    emit('field-change', { field: 'plantingMode', value: '' })
    return
  }
  const batch = (props.batches || []).find((b) => (b.batchCode || b.id) === value)
  if (!batch) {
    // 找不到对应批次时只设 relatedBatchCode，作物字段留空让用户手动选
    emit('field-change', { field: 'relatedBatchCode', value })
    return
  }
  // V1.1 L111-117：4 个字段同步回填（relatedBatchCode + cropCode + crop + plantingMode）
  emit('field-change', { field: 'relatedBatchCode', value })
  emit('field-change', { field: 'crop', value: batch.cropName || '' })
  emit('field-change', { field: 'plantingMode', value: batch.plantingMode || '' })
  // 修复 P0-B7-FALLBACK：V1.1 老 production_plans 数据 cropCode 为 null，
  // 通过 cropName 反查作物品种库（V1.1 L114 batch.cropCode 1:1 翻译）
  let resolvedCropCode = batch.cropCode || ''
  if (!resolvedCropCode && batch.cropName) {
    const variety = findOrCreateVarietyByName(batch.cropName)
    if (variety) resolvedCropCode = variety.cropCode || ''
  }
  if (!resolvedCropCode && batch.variety) {
    const variety = findOrCreateVarietyByName(batch.variety)
    if (variety) resolvedCropCode = variety.cropCode || ''
  }
  emit('field-change', { field: 'cropCode', value: resolvedCropCode })
}

// 种植模式值→label 翻译（V1.1 L132-141 1:1）
const plantingModeDisplay = computed(() => {
  const raw = props.form?.plantingMode
  if (!raw) return ''
  return raw.split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      const list = plantingModes.value || []
      return list.find((m) => m === v) || v
    })
    .filter(Boolean)
    .join('、')
})

// 修复 P0-B7-CARD：selectedBatch.cropCode 为 null 时通过 cropName 反查作物品种库
// 用于详情卡片显示"编码：xxx"行
const selectedBatchDisplayCode = computed(() => {
  if (!props.selectedBatch) return ''
  if (props.selectedBatch.cropCode) return props.selectedBatch.cropCode
  if (props.selectedBatch.cropName) {
    const v = findOrCreateVarietyByName(props.selectedBatch.cropName)
    if (v) return v.cropCode || ''
  }
  if (props.selectedBatch.variety) {
    const v = findOrCreateVarietyByName(props.selectedBatch.variety)
    if (v) return v.cropCode || ''
  }
  return ''
})

/** 本地时区日期（V1.1 L340 1:1） */
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ==================== 字段级更新（V1.1 setForm(prev => ({...prev, [field]: value})) 1:1） ====================

/**
 * 统一字段级更新（V1.1 onChange 1:1 翻译）
 * 每次输入字符/选项变化，立即 emit 整个新 form 给父组件
 * 父组件 `(v) => newPlanForm = v` 接收后立刻同步
 */
function handleFieldChange(field, value) {
  // ✅ 修复 P0: 字段级 emit（V1.1 setForm 1:1 翻译）
  // 父组件接收 {field, value}，做 { ...form, [field]: value } 合并
  emit('field-change', { field, value })
}

// 生成按钮（V1.1 onClick 1:1，修复 P0-B2 错误处理 + P0-T1 后端生成）
// V1.1 L202-211 用 try/catch + alert 错误提示
// P0-T1 修复：V1.1 调用后端 GET /api/tech-solutions/generate-code，V2.0 改用 async 调
function handleGenerateCode() {
  generateTechSolutionCode()
    .then((code) => {
      emit('field-change', { field: 'code', value: code })
    })
    .catch((e) => {
      const msg = e instanceof Error ? e.message : String(e)
      showAlert(`生成方案编号失败：${msg}`)
    })
}

// 适用范围 toggle（V1.1 L302-312 1:1）
function toggleScope(scope, checked) {
  const scopes = props.form?.scopes || []
  const next = checked
    ? [...scopes, scope]
    : scopes.filter((s) => s !== scope)
  emit('field-change', { field: 'scopes', value: next })
}

// 作物选择后回填 crop + cropCode（V1.1 L96-103 1:1）
function handleCropChange(code, varietyInfo) {
  if (varietyInfo) {
    emit('update:selectedCrop', varietyInfo)
    emit('field-change', { field: 'cropCode', value: code || '' })
    emit('field-change', { field: 'crop', value: varietyInfo.subVariety1Name || varietyInfo.varietyName || '' })
  } else {
    emit('update:selectedCrop', null)
    emit('field-change', { field: 'cropCode', value: '' })
    emit('field-change', { field: 'crop', value: '' })
  }
}

// 文件上传（V1.1 L143-163 1:1，修复 P0-B3 严格限制纯文本格式）
// V1.1 L147 注释明确：.docx 是二进制 zip 文件，readAsText 会读出乱码，仅允许纯文本格式
// 修复：去掉 .docx accept（V2.0 之前错误允许 docx）
function handleFileUpload() {
  pickAndReadFile({
    accept: '.txt,.md',
    onLoad: ({ fileName, content }) => {
      emit('field-change', { field: 'content', value: content })
      emit('field-change', { field: 'planDetailFileName', value: fileName })
    },
  })
}
</script>

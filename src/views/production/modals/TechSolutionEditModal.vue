<template>
  <!--
    @file 技术方案编辑弹窗 - 完全照搬 V1.1 src/components/techSolution/EditModal.tsx
    @description 父组件完全持有 form 状态 + 字段级 emit 协议（与 CreateModal 1:1）
    @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\techSolution\EditModal.tsx
    字段顺序：① 方案编号+标题 ② 关联批次号 ③ 作物品种+种植模式 ④ 适用范围 ⑤ 编制人+版本+创建日期 ⑥ 备注 ⑦ 方案是否有效 ⑧ 方案内容 ⑨ 方案详情文件
  -->
  <ElModal
    :model-value="visible"
    title="编辑方案"
    :width="900"
    :height="650"

    @update:model-value="(v) => !v && emit('close')"
    @close="emit('close')"
  >
    <div v-if="tech" class="p-2">
      <div class="space-y-4">
        <!-- 第 1 行：方案编号 + 方案标题（V1.1 L179-190） -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">方案编号</label>
            <input :value="tech.code" disabled :class="inputClass + ' bg-gray-50'" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">
              方案标题 <span class="text-red-500">*</span>
            </label>
            <input
              :value="form?.title ?? ''"
              :class="inputClass"
              placeholder="请输入方案标题"
              @input="(e) => handleFieldChange('title', e.target.value)"
            />
          </div>
        </div>

        <!-- 第 2 行：关联生产批次号（独占整行，V1.1 L193-199，从生产计划列表动态生成） -->
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

        <!-- 第 3 行：作物品种 + 种植模式（V1.1 L202-258，关联批次时锁定） -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">作物品种</label>
            <CropCodeSelector
              :model-value="form?.cropCode ?? ''"
              :placeholder="isLockedByBatch ? '已从关联批次自动填充' : '搜索或选择作物品种...'"
              size="md"
              show-full-path
              :disabled="isLockedByBatch"
              @update:model-value="(v) => handleFieldChange('cropCode', v)"
              @change="handleCropChange"
            />
            <!-- ✅ 修复: V1.1 L212-241 1:1 还原 selectedCrop/selectedBatch 详情卡片 -->
            <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div class="text-emerald-700 flex items-center gap-1">
                <Leaf class="w-3 h-3 flex-shrink-0" />
                {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
                <span v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</span>
              </div>
              <div class="text-emerald-600 mt-0.5">编码：{{ selectedCrop.cropCode }}</div>
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
              <div v-if="selectedBatch.cropCode" class="text-emerald-600 mt-0.5">编码：{{ selectedBatch.cropCode }}</div>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">种植模式</label>
            <!-- ✅ 修复: 关联批次锁定时显示中文 div（V1.1 L244-248 1:1） -->
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

        <!-- 第 4 行：适用范围（多选，独占整行，V1.1 L260-296） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">适用范围（可多选）</label>
          <div class="space-y-2">
            <button
              type="button"
              :class="btnGhost + ' flex items-center gap-1 text-gray-600'"
              @click="emit('scope-toggle')"
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

        <!-- 第 5 行：编制人 + 版本 + 创建日期（3 列，V1.1 L298-316） -->
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
            <input :value="tech.createDate" disabled :class="inputClass + ' bg-gray-50'" />
          </div>
        </div>

        <!-- 第 6 行：备注（V1.1 L318-325，rows=2） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">备注</label>
          <textarea
            :value="form?.remarks ?? ''"
            rows="2"
            :class="inputClass + ' resize-y'"
            placeholder="请输入备注信息"
            @input="(e) => handleFieldChange('remarks', e.target.value)"
          ></textarea>
        </div>

        <!-- 第 7 行：方案是否有效（编辑弹窗独有，V1.1 L327-342） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">方案是否有效</label>
          <el-select
            :model-value="form?.isValid ?? '有效'"
            class="w-full"
            @update:model-value="(v) => handleFieldChange('isValid', v)"
          >
            <el-option label="有效" value="有效" />
            <el-option label="作废" value="作废" />
          </el-select>
          <p v-if="form?.isValid === '作废'" class="text-xs text-red-600 mt-1 font-medium">
            ⚠️ 选择"作废"后方案将无法使用，提交后将进入审核流程
          </p>
        </div>

        <!-- 第 8 行：方案内容（V1.1 L344-351） -->
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

        <!-- 第 9 行：方案详情文件上传（V1.1 L353-377，含删除按钮） -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">方案详情文件</label>
          <div class="flex items-center gap-3">
            <button :class="btnBlue" @click="handleFileUpload">
              <Upload class="w-3 h-3" />
              导入文件
            </button>
            <span class="text-xs text-gray-500">支持 .txt, .md, .docx 格式</span>
            <span v-if="form?.planDetailFileName" class="text-xs text-emerald-600">{{ form.planDetailFileName }}</span>
            <button
              v-if="form?.planDetailFileName"
              :class="btnGhost + ' text-red-500 hover:text-red-700 text-xs'"
              @click="handleClearPlanDetail"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button :class="btnSecondary" @click="emit('close')">取消</button>
        <button :class="btnDefault" @click="emit('submit')">保存</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * @file TechSolutionEditModal.vue
 * @description 完全对齐 V1.1 EditModal.tsx
 * 父组件拥有 form 状态，子组件通过 props 接收 + 字段级 update 事件回写
 */
import { computed, onMounted, watch } from 'vue'
import { ElModal } from '@/components/ui'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf, Upload, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { TECH_SOLUTION_SCOPES } from '../constants/techSolutionScopes'
import { usePlantingModes } from '@/composables/production/usePlantingModes'
import { pickAndReadFile } from '@/utils/fileUpload'

// 样式常量
import { btnDefault, btnSecondary, btnBlue, btnGhost, inputClass } from '../constants/buttonStyles'

// 种植模式字典
const { plantingModes, loadPlantingModes } = usePlantingModes()

onMounted(() => {
  loadPlantingModes()
})

// ==================== Props & Emits ====================

const props = defineProps({
  visible: Boolean,
  tech: Object,
  form: { type: Object, default: () => ({}) },
  selectedCrop: Object,
  operatorOptions: { type: Array, default: () => [] },
  // ✅ 修复 P0: V1.1 关联生产批次号下拉从生产计划列表动态生成（与 CreateModal 一致）
  batches: { type: Array, default: () => [] },
  // ✅ 修复 P0: V1.1 适用范围折叠状态（父组件拥有）
  scopeExpanded: { type: Boolean, default: true },
})

const emit = defineEmits([
  'close',
  'submit',
  'update:visible',
  'field-change',
  'update:selectedCrop',
  'scope-toggle',
])

// ==================== V1.1 EditForm 字段 ====================

// ✅ 修复 P0: 关联生产批次号下拉项（V1.1 L72-83 1:1）
// 字段映射：batch.batchCode → plan.batchCode
//                batch.cropName → plan.cropName
//                batch.variety → plan.variety（V2.0 额外有）
const relatedBatchOptions = computed(() => {
  const opts = [{ value: '', label: '不关联' }]
  for (const b of props.batches || []) {
    const code = b.batchCode || b.id
    if (code) {
      const labelCrop = b.cropName || b.variety || ''
      opts.push({ value: code, label: `${code} - ${labelCrop}` })
    }
  }
  return opts
})

// ✅ 修复 P0: V1.1 L85-90 反查选中的 batch 用于详情框显示
const selectedBatch = computed(() => {
  const code = props.form?.relatedBatchCode
  if (!code) return null
  return (props.batches || []).find((b) => (b.batchCode || b.id) === code) || null
})

// ✅ 修复 P0: V1.1 L119 关联批次后锁定
const isLockedByBatch = computed(() => !!props.form?.relatedBatchCode)

// ✅ 修复 P0: V1.1 L129-138 种植模式 value→label 翻译
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

// ==================== 字段级更新（V1.1 1:1） ====================

function handleFieldChange(field, value) {
  emit('field-change', { field, value })
}

// ✅ 修复 P0: V1.1 L93-116 handleRelatedBatchChange 1:1
// 选"不关联"（空 value）→ 清空自动填的字段
// 选具体批次 → 自动填 crop + plantingMode（V2.0 plan 没存 cropCode，所以仅填可用的字段）
function handleRelatedBatchChange(value) {
  if (!value) {
    emit('field-change', { field: 'relatedBatchCode', value: '' })
    emit('field-change', { field: 'crop', value: '' })
    emit('field-change', { field: 'plantingMode', value: '' })
    return
  }
  const batch = (props.batches || []).find((b) => (b.batchCode || b.id) === value)
  if (!batch) {
    emit('field-change', { field: 'relatedBatchCode', value })
    return
  }
  emit('field-change', { field: 'relatedBatchCode', value })
  emit('field-change', { field: 'crop', value: batch.cropName || batch.variety || '' })
  emit('field-change', { field: 'plantingMode', value: batch.plantingMode || '' })
}

// V1.1 L277-288 适用范围 toggle
function toggleScope(scope, checked) {
  const scopes = props.form?.scopes || []
  const next = checked
    ? [...scopes, scope]
    : scopes.filter((s) => s !== scope)
  emit('field-change', { field: 'scopes', value: next })
}

// V1.1 L195-203 作物选择后回填 crop + cropCode
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

// V1.1 L141-161 文件上传
function handleFileUpload() {
  pickAndReadFile({
    accept: '.txt,.md,.docx',
    onLoad: ({ fileName, content }) => {
      emit('field-change', { field: 'content', value: content })
      emit('field-change', { field: 'planDetailFileName', value: fileName })
    },
  })
}

// V1.1 L369 删除按钮：清空 planDetailFileName + content
function handleClearPlanDetail() {
  emit('field-change', { field: 'content', value: '' })
  emit('field-change', { field: 'planDetailFileName', value: '' })
}
</script>

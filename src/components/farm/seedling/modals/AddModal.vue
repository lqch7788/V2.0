<!--
  新增育苗弹窗（完全重写 - 1:1 对齐 V1.1 AddModal.tsx）
  V1.1源文件：src/components/farm/seedling/modals/AddModal.tsx
  使用简单 div 弹窗，避免 el-dialog directive 问题
-->
<template>
  <SimpleModal
    :visible="visible"
    title="新增育苗"
    width="900px"
    :show-footer="false"
    @close="$emit('close')"
  >

    <div class="space-y-6">
      <!-- 繁殖模式选择 -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">
          繁殖模式 <span class="text-red-500">*</span>
          <span class="text-xs text-gray-500 ml-2 font-normal">建档后不可修改</span>
        </h4>
        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="mode in PROPAGATION_MODES"
            :key="mode.value"
            :class="['flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
              formData.propagationMode === mode.value
                ? 'border-indigo-500 bg-indigo-100 ring-2 ring-indigo-200'
                : 'border-gray-300 bg-white hover:border-indigo-300']"
          >
            <input type="radio" :value="mode.value" v-model="formData.propagationMode" class="mt-1" @change="handlePropagationModeChange(mode.value)" />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ mode.label }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ mode.desc }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- 育苗批次号 + 关联生产计划（对齐 V1.1 L687-773） -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">育苗批次号</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">育苗批次号 <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <input v-model="formData.seedlingCode" placeholder="点击生成获取批次号" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm" />
              <button type="button" class="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-1" @click="handleGenerateCode">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                生成
              </button>
            </div>
          </div>
          <!-- 关联生产计划批次号（对齐 V1.1 L719-771） -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关联生产计划批次号</label>
            <select v-model="formData.productionPlanId" @change="handleProductionPlanChange" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
              <option value="">不关联（独立批次）</option>
              <option v-for="plan in filteredProductionPlans" :key="plan.id || plan.batchCode" :value="plan.batchCode">
                [{{ plan.planTypeName || '育苗计划' }}] {{ plan.batchCode }} - {{ plan.variety || plan.cropName }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 关联种源信息（对齐 V1.1 L775-962 Combogrid） -->
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <h3 class="text-sm font-semibold text-purple-900">关联种源信息</h3>
        </div>
        <p class="text-xs text-gray-500 mb-3">种源必须先在种源管理中录入</p>
        <div class="grid grid-cols-2 gap-4">
          <!-- 关联种源 Combogrid（对齐 V1.1 L783-900） -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">关联种源 <span class="text-red-500">*</span></label>
            <SeedSourceCombogrid
              v-model="formData.sourceId"
              :sources="filteredSeedSources"
              placeholder="搜索种源批号或作物名称..."
              :variety-filter="productionPlanVarietyFilterFromPlan"
              empty-text="未找到匹配的种源"
              navigator-target="/crop/seed-source"
              @select="handleSourceSelect"
            />
          </div>
          <!-- 来源类型（自动带入） -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">来源类型</label>
            <input :value="formData.sourceType || '请先选择种源'" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
          </div>
          <!-- 供应商（自动带入） -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <input :value="formData.supplierName || '请先选择种源'" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
          </div>
          <!-- 种源形态（自动带入，2026-07-23） -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">种源形态</label>
            <input :value="formatSeedForm(formData.seedForm) || '请先选择种源'" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
          </div>
          <!-- 作物品种（只读自动带入） -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">作物品种 <span class="text-red-500">*</span></label>
            <div class="px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg text-sm flex items-center min-h-[42px]">
              <span v-if="formData.cropVariety || formData.cropName">{{ formData.cropVariety || formData.cropName }}</span>
              <span v-else class="text-gray-400">请先选择种源</span>
            </div>
          </div>
          <!-- 品种路径 4段式（对齐 V1.1 L938-960） -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">品种路径</label>
            <div class="flex items-center gap-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm min-h-[42px] flex-wrap">
              <template v-if="fullVarietyPath">
                <span class="text-gray-400">{{ fullVarietyPath.categoryName }}</span>
                <span class="text-gray-300">-</span>
                <span class="text-gray-700">{{ fullVarietyPath.typeName }}</span>
                <span class="text-gray-300">-</span>
                <span class="text-gray-700">{{ fullVarietyPath.varietyName }}</span>
                <template v-if="fullVarietyPath.subVariety1Name">
                  <span class="text-gray-300">-</span>
                  <span class="text-gray-900 font-medium">{{ fullVarietyPath.subVariety1Name }}</span>
                </template>
              </template>
              <span v-else class="text-gray-400">请先选择种源</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 场地与计划 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">育苗区域 <span class="text-red-500">*</span></label>
          <select v-model="formData.siteId" @change="handleSiteChange" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="">请选择</option>
            <option v-for="site in sites" :key="site.value" :value="site.value">{{ site.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">育苗方式 <span class="text-red-500">*</span></label>
          <select v-model="formData.seedlingType" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="">请选择</option>
            <option v-for="type in seedlingTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <!-- 其他方式说明（对齐 V1.1 AddModal.tsx L1244-1257，当 seedlingType === '其他' 时显示） -->
        <div v-if="formData.seedlingType === '其他'" class="col-span-2">
          <label class="block text-sm font-medium text-gray-900 mb-1">其他方式说明 <span class="text-red-500">*</span></label>
          <input v-model="formData.seedlingTypeOther" placeholder="请输入具体的育苗方式" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 2026-07-23：育苗后形态（必填，对齐 V1.1 AddModal.tsx L1224-1241） -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-900 mb-1">
            育苗后形态 <span class="text-red-500">*</span>
            <span class="text-xs text-gray-500 ml-1 font-normal">描述这次育苗产出的种苗形态（花朵/裸根/插穗/...）</span>
          </label>
          <select v-model="formData.seedlingForm" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="">请选择（必填）</option>
            <option v-for="opt in SEEDLING_FORM_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">开始日期 <span class="text-red-500">*</span></label>
          <input v-model="formData.startDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">预计结束日期</label>
          <input v-model="formData.expectedEndDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 育苗周期（自动计算，对齐 V1.1 L1294-1303） -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">育苗周期（天）</label>
          <div class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50">
            <span v-if="seedlingCycle > 0">{{ seedlingCycle }} 天</span>
            <span v-else class="text-gray-400">请选择开始日期和预计结束日期</span>
          </div>
        </div>
      </div>

      <!-- 数量与品质 -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-blue-900 mb-3">数量与品质</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">目标成苗率 (%)</label>
            <input v-model.number="formData.targetSurvivalRate" type="number" min="0" max="100" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div v-if="formData.propagationMode === 'one_to_many'">
            <label class="block text-sm font-medium text-gray-900 mb-1">扩繁倍数</label>
            <select v-model.number="formData.propagationMultiple" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
              <option v-for="m in PROPAGATION_MULTIPLES" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div v-if="formData.propagationMode === 'one_to_many' && formData.propagationMultiple === 0">
            <label class="block text-sm font-medium text-gray-900 mb-1">自定义倍数</label>
            <input v-model.number="formData.customMultiple" type="number" min="0" step="0.1" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <!-- 理论产量（自动计算显示，对齐 V1.1 L1120-1131） -->
          <div v-if="formData.propagationMode === 'one_to_many'">
            <label class="block text-sm font-medium text-gray-700 mb-1">理论产量（自动计算）</label>
            <div class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50">
              <span v-if="theoreticalYield > 0">{{ theoreticalYield.toLocaleString() }}</span>
              <span v-else class="text-gray-400">母株数量 × 扩繁倍数</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">母株数量 × 扩繁倍数</p>
          </div>
          <!-- 数量上限校验（对齐 V1.1 L252-258 红框 + 提示） -->
          <div v-if="formData.propagationMode === 'one_to_one'">
            <label class="block text-sm font-medium text-gray-900 mb-1">初始数量 <span class="text-red-500">*</span></label>
            <input
              v-model.number="formData.initialCount"
              type="number"
              min="0"
              :class="['w-full px-3 py-2 border rounded-lg text-sm', isInitialCountExceeded ? 'border-red-500 ring-1 ring-red-300' : 'border-gray-400']"
            />
            <p v-if="isInitialCountExceeded" class="text-xs text-red-500 mt-1">超过种源可用数量（{{ sourceAvailableCount }}）</p>
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-900 mb-1">母株数量 <span class="text-red-500">*</span></label>
            <input
              v-model.number="formData.motherPlantCount"
              type="number"
              min="0"
              :class="['w-full px-3 py-2 border rounded-lg text-sm', isMotherCountExceeded ? 'border-red-500 ring-1 ring-red-300' : 'border-gray-400']"
            />
            <p v-if="isMotherCountExceeded" class="text-xs text-red-500 mt-1">超过种源可用数量（{{ sourceAvailableCount }}）</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">单位</label>
            <select v-model="formData.unit" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
              <option value="株">株</option>
              <option value="粒">粒</option>
              <option value="颗">颗</option>
              <option value="盆">盆</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">负责人</label>
            <select v-model="formData.chargePerson" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
              <option value="">请选择负责人</option>
              <option v-for="op in OPERATORS" :key="op" :value="op">{{ op }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">目标成苗数量</label>
            <input v-model.number="formData.targetSurvivalCount" type="number" min="0" placeholder="自动计算" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">育苗工时（小时）</label>
            <input v-model.number="formData.workHours" type="number" min="0" step="0.5" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
            <textarea v-model="formData.remarks" rows="2" placeholder="请输入备注信息" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      <!-- 图片上传（对齐 V1.1 AddModal.tsx L1328-1380） -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">图片上传</h3>
        <div class="border-2 border-dashed border-gray-400 rounded-lg p-4">
          <!-- 已上传图片预览 -->
          <div v-if="pictures.length > 0" class="flex flex-wrap gap-2 mb-3">
            <div v-for="(pic, index) in pictures" :key="index" class="relative group">
              <img :src="pic" :alt="`预览${index + 1}`" class="w-20 h-20 object-cover rounded-lg border border-gray-200" />
              <button
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removePicture(index)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <!-- 上传按钮 -->
          <label class="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 rounded-lg py-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span class="text-sm text-gray-500 mt-2">点击上传图片</span>
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handlePictureUpload"
            />
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button type="button" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" @click="$emit('close')">取消</button>
        <button type="button" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </template>
  </SimpleModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import SimpleModal from '@/components/common/SimpleModal.vue'
import SeedSourceCombogrid from '@/components/farm/seedling/components/SeedSourceCombogrid.vue'
import { useSeedlingStore } from '@/stores/modules/seedling'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { generateSeedlingCodeByDate } from '@/services/apiSeedlingService'
import { addSeedlingWithDeduct } from '@/services/apiSeedlingService'
import * as cropVarietyService from '@/services/cropVarietyService'
import { SEEDLING_FORM_OPTIONS } from '@/constants/seedFormDict'
import { todayLocal } from '@/lib/dateUtils'
import { OPERATORS } from '@/views/material/utils/materialReturnConfig'

const props = defineProps({
  visible: Boolean,
  seedSources: { type: Array, default: () => [] },
  cropVarietyOptions: { type: Array, default: () => [] },
  seedlingTypes: { type: Array, default: () => [] },
  sites: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'success'])

const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()
const productionPlanStore = useProductionPlanStore()
const submitting = ref(false)

// 来源类型映射（对齐 V1.1 AddModal.tsx L347-356 sourceTypeLabels）
const SOURCE_TYPE_LABELS = {
  seed: '种子', seedling: '种苗', cutting: '扦插苗', grafting: '嫁接苗',
  tissue_culture: '组培苗', split: '分株苗', bulb: '种球', other: '其他'
}
const SEED_FORM_OPTIONS_ZH = ['种子','种苗','实生苗','扦插苗','嫁接苗','组培苗','分株苗','种球','球根','块根','块茎','鳞茎','穗条','枝条','叶片','花朵','果实','整株','其他']

// 种源形态兜底翻译（对齐 V1.1 AddModal.tsx L53-57 formatSeedFormDisplay）
function formatSeedForm(sf) {
  if (!sf) return ''
  if (SEED_FORM_OPTIONS_ZH.includes(sf)) return sf
  return SOURCE_TYPE_LABELS[sf] || sf
}

const PROPAGATION_MODES = [
  { value: 'one_to_one', label: '1:1 育苗', desc: '一对一（种子 / 嫁接 / 单种球）' },
  { value: 'one_to_many', label: '1:多 育苗', desc: '母株+子苗（匍匐茎 / 组培 / 扦插 / 分株 / 块茎 / 枝条）' }
]

const PROPAGATION_MULTIPLES = [
  { value: 1, label: '1 倍' },
  { value: 2, label: '2 倍' },
  { value: 3, label: '3 倍' },
  { value: 5, label: '5 倍' },
  { value: 10, label: '10 倍' },
  { value: 0, label: '自定义' }
]

const INITIAL_FORM = {
  sourceId: '', sourceCode: '', sourceType: '', supplierName: '', seedForm: '',
  selectedCropCode: '', cropName: '', cropVariety: '',
  seedlingType: '', seedlingTypeOther: '', unit: '株', siteId: '', siteName: '',
  seedlingCode: '', productionPlanId: '', startDate: '', expectedEndDate: '',
  initialCount: 0, targetSurvivalRate: 90, chargePerson: '', remarks: '',
  calculateMode: 'single', motherPlantCount: 0, propagationMultiple: 0,
  customMultiple: 0, theoreticalYield: 0, workHours: 0,
  isSupplementary: false, supplementaryReason: '',
  propagationMode: 'one_to_one',
  seedlingForm: ''  // 2026-07-23 必填（V1.1 L1224-1241）
}

const formData = ref({ ...INITIAL_FORM })
const filteredSeedSources = ref([])
const pictures = ref([])  // 2026-07-23 图片上传

const cropOptions = computed(() => {
  cropVarietyService.initVarieties()
  return cropVarietyService.getVarietyOptions()
})

// 生产计划 store（对齐 productionPlan.js: plans 字段 + fetchPlans 方法）
const productionPlans = computed(() => productionPlanStore.plans || [])

// 过滤可用的生产计划（仅显示育苗计划类型），对齐 V1.1 L297-302
const filteredProductionPlans = computed(() => {
  return productionPlans.value.filter((batch) =>
    (batch.batchStatus === 'published' || batch.batchStatus === 'in_progress' || batch.status === 'published' || batch.status === 'in_progress') &&
    batch.planType === 'SEEDLING'
  )
})

// 联动过滤 — 选了种源后只显示同品种(variety)的计划，对齐 V1.1 L304-318
const productionPlanVarietyFilterFromPlan = computed(() => {
  if (!formData.value.productionPlanId) return ''
  const plan = filteredProductionPlans.value.find(p => p.batchCode === formData.value.productionPlanId)
  return plan?.variety || ''
})

// 完整品种路径（对齐 V1.1 L194-205 4段式 category/type/variety/subVariety1）
const fullVarietyPath = computed(() => {
  if (!formData.value.selectedCropCode) return null
  const variety = cropVarietyService.getVarietyByCode?.(formData.value.selectedCropCode)
  if (!variety) return null
  return {
    categoryName: variety.categoryName || '',
    typeName: variety.typeName || '',
    varietyName: variety.varietyName || '',
    subVariety1Name: variety.subVariety1Name || ''
  }
})

// 育苗周期（自动计算，对齐 V1.1 L261-269）
const seedlingCycle = computed(() => {
  if (formData.value.startDate && formData.value.expectedEndDate) {
    const start = new Date(formData.value.startDate)
    const end = new Date(formData.value.expectedEndDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }
  return 0
})

// 选中种源（用于上限校验，对齐 V1.1 L245-258）
const selectedSource = computed(() => {
  return filteredSeedSources.value.find(s => s.id === formData.value.sourceId) || null
})
const sourceAvailableCount = computed(() => selectedSource.value?.availableCount ?? 0)

// 数量上限校验（对齐 V1.1 L252-258）
const isInitialCountExceeded = computed(() =>
  formData.value.propagationMode === 'one_to_one' &&
  formData.value.initialCount > 0 &&
  formData.value.initialCount > sourceAvailableCount.value
)
const isMotherCountExceeded = computed(() =>
  formData.value.propagationMode === 'one_to_many' &&
  formData.value.motherPlantCount > 0 &&
  formData.value.motherPlantCount > sourceAvailableCount.value
)

// 理论产量（自动计算，对齐 V1.1 L223-235）
const theoreticalYield = computed(() => {
  if (formData.value.propagationMode === 'one_to_many' && formData.value.motherPlantCount) {
    const multiple = formData.value.propagationMultiple === 0
      ? formData.value.customMultiple
      : formData.value.propagationMultiple
    if (multiple > 0) return formData.value.motherPlantCount * multiple
  }
  return 0
})

// 目标成苗数量（自动计算，对齐 V1.1 L207-219）
const targetSurvivalCount = computed(() => {
  if (formData.value.propagationMode === 'one_to_many') {
    if (theoreticalYield.value && formData.value.targetSurvivalRate) {
      return Math.round(theoreticalYield.value * (formData.value.targetSurvivalRate / 100))
    }
  } else {
    if (formData.value.initialCount && formData.value.targetSurvivalRate) {
      return Math.round(formData.value.initialCount * (formData.value.targetSurvivalRate / 100))
    }
  }
  return 0
})

// 弹窗打开时重置
watch(() => props.visible, (val) => {
  if (val) {
    formData.value = { ...INITIAL_FORM, startDate: todayLocal() }
    filteredSeedSources.value = props.seedSources || []
    pictures.value = []
  }
})

// 生成批次号（调后端 API）
const handleGenerateCode = async () => {
  const code = await generateSeedlingCodeByDate(new Date())
  formData.value.seedlingCode = code || ''
}

// 选择种源（保留原 handleSourceChange 以兼容 select）
const handleSourceChange = () => {
  const source = filteredSeedSources.value.find(s => s.id === formData.value.sourceId)
  if (source) {
    handleSourceSelect(source)
  }
}

// Combogrid 选择回调（对齐 V1.1 AddModal.tsx L547-586 handleSourceChange）
function handleSourceSelect(source) {
  if (!source || !source.id) {
    // 清空
    formData.value.sourceId = ''
    formData.value.sourceCode = ''
    formData.value.sourceType = ''
    formData.value.supplierName = ''
    formData.value.seedForm = ''
    formData.value.selectedCropCode = ''
    formData.value.cropName = ''
    formData.value.cropVariety = ''
    return
  }
  formData.value.sourceCode = source.seedCode || ''
  formData.value.sourceType = source.sourceType ? (SOURCE_TYPE_LABELS[source.sourceType] || source.sourceType) : ''
  formData.value.supplierName = (source.supplierName && source.supplierName.trim()) || '无'
  formData.value.seedForm = source.seedForm || ''
  formData.value.selectedCropCode = source.cropCode || ''
  formData.value.cropName = source.cropName || ''
  formData.value.cropVariety = source.cropVariety || ''
}

// 选择作物（保留原 handleCropChange）
const handleCropChange = () => {
  const crop = cropOptions.value.find(c => c.cropCode === formData.value.cropCode)
  if (crop) {
    formData.value.cropName = crop.cropName
    formData.value.cropVariety = ''
  }
}

// 选择生产计划（对齐 V1.1 L727-754 一致性校验）
function handleProductionPlanChange() {
  // V1.1 一致性校验：选了生产计划后若已选种源不匹配则清空
  if (formData.value.productionPlanId && formData.value.sourceId) {
    const plan = filteredProductionPlans.value.find(p => p.batchCode === formData.value.productionPlanId)
    if (plan) {
      const source = filteredSeedSources.value.find(s => s.id === formData.value.sourceId)
      if (source && source.cropName !== plan.variety) {
        ElMessage.warning(`已选种源 [${source.seedCode}] 作物为 ${source.cropName}，与新生产计划 [${plan.batchCode}] 不匹配，已自动清空关联种源。`)
        formData.value.sourceId = ''
        formData.value.sourceCode = ''
        formData.value.sourceType = ''
        formData.value.supplierName = ''
        formData.value.seedForm = ''
        formData.value.selectedCropCode = ''
        formData.value.cropName = ''
        formData.value.cropVariety = ''
      }
    }
  }
}

// 选择场地
function handleSiteChange() {
  const site = props.sites.find(s => s.value === formData.value.siteId)
  formData.value.siteName = site?.label || ''
}

// 繁殖模式切换
function handlePropagationModeChange(mode) {
  formData.value.propagationMode = mode
  formData.value.calculateMode = mode === 'one_to_many' ? 'propagation' : 'single'
  formData.value.initialCount = 0
  formData.value.motherPlantCount = 0
}

// 图片上传（对齐 V1.1 AddModal.tsx L1358-1376）
function handlePictureUpload(event) {
  const files = event.target.files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (result) pictures.value = [...pictures.value, result]
    }
    reader.readAsDataURL(file)
  })
  // 允许重复选择同一文件
  event.target.value = ''
}

function removePicture(index) {
  pictures.value = pictures.value.filter((_, i) => i !== index)
}

// 提交
const handleSubmit = async () => {
  if (!formData.value.sourceId) { ElMessage.warning('请选择关联种源'); return }
  if (!formData.value.cropCode) { ElMessage.warning('请选择作物品种'); return }
  if (!formData.value.siteId) { ElMessage.warning('请选择育苗区域'); return }
  if (!formData.value.seedlingCode) { ElMessage.warning('请生成育苗批次号'); return }
  if (!formData.value.startDate) { ElMessage.warning('请选择开始日期'); return }
  // 2026-07-23：育苗后形态必填（对齐 V1.1 L376-379）
  if (!formData.value.seedlingForm) { ElMessage.warning('请选择育苗后形态'); return }
  // 对齐 V1.1 L416-419：其他方式必填
  if (formData.value.seedlingType === '其他' && !formData.value.seedlingTypeOther?.trim()) {
    ElMessage.warning('请输入其他育苗方式的具体描述')
    return
  }

  // finalSeedlingType 转换（对齐 V1.1 L412-419）
  const finalSeedlingType = formData.value.seedlingType === '其他'
    ? formData.value.seedlingTypeOther
    : formData.value.seedlingType

  if (formData.value.propagationMode === 'one_to_one') {
    if (!formData.value.initialCount || formData.value.initialCount <= 0) {
      ElMessage.warning('请输入初始数量'); return
    }
    // 数量上限校验（对齐 V1.1 L387-390）
    if (formData.value.sourceId && formData.value.initialCount > sourceAvailableCount.value) {
      ElMessage.warning(`初始数量 ${formData.value.initialCount} 超过种源可用数量 ${sourceAvailableCount.value}，请调整`)
      return
    }
  } else {
    if (!formData.value.motherPlantCount || formData.value.motherPlantCount <= 0) {
      ElMessage.warning('请输入母株数量'); return
    }
    // 数量上限校验（对齐 V1.1 L398-402）
    if (formData.value.sourceId && formData.value.motherPlantCount > sourceAvailableCount.value) {
      ElMessage.warning(`母株数量 ${formData.value.motherPlantCount} 超过种源可用数量 ${sourceAvailableCount.value}，请调整`)
      return
    }
    if (formData.value.propagationMultiple === 0 && (!formData.value.customMultiple || formData.value.customMultiple <= 0)) {
      ElMessage.warning('请输入自定义倍数'); return
    }
  }

  submitting.value = true
  try {
    const actualMultiple = formData.value.calculateMode === 'propagation'
      ? (formData.value.propagationMultiple === 0 ? formData.value.customMultiple : formData.value.propagationMultiple)
      : undefined

    const result = await addSeedlingWithDeduct({
      sourceId: formData.value.sourceId,
      count: formData.value.propagationMode === 'one_to_many' ? formData.value.motherPlantCount : formData.value.initialCount,
      seedling: {
        seedlingCode: formData.value.seedlingCode,
        sourceId: formData.value.sourceId,
        sourceCode: formData.value.sourceCode,
        sourceType: formData.value.sourceType || undefined,
        supplierName: formData.value.supplierName || undefined,
        seedForm: formData.value.seedForm || undefined,
        productionPlanCode: formData.value.productionPlanId || undefined,
        cropCode: formData.value.cropCode,
        cropName: formData.value.cropName,
        cropVariety: formData.value.cropVariety,
        seedlingType: finalSeedlingType,
        seedlingTypeOther: formData.value.seedlingTypeOther || undefined,
        siteId: formData.value.siteId,
        siteName: formData.value.siteName,
        startDate: formData.value.startDate,
        expectedEndDate: formData.value.expectedEndDate || undefined,
        initialCount: formData.value.propagationMode === 'one_to_one' ? formData.value.initialCount : undefined,
        motherPlantCount: formData.value.propagationMode === 'one_to_many' ? formData.value.motherPlantCount : undefined,
        propagationMode: formData.value.propagationMode,
        propagationMultiple: formData.value.propagationMode === 'one_to_many' ? formData.value.propagationMultiple : undefined,
        customMultiple: formData.value.propagationMode === 'one_to_many' && formData.value.propagationMultiple === 0 ? formData.value.customMultiple : undefined,
        targetSurvivalRate: formData.value.targetSurvivalRate ?? undefined,
        targetSurvivalCount: formData.value.targetSurvivalCount ?? undefined,
        chargePerson: formData.value.chargePerson || undefined,
        unit: formData.value.unit || '株',
        seedlingForm: formData.value.seedlingForm || undefined,
        workHours: formData.value.workHours || undefined,
        remarks: formData.value.remarks || undefined,
        pictures: pictures.value || []  // 图片上传
      }
    })

    if (result) {
      ElMessage.success('新增育苗成功')
      emit('success')
    } else {
      ElMessage.error('新增育苗失败，请重试')
    }
  } catch (error) {
    console.error('[AddModal] submit error:', error)
    ElMessage.error('新增育苗失败：' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await seedSourceStore.loadItems()
  filteredSeedSources.value = seedSourceStore.items
  // 加载生产计划批次（V1.1 L284-287 useEffect 加载 storePlans）
  if ((productionPlanStore.plans?.length || 0) === 0 && productionPlanStore.fetchPlans) {
    await productionPlanStore.fetchPlans()
  }
})
</script>

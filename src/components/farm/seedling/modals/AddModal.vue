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

      <!-- 育苗批次号 -->
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
        </div>
      </div>

      <!-- 关联种源信息 -->
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <h3 class="text-sm font-semibold text-purple-900">关联种源信息</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">关联种源 <span class="text-red-500">*</span></label>
            <select v-model="formData.sourceId" @change="handleSourceChange" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
              <option value="">请选择（搜索种源批号或作物名称）</option>
              <option
                v-for="source in filteredSeedSources"
                :key="source.id"
                :value="source.id"
                :disabled="source.propagationStatus === 'failed' || (source.availableCount || 0) <= 0"
              >
                {{ source.seedCode }} - {{ source.cropName }}（采购 {{ source.quantity || 0 }}{{ source.unit || '' }} / 剩余 {{ source.availableCount || 0 }}{{ source.unit || '' }}）{{ source.propagationStatus === 'failed' ? ' [已失败]' : '' }}
              </option>
            </select>
            <p v-if="filteredSeedSources.length === 0" class="mt-1 text-xs text-gray-500">请前往「种源管理」添加种源后，再返回此处选择。</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">来源类型</label>
            <input :model-value="formData.sourceType || '请先选择种源'" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <input :model-value="formData.supplierName || '请先选择种源'" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">作物品种 <span class="text-red-500">*</span></label>
            <select v-model="formData.cropCode" @change="handleCropChange" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
              <option value="">请选择作物品种</option>
              <option v-for="crop in cropOptions" :key="crop.cropCode" :value="crop.cropCode">{{ crop.cropName }}</option>
            </select>
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
      </div>

      <!-- 数量与品质 -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-blue-900 mb-3">数量与品质</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="formData.propagationMode === 'one_to_one'">
            <label class="block text-sm font-medium text-gray-900 mb-1">初始数量 <span class="text-red-500">*</span></label>
            <input v-model.number="formData.initialCount" type="number" min="0" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div v-if="formData.propagationMode === 'one_to_many'">
            <label class="block text-sm font-medium text-gray-900 mb-1">母株数量 <span class="text-red-500">*</span></label>
            <input v-model.number="formData.motherPlantCount" type="number" min="0" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
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
            <input v-model="formData.chargePerson" placeholder="请输入" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
            <textarea v-model="formData.remarks" rows="2" placeholder="请输入备注信息" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
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
import { useSeedlingStore } from '@/stores/modules/seedling'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { generateSeedlingCodeByDate } from '@/services/apiSeedlingService'
import { addSeedlingWithDeduct } from '@/services/apiSeedlingService'
import * as cropVarietyService from '@/services/cropVarietyService'
import { todayLocal } from '@/lib/dateUtils'

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
const submitting = ref(false)

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
  sourceId: '', sourceCode: '', sourceType: '', supplierName: '',
  selectedCropCode: '', cropName: '', cropVariety: '',
  seedlingType: '', unit: '株', siteId: '', siteName: '',
  seedlingCode: '', productionPlanId: '', startDate: '', expectedEndDate: '',
  initialCount: 0, targetSurvivalRate: 90, chargePerson: '', remarks: '',
  calculateMode: 'single', motherPlantCount: 0, propagationMultiple: 0,
  customMultiple: 0, theoreticalYield: 0, workHours: 0,
  isSupplementary: false, supplementaryReason: '',
  propagationMode: 'one_to_one'
}

const formData = ref({ ...INITIAL_FORM })
const filteredSeedSources = ref([])

const cropOptions = computed(() => {
  cropVarietyService.initVarieties()
  return cropVarietyService.getVarietyOptions()
})

// 弹窗打开时重置
watch(() => props.visible, (val) => {
  if (val) {
    formData.value = { ...INITIAL_FORM, startDate: todayLocal() }
    filteredSeedSources.value = props.seedSources || []
  }
})

// 生成批次号（调后端 API）
const handleGenerateCode = async () => {
  const code = await generateSeedlingCodeByDate(new Date())
  formData.value.seedlingCode = code || ''
}

// 选择种源
const handleSourceChange = () => {
  const source = filteredSeedSources.value.find(s => s.id === formData.value.sourceId)
  if (source) {
    formData.value.sourceCode = source.seedCode || ''
    formData.value.sourceType = source.sourceType || ''
    formData.value.supplierName = source.supplierName || '无'
    formData.value.cropCode = source.cropCode || ''
    formData.value.cropName = source.cropName || ''
    formData.value.cropVariety = source.cropVariety || ''
  }
}

// 选择作物
const handleCropChange = () => {
  const crop = cropOptions.value.find(c => c.cropCode === formData.value.cropCode)
  if (crop) {
    formData.value.cropName = crop.cropName
    formData.value.cropVariety = ''
  }
}

// 选择场地
const handleSiteChange = () => {
  const site = props.sites.find(s => s.value === formData.value.siteId)
  formData.value.siteName = site?.label || ''
}

// 繁殖模式切换
const handlePropagationModeChange = (mode) => {
  formData.value.propagationMode = mode
  formData.value.calculateMode = mode === 'one_to_many' ? 'propagation' : 'single'
  formData.value.initialCount = 0
  formData.value.motherPlantCount = 0
}

// 提交
const handleSubmit = async () => {
  if (!formData.value.sourceId) { ElMessage.warning('请选择关联种源'); return }
  if (!formData.value.cropCode) { ElMessage.warning('请选择作物品种'); return }
  if (!formData.value.siteId) { ElMessage.warning('请选择育苗区域'); return }
  if (!formData.value.seedlingCode) { ElMessage.warning('请生成育苗批次号'); return }
  if (!formData.value.startDate) { ElMessage.warning('请选择开始日期'); return }

  if (formData.value.propagationMode === 'one_to_one') {
    if (!formData.value.initialCount || formData.value.initialCount <= 0) {
      ElMessage.warning('请输入初始数量'); return
    }
  } else {
    if (!formData.value.motherPlantCount || formData.value.motherPlantCount <= 0) {
      ElMessage.warning('请输入母株数量'); return
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
        cropCode: formData.value.cropCode,
        cropName: formData.value.cropName,
        cropVariety: formData.value.cropVariety,
        seedlingType: formData.value.seedlingType,
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
        chargePerson: formData.value.chargePerson || undefined,
        unit: formData.value.unit || '株',
        remarks: formData.value.remarks || undefined
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
})
</script>

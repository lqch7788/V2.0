<!--
  育苗无性繁殖记录弹窗（完整重写 - 对齐 V1.1 SeedlingPropagationModal.tsx）
  V1.1源文件：src/components/farm/seedling/modals/SeedlingPropagationModal.tsx
  功能：添加/编辑无性繁殖记录 + 历史记录列表 + XLSX 导出 + 只读模式 + 繁殖系数派生显示
-->
<template>
  <SimpleModal
    :visible="visible"
    :title="`无性繁殖记录 - ${record?.seedlingCode || ''}${readOnly ? '（只读）' : ''}`"
    width="1100px"
    :show-footer="true"
    :submit-text="readOnly ? '关闭' : (editingId ? '保存修改' : '添加记录')"
    :submitting="submitting"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="space-y-6">
      <!-- 只读模式横幅 -->
      <div v-if="readOnly" class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-600 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="text-sm text-gray-700">该育苗已结束，无性繁殖记录处于<strong>只读模式</strong>（可查看、导出）</span>
      </div>

      <!-- 添加 / 编辑表单 -->
      <div v-if="!readOnly" class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
          {{ editingId ? '编辑无性繁殖记录' : '添加无性繁殖记录' }}
          <button v-if="editingId" type="button" class="ml-auto text-gray-500 text-xs hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200" @click="handleCancelEdit">
            取消编辑
          </button>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Row 1：日期 / 操作人 / 操作类型 / 世代 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">记录日期 <span class="text-red-500">*</span></label>
            <input v-model="form.recordDate" type="date" :class="deepInputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">操作人</label>
            <select v-model="form.operator" :class="deepInputClass">
              <option value="">请选择操作人</option>
              <option v-for="op in OPERATORS" :key="op" :value="op">{{ op }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">操作类型 <span class="text-red-500">*</span></label>
            <select v-model="form.operationType" :class="deepInputClass">
              <option v-for="t in ASEXUAL_OPERATION_TYPES" :key="t" :value="t">{{ OPERATION_TYPE_LABELS[t] || t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">世代</label>
            <select v-model="form.generation" :class="deepInputClass">
              <option value="">请选择世代（如 F1/BC1/G1）</option>
              <optgroup v-for="g in generationGroups" :key="g" :label="g">
                <option v-for="o in generationOptionsByGroup[g]" :key="o.value" :value="o.value">{{ o.label }}</option>
              </optgroup>
            </select>
          </div>

          <!-- Row 2：母株编码 / 繁殖方式 / 温度 / 湿度 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">母株编码 <span class="text-red-500">*</span></label>
            <input v-model="form.motherPlantCode" placeholder="母株编号（单亲来源：本株是克隆源）" :class="deepInputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">繁殖方式 <span class="text-red-500">*</span></label>
            <select v-model="form.propagationMethod" :class="deepInputClass">
              <option :value="undefined">请选择繁殖方式</option>
              <option v-for="(label, key) in PROPAGATION_METHOD_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">温度（℃）</label>
            <input v-model.number="form.temperature" type="number" step="0.1" placeholder="环境温度" :class="deepInputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">湿度（%）</label>
            <input v-model.number="form.humidity" type="number" step="0.1" placeholder="环境湿度" :class="deepInputClass" />
          </div>

          <!-- Row 3：移栽位置 / 子苗状态 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">移栽位置</label>
            <input v-model="form.transplantPosition" placeholder="如 温室B区 / 3号苗床" :class="deepInputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">子苗状态</label>
            <select v-model="form.seedlingStatus" :class="deepInputClass">
              <option value="healthy">健康</option>
              <option value="weak">弱苗</option>
              <option value="diseased">病害</option>
            </select>
          </div>

          <!-- Row 4：目标性状（多选 chip） -->
          <div class="col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">目标性状（多选）</label>
            <div class="flex flex-wrap gap-2 mt-1">
              <label
                v-for="trait in TARGET_TRAIT_OPTIONS"
                :key="trait"
                :title="`目标性状：${trait}`"
                :class="['flex items-center gap-1 px-3 py-1.5 rounded border cursor-pointer text-sm transition-colors',
                  (form.targetTraits || []).includes(trait)
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400']"
              >
                <input type="checkbox" class="w-3.5 h-3.5" :checked="(form.targetTraits || []).includes(trait)" @change="toggleTrait(trait, $event.target.checked)" />
                {{ trait }}
              </label>
            </div>
          </div>

          <!-- Row 5：接种数 / 成活数 / 繁殖系数（派生） -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" title="接种的插穗/接芽/外植体/球茎等数量">接种数（个）</label>
            <input v-model.number="form.inoculationCount" type="number" min="0" placeholder="0" :title="`接种的插穗/接芽/外植体/球茎等数量`" :class="deepInputClass" />
            <div class="mt-1 text-xs text-gray-500 leading-relaxed">
              接种的插穗 / 接芽 / 外植体 / 球茎等数量
              <span class="ml-1 text-gray-400">（繁殖系数的基数）</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" title="实际成活/生根/萌芽的数量">成活数（个）</label>
            <input v-model.number="form.survivalCountAsexual" type="number" min="0" placeholder="0" :title="`实际成活/生根/萌芽的数量`" :class="deepInputClass" />
            <div class="mt-1 text-xs text-gray-500 leading-relaxed">
              实际生根 / 成活 / 萌芽的苗数
              <span class="ml-1 text-gray-400">（繁殖系数 = 成活数 ÷ 接种数）</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" title="繁殖系数 = 成活数 ÷ 接种数">繁殖系数（派生）</label>
            <div
              :class="['px-4 py-3 border border-gray-300 rounded-lg text-sm flex items-center',
                rate !== null ? 'bg-emerald-50 text-emerald-700 font-medium' : 'bg-gray-50 text-gray-400']"
              :title="`繁殖系数 = 成活数 ÷ 接种数 = ${form.survivalCountAsexual ?? 0} ÷ ${form.inoculationCount ?? 0}`"
            >
              <span v-if="rate === null">— （需先填接种数）</span>
              <span v-else :class="getRateColor(rate, 'asexual')">
                {{ rate.toFixed(1) }}%
                <span class="ml-2 text-xs text-gray-500 font-normal">
                  ({{ form.survivalCountAsexual ?? 0 }} / {{ form.inoculationCount ?? 0 }})
                </span>
              </span>
            </div>
            <div class="mt-1 text-xs text-gray-500 leading-relaxed">
              公式：繁殖系数 = 成活数 ÷ 接种数 × 100%
              <span class="ml-1 text-gray-400">（≥ 80% 优良，50-80% 一般，&lt; 50% 偏低）</span>
            </div>
          </div>

          <!-- Row 6：备注 -->
          <div class="col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea v-model="form.remarks" rows="2" placeholder="目标性状、过程记录、异常情况等" :class="deepInputClass" />
          </div>
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div>
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
          <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.3 3.5"/><path d="M16.7 17.2c-.4-2.2-.4-4.7.4-7.1 1.6-1.6 4.7-2.4 7-2.1"/></svg>
            历史记录（{{ records.length }} 条）
          </h4>
          <button type="button" :disabled="records.length === 0" class="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" @click="handleExport">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导出
          </button>
        </div>
        <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
        <div v-else-if="records.length === 0" class="text-center py-8 text-gray-500">暂无记录</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-emerald-500 text-white">
              <tr>
                <th class="px-2 py-2 text-left">日期</th>
                <th class="px-2 py-2 text-left">操作类型</th>
                <th class="px-2 py-2 text-left">世代</th>
                <th class="px-2 py-2 text-left">母株编码</th>
                <th class="px-2 py-2 text-left">繁殖方式</th>
                <th class="px-2 py-2 text-left">接种数</th>
                <th class="px-2 py-2 text-left">成活数</th>
                <th class="px-2 py-2 text-left">繁殖系数</th>
                <th class="px-2 py-2 text-left">目标性状</th>
                <th class="px-2 py-2 text-left">子苗状态</th>
                <th class="px-2 py-2 text-left">移栽位置</th>
                <th class="px-2 py-2 text-left">操作人</th>
                <th class="px-2 py-2 text-left">备注</th>
                <th v-if="!readOnly" class="px-2 py-2 text-center w-20">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="r in records" :key="r.id" class="hover:bg-gray-50">
                <td class="px-2 py-1.5 whitespace-nowrap">{{ r.recordDate }}</td>
                <td class="px-2 py-1.5">{{ OPERATION_TYPE_LABELS[r.operationType] || r.operationType || '-' }}</td>
                <td class="px-2 py-1.5">{{ r.generation || '-' }}</td>
                <td class="px-2 py-1.5 font-mono text-emerald-700">{{ r.motherPlantCode || '-' }}</td>
                <td class="px-2 py-1.5">{{ r.propagationMethod ? (PROPAGATION_METHOD_LABELS[r.propagationMethod] || r.propagationMethod) : '-' }}</td>
                <td class="px-2 py-1.5">{{ r.inoculationCount || '-' }}</td>
                <td class="px-2 py-1.5 text-emerald-600 font-medium">{{ r.survivalCountAsexual || '-' }}</td>
                <td class="px-2 py-1.5">
                  <span v-if="getRecordRate(r) !== null" :class="getRateColor(getRecordRate(r), 'asexual')">
                    {{ getRecordRate(r).toFixed(1) }}%
                  </span>
                  <span v-else>-</span>
                </td>
                <td class="px-2 py-1.5 text-xs">
                  <div v-if="(r.targetTraits || []).length > 0" class="flex flex-wrap gap-1">
                    <span v-for="t in r.targetTraits" :key="t" class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{{ t }}</span>
                  </div>
                  <span v-else>-</span>
                </td>
                <td class="px-2 py-1.5">{{ seedlingStatusLabel(r.seedlingStatus) }}</td>
                <td class="px-2 py-1.5 text-gray-500 max-w-[120px] truncate" :title="r.transplantPosition || ''">{{ r.transplantPosition || '-' }}</td>
                <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
                <td class="px-2 py-1.5 text-gray-500 max-w-[160px] truncate" :title="r.remarks || ''">{{ r.remarks || '-' }}</td>
                <td v-if="!readOnly" class="px-2 py-1.5 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button type="button" class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-7 h-7 rounded flex items-center justify-center" title="编辑" @click="handleStartEdit(r)">
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                    </button>
                    <button type="button" class="text-red-500 hover:text-red-600 hover:bg-red-50 w-7 h-7 rounded flex items-center justify-center" title="删除" @click="handleDelete(r.id)">
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </SimpleModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import SimpleModal from '@/components/common/SimpleModal.vue'
import { apiSeedlingPropagationService } from '@/services/apiSeedlingPropagationService'
import { todayLocal } from '@/lib/dateUtils'
import {
  ASEXUAL_OPERATION_TYPES,
  OPERATION_TYPE_LABELS,
  PROPAGATION_METHOD_LABELS,
  GENERATION_OPTIONS,
  TARGET_TRAIT_OPTIONS,
  getRateColor
} from '@/constants/propagationConstants'
import { OPERATORS } from '@/views/material/utils/materialReturnConfig'

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'success'])

const deepInputClass = 'w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white'

const EMPTY_FORM = () => ({
  recordDate: todayLocal(),
  operationType: 'cutting',
  reproductionMode: 'asexual',
  generation: '',
  motherPlantCode: '',
  propagationMethod: undefined,
  inoculationCount: undefined,
  survivalCountAsexual: undefined,
  targetTraits: [],
  temperature: undefined,
  humidity: undefined,
  seedlingStatus: 'healthy',
  transplantPosition: '',
  operator: '',
  remarks: ''
})

// 状态
const records = ref([])
const loading = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const form = ref(EMPTY_FORM())

// 世代分组
const generationGroups = computed(() => Array.from(new Set(GENERATION_OPTIONS.map(o => o.group))))
const generationOptionsByGroup = computed(() => {
  const map = {}
  GENERATION_OPTIONS.forEach(o => {
    if (!map[o.group]) map[o.group] = []
    map[o.group].push(o)
  })
  return map
})

// 加载历史记录
const loadHistory = async () => {
  if (!props.record?.id) return
  loading.value = true
  try {
    const list = await apiSeedlingPropagationService.list(String(props.record.id))
    records.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('[SeedlingPropagationModal] loadHistory error:', error)
    ElMessage.error('加载无性繁殖记录失败：' + (error.message || '未知错误'))
    records.value = []
  } finally {
    loading.value = false
  }
}

// 繁殖系数（派生）
const rate = computed(() => {
  const inoc = form.value.inoculationCount ?? 0
  const surv = form.value.survivalCountAsexual ?? 0
  if (inoc <= 0) return null
  return (surv / inoc) * 100
})

// 切换目标性状
const toggleTrait = (trait, checked) => {
  const list = form.value.targetTraits || []
  form.value.targetTraits = checked ? [...list, trait] : list.filter(t => t !== trait)
}

// 子苗状态显示
const seedlingStatusLabel = (s) => {
  if (s === 'healthy') return '健康'
  if (s === 'weak') return '弱苗'
  if (s === 'diseased') return '病害'
  return '-'
}

// 计算单条记录繁殖系数
const getRecordRate = (r) => {
  const inoc = r.inoculationCount ?? 0
  const surv = r.survivalCountAsexual ?? 0
  return inoc > 0 ? (surv / inoc) * 100 : null
}

// 提交（添加 / 编辑）
const handleSubmit = async () => {
  if (props.readOnly) {
    emit('close')
    return
  }
  if (!props.record?.id) {
    ElMessage.error('缺少育苗记录ID')
    return
  }
  if (!form.value.recordDate) {
    ElMessage.warning('请选择记录日期')
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await apiSeedlingPropagationService.update(String(props.record.id), editingId.value, form.value)
      ElMessage.success('修改成功')
    } else {
      await apiSeedlingPropagationService.create(String(props.record.id), form.value)
      ElMessage.success('添加成功')
    }
    editingId.value = null
    form.value = EMPTY_FORM()
    await loadHistory()
    emit('success')
  } catch (error) {
    console.error('[SeedlingPropagationModal] submit error:', error)
    const op = editingId.value ? '更新' : '添加'
    ElMessage.error(`${op}失败：${error.message || '未知错误'}`)
  } finally {
    submitting.value = false
  }
}

// 进入编辑
const handleStartEdit = (r) => {
  if (props.readOnly) return
  editingId.value = r.id
  form.value = {
    recordDate: r.recordDate || todayLocal(),
    operationType: r.operationType ?? 'cutting',
    reproductionMode: r.reproductionMode ?? 'asexual',
    generation: r.generation ?? '',
    motherPlantCode: r.motherPlantCode ?? '',
    propagationMethod: r.propagationMethod ?? undefined,
    inoculationCount: r.inoculationCount ?? undefined,
    survivalCountAsexual: r.survivalCountAsexual ?? undefined,
    targetTraits: r.targetTraits ?? [],
    temperature: r.temperature ?? undefined,
    humidity: r.humidity ?? undefined,
    seedlingStatus: r.seedlingStatus ?? 'healthy',
    transplantPosition: r.transplantPosition ?? '',
    operator: r.operator ?? '',
    remarks: r.remarks ?? ''
  }
}

// 取消编辑
const handleCancelEdit = () => {
  editingId.value = null
  form.value = EMPTY_FORM()
}

// 删除
const handleDelete = async (recordId) => {
  if (props.readOnly) {
    ElMessage.warning('该育苗已结束，无法删除记录')
    return
  }
  try {
    await ElMessageBox.confirm('确定删除这条无性繁殖记录？', '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
  } catch {
    return  // 用户取消
  }
  try {
    await apiSeedlingPropagationService.delete(String(props.record.id), recordId)
    ElMessage.success('删除成功')
    await loadHistory()
    emit('success')
  } catch (error) {
    console.error('[SeedlingPropagationModal] delete error:', error)
    ElMessage.error('删除失败：' + (error.message || '未知错误'))
  }
}

// 导出 XLSX
const handleExport = () => {
  if (records.value.length === 0) {
    ElMessage.warning('没有记录可导出')
    return
  }
  const data = records.value.map(r => {
    const inoc = r.inoculationCount ?? 0
    const surv = r.survivalCountAsexual ?? 0
    const reproductionRate = inoc > 0 ? ((surv / inoc) * 100).toFixed(1) + '%' : ''
    return {
      '日期': r.recordDate,
      '操作类型': OPERATION_TYPE_LABELS[r.operationType] || r.operationType || '',
      '繁殖模式': r.reproductionMode === 'asexual' ? '无性' : '有性',
      '世代': r.generation || '',
      '母株编码': r.motherPlantCode || '',
      '繁殖方式': r.propagationMethod ? (PROPAGATION_METHOD_LABELS[r.propagationMethod] || r.propagationMethod) : '',
      '接种数': inoc || '',
      '成活数': surv || '',
      '繁殖系数': reproductionRate,
      '目标性状': (r.targetTraits || []).join('、'),
      '温度(℃)': r.temperature ?? '',
      '湿度(%)': r.humidity ?? '',
      '子苗状态': seedlingStatusLabel(r.seedlingStatus),
      '移栽位置': r.transplantPosition || '',
      '操作人': r.operator || '',
      '备注': r.remarks || ''
    }
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '无性繁殖记录')
  XLSX.writeFile(wb, `无性繁殖记录_${props.record?.seedlingCode || 'unknown'}.xlsx`)
}

// 弹窗打开时加载历史 + 重置表单
watch(() => props.visible, (val) => {
  if (val) {
    editingId.value = null
    form.value = EMPTY_FORM()
    loadHistory()
  }
})

onMounted(() => {
  if (props.visible) loadHistory()
})
</script>
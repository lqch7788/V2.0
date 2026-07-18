<!--
  2026-07-04 v2 育苗无性繁殖记录弹窗（完整版，V1.1 SeedlingPropagationModal.tsx 1:1 迁移）
  与种植/RecordModal 的 asexual 分支 100% 对齐：
  - 顶部繁殖模式切换 banner（默认无性）
  - 完整繁殖字段：操作人 / 操作类型 / 世代 / 母株编码 / 繁殖方式
  - 目标性状（多选）
  - 无性繁殖指标：接种数 / 成活数 / 繁殖系数（派生）
  - 通用字段：日期 / 温度 / 湿度 / 子苗状态 / 移栽位置 / 备注
  - 历史表 / XLSX 导出 / readOnly 模式
  2026-07-18 P0-MISS-001 修复：V2.0 此前缺失此组件
-->
<template>
  <el-dialog
    :model-value="visible"
    :title="`无性繁殖记录 - ${record?.seedlingCode}${readOnly ? '（只读）' : ''}`"
    width="1350px"
    height="700px"
    top="5vh"
    :close-on-click-modal="true"
    @update:model-value="(v) => emit('update:visible', v)"
    @close="handleClose"
  >
    <div class="space-y-6">
      <!-- 只读模式横幅 -->
      <div v-if="readOnly" class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
        <el-icon class="text-gray-600 shrink-0"><Lock /></el-icon>
        <span class="text-sm text-gray-700">该育苗已结束，无性繁殖记录处于<strong>只读模式</strong>（可查看、导出）</span>
      </div>

      <!-- 添加 / 编辑表单 -->
      <div v-if="!readOnly" class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <el-icon class="text-emerald-600"><Share /></el-icon>
          {{ editingId ? '编辑无性繁殖记录' : '添加无性繁殖记录' }}
          <el-button v-if="editingId" link type="info" class="ml-auto text-gray-500" @click="handleCancelEdit">
            <el-icon><Close /></el-icon>取消编辑
          </el-button>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Row 1：日期 / 操作人 / 操作类型 / 世代 -->
          <div>
            <label class="text-gray-700">记录日期 <span class="text-red-500">*</span></label>
            <el-date-picker
              v-model="form.recordDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              class="!w-full"
            />
          </div>
          <div>
            <label class="text-gray-700">操作人</label>
            <el-select v-model="form.operator" placeholder="请选择操作人" clearable class="!w-full">
              <el-option label="系统管理员" value="系统管理员" />
              <el-option label="操作员A" value="操作员A" />
              <el-option label="操作员B" value="操作员B" />
            </el-select>
          </div>
          <div>
            <label class="text-gray-700">操作类型 <span class="text-red-500">*</span></label>
            <el-select v-model="form.operationType" class="!w-full">
              <el-option v-for="t in ASEXUAL_OPERATION_TYPES" :key="t" :label="OPERATION_TYPE_LABELS[t]" :value="t" />
            </el-select>
          </div>
          <div>
            <label class="text-gray-700">世代</label>
            <el-select v-model="form.generation" placeholder="请选择世代（如 F1/BC1/G1）" clearable class="!w-full">
              <el-option-group v-for="group in generationGroups" :key="group.label" :label="group.label">
                <el-option v-for="opt in group.options" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-option-group>
            </el-select>
          </div>

          <!-- Row 2：母株编码 / 繁殖方式 / 温度 / 湿度 -->
          <div>
            <label class="text-gray-700">
              母株编码 <span class="text-red-500">*</span>
            </label>
            <el-input v-model="form.motherPlantCode" placeholder="母株编号（单亲来源：本株是克隆源）" />
          </div>
          <div>
            <label class="text-gray-700">
              繁殖方式 <span class="text-red-500">*</span>
            </label>
            <el-select v-model="form.propagationMethod" placeholder="请选择繁殖方式" clearable class="!w-full">
              <el-option v-for="(label, key) in PROPAGATION_METHOD_LABELS" :key="key" :label="label" :value="key" />
            </el-select>
          </div>
          <div>
            <label class="text-gray-700">温度（℃）</label>
            <el-input v-model.number="form.temperature" type="number" step="0.1" placeholder="环境温度" />
          </div>
          <div>
            <label class="text-gray-700">湿度（%）</label>
            <el-input v-model.number="form.humidity" type="number" step="0.1" placeholder="环境湿度" />
          </div>

          <!-- Row 3：移栽位置 / 子苗状态 -->
          <div>
            <label class="text-gray-700">移栽位置</label>
            <el-input v-model="form.transplantPosition" placeholder="如 温室B区 / 3号苗床" />
          </div>
          <div>
            <label class="text-gray-700">子苗状态</label>
            <el-select v-model="form.seedlingStatus" class="!w-full">
              <el-option label="健康" value="healthy" />
              <el-option label="弱苗" value="weak" />
              <el-option label="病害" value="diseased" />
            </el-select>
          </div>

          <!-- Row 4：目标性状（多选 chip） -->
          <div class="col-span-4">
            <label class="text-gray-700">目标性状（多选）</label>
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
                <input
                  type="checkbox"
                  class="w-3.5 h-3.5"
                  :checked="(form.targetTraits || []).includes(trait)"
                  @change="(e) => toggleTrait(trait, e.target.checked)"
                />
                {{ trait }}
              </label>
            </div>
          </div>

          <!-- Row 5：接种数 / 成活数 / 繁殖系数（派生） -->
          <div>
            <label class="text-gray-700" title="接种的插穗/接芽/外植体/球茎等数量">接种数（个）</label>
            <el-input v-model.number="form.inoculationCount" type="number" min="0" placeholder="0" />
          </div>
          <div>
            <label class="text-gray-700" title="实际成活/生根/萌芽的数量">成活数（个）</label>
            <el-input v-model.number="form.survivalCountAsexual" type="number" min="0" placeholder="0" />
          </div>
          <div>
            <label class="text-gray-700" title="繁殖系数 = 成活数 ÷ 接种数">繁殖系数（派生）</label>
            <div
              :class="['px-4 py-3 border border-gray-300 rounded-lg text-sm shadow-inner flex items-center',
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
          </div>

          <!-- Row 6：备注 -->
          <div class="col-span-4">
            <label class="text-gray-700">备注</label>
            <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="目标性状、过程记录、异常情况等" />
          </div>
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div>
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
          <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <el-icon class="text-emerald-600"><Cherry /></el-icon>
            历史记录（{{ records.length }} 条）
          </h4>
          <el-button size="small" :disabled="records.length === 0" @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
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
                  <span v-if="rowRate(r) !== null" :class="getRateColor(rowRate(r), 'asexual')">
                    {{ rowRate(r).toFixed(1) }}%
                  </span>
                  <span v-else>-</span>
                </td>
                <td class="px-2 py-1.5 text-xs">
                  <div v-if="(r.targetTraits || []).length > 0" class="flex flex-wrap gap-1">
                    <span v-for="t in r.targetTraits" :key="t" class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{{ t }}</span>
                  </div>
                  <span v-else>-</span>
                </td>
                <td class="px-2 py-1.5">
                  <span v-if="r.seedlingStatus === 'healthy'">健康</span>
                  <span v-else-if="r.seedlingStatus === 'weak'">弱苗</span>
                  <span v-else-if="r.seedlingStatus === 'diseased'">病害</span>
                  <span v-else>-</span>
                </td>
                <td class="px-2 py-1.5 text-gray-500 max-w-[120px] truncate" :title="r.transplantPosition || ''">
                  {{ r.transplantPosition || '-' }}
                </td>
                <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
                <td class="px-2 py-1.5 text-gray-500 max-w-[160px] truncate" :title="r.remarks || ''">
                  {{ r.remarks || '-' }}
                </td>
                <td v-if="!readOnly" class="px-2 py-1.5 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <el-button link type="primary" :icon="Edit" @click="handleStartEdit(r)" />
                    <el-button link type="danger" :icon="Delete" @click="handleDelete(r.id)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="!readOnly" type="primary" :loading="addSubmitting" @click="editingId ? handleSaveEdit() : handleSubmit()">
          {{ editingId ? '保存修改' : '添加记录' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Close, Share, Cherry, Download, Edit, Delete } from '@element-plus/icons-vue'
import { todayLocal } from '@/lib/dateUtils'
import { apiSeedlingPropagationService } from '@/services/apiSeedlingPropagationService'
import { ASEXUAL_OPERATION_TYPES, OPERATION_TYPE_LABELS, PROPAGATION_METHOD_LABELS, GENERATION_OPTIONS, TARGET_TRAIT_OPTIONS, getRateColor } from '@/constants/propagationConstants'
import * as XLSX from 'xlsx'

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null },
  /** 只读模式：已结束的育苗禁用新增/编辑/删除 */
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'success'])

const records = ref([])
const loading = ref(false)
const editingId = ref(null)
const addSubmitting = ref(false)

const EMPTY_FORM = {
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
}

const form = ref({ ...EMPTY_FORM })

// 世代选项按 group 分组
const generationGroups = computed(() => {
  const groups = new Map()
  GENERATION_OPTIONS.forEach((o) => {
    if (!groups.has(o.group)) groups.set(o.group, [])
    groups.get(o.group).push(o)
  })
  return Array.from(groups.entries()).map(([label, options]) => ({ label, options }))
})

const toggleTrait = (trait, checked) => {
  const list = form.value.targetTraits || []
  form.value.targetTraits = checked ? [...list, trait] : list.filter((t) => t !== trait)
}

// 繁殖系数（派生）
const rate = computed(() => {
  const inoc = form.value.inoculationCount ?? 0
  const surv = form.value.survivalCountAsexual ?? 0
  if (inoc <= 0) return null
  return (surv / inoc) * 100
})

const rowRate = (r) => {
  const inoc = r.inoculationCount ?? 0
  const surv = r.survivalCountAsexual ?? 0
  return inoc > 0 ? (surv / inoc) * 100 : null
}

const loadHistory = async () => {
  if (!props.record?.id) return
  loading.value = true
  try {
    const list = await apiSeedlingPropagationService.list(String(props.record.id))
    records.value = Array.isArray(list) ? list : []
  } catch (error) {
    const msg = error instanceof Error ? error.message : '加载失败'
    ElMessage.error(`加载无性繁殖记录失败：${msg}`)
    records.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    void loadHistory()
    form.value = { ...EMPTY_FORM }
    editingId.value = null
  }
})

const handleSubmit = async () => {
  if (props.readOnly) {
    ElMessage.warning('该育苗已结束，无法新增记录')
    return
  }
  if (!form.value.recordDate) {
    ElMessage.warning('请选择记录日期')
    return
  }
  addSubmitting.value = true
  try {
    await apiSeedlingPropagationService.create(String(props.record.id), form.value)
    await loadHistory()
    form.value = { ...EMPTY_FORM, recordDate: todayLocal() }
    emit('success')
  } catch (error) {
    const msg = error instanceof Error ? error.message : '添加失败'
    ElMessage.error(`添加失败：${msg}`)
  } finally {
    addSubmitting.value = false
  }
}

const handleStartEdit = (r) => {
  if (props.readOnly) return
  editingId.value = r.id
  form.value = {
    recordDate: r.recordDate,
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

const handleCancelEdit = () => { editingId.value = null }

const handleSaveEdit = async () => {
  if (props.readOnly || !editingId.value) return
  try {
    await apiSeedlingPropagationService.update(String(props.record.id), editingId.value, form.value)
    editingId.value = null
    await loadHistory()
    emit('success')
  } catch (error) {
    const msg = error instanceof Error ? error.message : '更新失败'
    ElMessage.error(`更新失败：${msg}`)
  }
}

const handleDelete = async (recordId) => {
  if (props.readOnly) {
    ElMessage.warning('该育苗已结束，无法删除记录')
    return
  }
  try {
    await ElMessageBox.confirm('确定删除这条无性繁殖记录？', '确认', { type: 'warning' })
    await apiSeedlingPropagationService.delete(String(props.record.id), recordId)
    await loadHistory()
    emit('success')
  } catch (e) {
    if (e === 'cancel') return
    const msg = e instanceof Error ? e.message : '删除失败'
    ElMessage.error(`删除失败：${msg}`)
  }
}

const handleExport = () => {
  if (records.value.length === 0) {
    ElMessage.warning('没有记录可导出')
    return
  }
  const data = records.value.map((r) => {
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
      '子苗状态': r.seedlingStatus ?? '',
      '移栽位置': r.transplantPosition || '',
      '操作人': r.operator || '',
      '备注': r.remarks || ''
    }
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '无性繁殖记录')
  XLSX.writeFile(wb, `无性繁殖记录_${props.record?.seedlingCode}.xlsx`)
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

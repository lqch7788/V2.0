<!--
  种植管理每日记录弹窗（1:1 迁移自 V1.1 DailyRecordModal.tsx 2026-06-28）

  与育苗管理 DailyRecordModal 的差异：
  - 种植只有 1 个池（活体剩余 = plantingCount + supplementCount - lossCount）
  - 数量统计简化为 2 个字段：lossChange（损耗）、supplementChange（补栽）
  - 无母株/小苗双池逻辑
  - 校验：损耗 ≤ 当前活体剩余；补栽无上限

  功能：新增 / 编辑 / 删除 / 导出 每日记录
-->
<template>
  <UnifiedModal
    v-if="isOpen"
    :is-open="isOpen"
    :on-close="onClose"
    :title="titleContent"
    size="xxl"
    :show-footer="true"
    :on-submit="handleSubmit"
    :submit-text="editingRecordId ? '保存修改' : '新增记录'"
    cancel-text="取消"
  >
    <div class="space-y-4">
      <!-- 顶部统计：4 卡片 -->
      <div class="grid grid-cols-4 gap-3">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">定植数量</div>
          <div class="text-lg font-semibold text-gray-900">{{ record.plantingCount || 0 }} {{ record.unit || '株' }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">累计损耗</div>
          <div class="text-lg font-semibold text-red-600">{{ record.lossCount || 0 }} {{ record.unit || '株' }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">累计补栽</div>
          <div class="text-lg font-semibold text-emerald-600">{{ record.supplementCount || 0 }} {{ record.unit || '株' }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">活体剩余</div>
          <div class="text-lg font-semibold text-blue-600">{{ aliveCount }} {{ record.unit || '株' }}</div>
        </div>
      </div>

      <!-- 只读模式提示 -->
      <div v-if="readOnly" class="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
        <Lock class="w-4 h-4 text-amber-600" />
        <span class="text-sm text-amber-700">该种植记录已结束，处于只读模式（仅可查看与导出）</span>
      </div>

      <!-- 新增/编辑表单 -->
      <div v-if="!readOnly" class="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
        <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Check class="w-4 h-4" />
          {{ editingRecordId ? '编辑每日记录' : '新增每日记录' }}
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label class="text-gray-700">记录日期 <span class="text-red-500">*</span></Label>
            <DatePicker
              class="w-full"
              :selected="form.recordDate ? new Date(form.recordDate) : undefined"
              @change="(date) => form.recordDate = todayLocal(date)"
            />
          </div>
          <div>
            <Label class="text-gray-700">温度（℃）</Label>
            <Input type="number" v-model="form.temperature" placeholder="环境温度" :class="deepInputClass" />
          </div>
          <div>
            <Label class="text-gray-700">湿度（%）</Label>
            <Input type="number" v-model="form.humidity" placeholder="环境湿度" :class="deepInputClass" />
          </div>
          <div>
            <Label class="text-gray-700">光照（h）</Label>
            <Input type="number" v-model="form.lightHours" placeholder="光照时长" :class="deepInputClass" />
          </div>
          <div>
            <Label class="text-gray-700">损耗数量 <span class="text-red-500">*</span></Label>
            <Input type="number" :min="0" v-model.number="form.lossChange" placeholder="0" :class="deepInputClass" />
            <div class="text-xs text-gray-500 mt-0.5">不超过活体剩余（{{ aliveCount }}）</div>
          </div>
          <div>
            <Label class="text-gray-700">补栽数量</Label>
            <Input type="number" :min="0" v-model.number="form.supplementChange" placeholder="0" :class="deepInputClass" />
          </div>
          <div>
            <Label class="text-gray-700">浇水方式</Label>
            <Select v-model="form.wateringMethod">
              <SelectTrigger :class="deepInputClass">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(label, value) in WATERING_METHOD_MAP" :key="value" :value="value">{{ label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="text-gray-700">浇水量</Label>
            <Input type="number" :min="0" v-model.number="form.wateringQuantity" placeholder="0" :class="deepInputClass" />
          </div>
          <div class="col-span-2">
            <Label class="text-gray-700">操作人</Label>
            <Select v-model="form.operator">
              <SelectTrigger :class="deepInputClass">
                <SelectValue placeholder="请选择操作人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="op in OPERATORS" :key="op.value" :value="op.value">{{ op.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="col-span-2">
            <Label class="text-gray-700">备注</Label>
            <TextArea v-model="form.remarks" :rows="1" placeholder="异常情况、观察记录等" :class="deepInputClass" />
          </div>
        </div>

        <div v-if="formError" class="text-sm text-red-600 flex items-center gap-1">
          <X class="w-4 h-4" />
          {{ formError }}
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-semibold text-gray-900">历史记录（{{ dailyRecords.length }} 条）</h4>
          <Button variant="default" size="sm" :disabled="dailyRecords.length === 0" @click="handleExport">
            <Download class="w-4 h-4" />
            导出
          </Button>
        </div>

        <div v-if="loadingHistory" class="text-center py-8 text-gray-500">加载中…</div>
        <div v-else-if="dailyRecords.length === 0" class="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
          暂无每日记录
        </div>
        <div v-else class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-blue-500 text-white sticky top-0">
              <tr>
                <th class="px-2 py-2 text-left">日期</th>
                <th class="px-2 py-2 text-left">环境</th>
                <th class="px-2 py-2 text-right">损耗</th>
                <th class="px-2 py-2 text-right">补栽</th>
                <th class="px-2 py-2 text-left">浇水</th>
                <th class="px-2 py-2 text-left">操作人</th>
                <th class="px-2 py-2 text-left">备注</th>
                <th v-if="!readOnly" class="px-2 py-2 text-center w-24">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="r in dailyRecords" :key="r.id" class="hover:bg-gray-50">
                <td class="px-2 py-1.5 whitespace-nowrap">{{ r.recordDate }}</td>
                <td class="px-2 py-1.5 text-xs text-gray-600">
                  <span v-if="r.temperature != null">{{ r.temperature }}℃</span>
                  <span v-if="r.humidity != null"> / {{ r.humidity }}%</span>
                  <span v-if="r.lightHours != null"> / {{ r.lightHours }}h</span>
                </td>
                <td class="px-2 py-1.5 text-right text-red-600 font-medium">{{ r.lossChange || 0 }}</td>
                <td class="px-2 py-1.5 text-right text-emerald-600 font-medium">{{ r.supplementChange || 0 }}</td>
                <td class="px-2 py-1.5 text-xs">{{ formatWatering(r) }}</td>
                <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
                <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]">{{ r.remarks || '-' }}</td>
                <td v-if="!readOnly" class="px-2 py-1.5 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" :class="'text-blue-600 hover:text-blue-700 hover:bg-blue-50'" @click="startEdit(r)">
                      <Edit2 class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" :class="'text-red-600 hover:text-red-700 hover:bg-red-50'" @click="handleDelete(r)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </UnifiedModal>
</template>

<script setup>
/**
 * 种植管理每日记录弹窗（1:1 迁移自 V1.1 DailyRecordModal.tsx）
 */
import { ref, computed, h, onMounted, watch } from 'vue'
import { UnifiedModal, Input, DatePicker, Label, TextArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui'
import { Check, Lock, Edit2, Trash2, Download, X } from 'lucide-vue-next'
import { todayLocal } from '@/lib/dateUtils'
import { showAlert, showConfirm } from '@/lib/dialogService'
import {
  WATERING_METHOD_MAP,
  WATERING_UNIT_MAP,
  FEED_UNIT_MAP
} from '@/constants/cropConstants'
import { OPERATORS } from '@/data/cropData'
import { useDictionaryStore, getDictItems } from '@/stores/useDictionaryStore'
import { usePlantingStore } from '@/stores/modules/planting'
import { getPlantingDailyRecords } from '@/services/apiPlantingDailyRecordService'

const deepInputClass = "px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  onSuccess: { type: Function, default: undefined },
  record: { type: Object, required: true },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['success'])

const dictionaryStore = useDictionaryStore()
const plantingStore = usePlantingStore()

const refreshKey = ref(0)
const dailyRecords = ref([])
const loadingHistory = ref(false)
const editingRecordId = ref(null)
const formError = ref('')

const form = ref({
  recordDate: todayLocal(),
  temperature: '',
  humidity: '',
  lightHours: '',
  lossChange: 0,
  supplementChange: 0,
  wateringMethod: '',
  wateringQuantity: 0,
  operator: '',
  remarks: ''
})

const aliveCount = computed(() => {
  return Math.max(0, (props.record.plantingCount || 0) + (props.record.supplementCount || 0) - (props.record.lossCount || 0))
})

const titleContent = computed(() => h('div', { class: 'flex items-center gap-2' }, [
  h('span', null, `每日记录 - ${props.record.plantCode || ''}`)
]))

const formatWatering = (r) => {
  if (!r.wateringMethod) return '-'
  const m = WATERING_METHOD_MAP[r.wateringMethod] || r.wateringMethod
  if (r.wateringQuantity) {
    return `${m} ${r.wateringQuantity}${WATERING_UNIT_MAP[r.wateringMethod] || ''}`
  }
  return m
}

onMounted(() => {
  if (dictionaryStore.dictionaries.length === 0) dictionaryStore.loadDictionaries()
})

watch(() => [props.isOpen, refreshKey.value], ([open]) => {
  if (open) void loadHistory()
})

const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const list = await getPlantingDailyRecords(String(props.record.id))
    dailyRecords.value = list || []
  } catch {
    dailyRecords.value = []
  } finally {
    loadingHistory.value = false
  }
}

const resetForm = () => {
  editingRecordId.value = null
  form.value = {
    recordDate: todayLocal(),
    temperature: '', humidity: '', lightHours: '',
    lossChange: 0, supplementChange: 0,
    wateringMethod: '', wateringQuantity: 0,
    operator: '', remarks: ''
  }
  formError.value = ''
}

const startEdit = (r) => {
  editingRecordId.value = r.id
  form.value = {
    recordDate: r.recordDate || todayLocal(),
    temperature: r.temperature ?? '',
    humidity: r.humidity ?? '',
    lightHours: r.lightHours ?? '',
    lossChange: r.lossChange || 0,
    supplementChange: r.supplementChange || 0,
    wateringMethod: r.wateringMethod || '',
    wateringQuantity: r.wateringQuantity || 0,
    operator: r.operator || '',
    remarks: r.remarks || ''
  }
  formError.value = ''
}

const validateForm = () => {
  if (!form.value.recordDate) return '请选择记录日期'
  if (form.value.lossChange < 0) return '损耗数量不能为负'
  if (form.value.supplementChange < 0) return '补栽数量不能为负'
  if (form.value.lossChange > aliveCount.value) {
    return `损耗数量不能超过活体剩余（${aliveCount.value}）`
  }
  return null
}

const handleSubmit = async () => {
  const err = validateForm()
  if (err) {
    formError.value = err
    return
  }
  formError.value = ''
  try {
    if (editingRecordId.value) {
      const ok = await plantingStore.updateDailyRecord(String(props.record.id), editingRecordId.value, form.value)
      if (ok) {
        await showAlert('修改成功')
        resetForm()
        refreshKey.value++
        props.onSuccess?.()
        emit('success')
      } else {
        formError.value = '修改失败'
      }
    } else {
      const result = await plantingStore.addDailyRecord(String(props.record.id), form.value)
      if (result) {
        await showAlert('新增成功')
        resetForm()
        refreshKey.value++
        props.onSuccess?.()
        emit('success')
      } else {
        formError.value = '新增失败'
      }
    }
  } catch (e) {
    formError.value = e instanceof Error ? e.message : '操作失败'
  }
}

const handleDelete = async (r) => {
  if (!await showConfirm(`确定要删除 ${r.recordDate} 的每日记录吗？`)) return
  try {
    const ok = await plantingStore.deleteDailyRecord(String(props.record.id), r.id)
    if (ok) {
      await showAlert('删除成功')
      refreshKey.value++
      props.onSuccess?.()
    } else {
      await showAlert('删除失败')
    }
  } catch (e) {
    await showAlert(`删除失败：${e instanceof Error ? e.message : '未知错误'}`)
  }
}

const handleExport = async () => {
  if (dailyRecords.value.length === 0) {
    await showAlert('没有记录可导出')
    return
  }
  const headers = ['日期', '温度(℃)', '湿度(%)', '光照(h)', '损耗', '补栽', '浇水方式', '浇水量', '操作人', '备注']
  const rows = dailyRecords.value.map((r) => [
    r.recordDate, r.temperature ?? '', r.humidity ?? '', r.lightHours ?? '',
    r.lossChange || 0, r.supplementChange || 0,
    WATERING_METHOD_MAP[r.wateringMethod] || r.wateringMethod || '',
    r.wateringQuantity ? `${r.wateringQuantity}${WATERING_UNIT_MAP[r.wateringMethod] || ''}` : '',
    r.operator || '', r.remarks || ''
  ])
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `种植每日记录_${props.record.plantCode}_${todayLocal()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

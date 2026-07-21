<!--
  每日记录弹窗（完全重写 - 1:1 对齐 V1.1 DailyRecordModal.tsx）
-->
<template>
  <SimpleModal
    :visible="visible"
    :title="`每日记录 - ${record?.seedlingCode || ''}`"
    width="1100px"
    :show-footer="false"
    @close="$emit('close')"
  >

    <div class="space-y-6">
      <!-- 只读模式横幅 -->
      <div v-if="readOnly" class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="text-sm text-gray-700">该育苗已结束，每日记录处于<strong>只读模式</strong>（可查看、导出）</span>
      </div>

      <!-- 添加新记录 -->
      <div v-if="!readOnly" class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">添加新记录</h4>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">记录日期 <span class="text-red-500">*</span></label>
            <input v-model="formData.recordDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">温度 (℃)</label>
            <input v-model.number="formData.temperature" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">湿度 (%)</label>
            <input v-model.number="formData.humidity" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">母株损耗</label>
            <input v-model.number="formData.survivalCountChange" type="number" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小苗产出</label>
            <input v-model.number="formData.runnerIncreaseCount" type="number" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小苗损耗</label>
            <input v-model.number="formData.lossCountChange" type="number" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">补苗</label>
            <input v-model.number="formData.replantChange" type="number" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">操作员</label>
            <input v-model="formData.operator" placeholder="请输入" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">异常情况</label>
            <input v-model="formData.abnormality" placeholder="请输入" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea v-model="formData.remarks" rows="2" placeholder="请输入备注" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
        </div>
        <div class="mt-3 flex justify-end">
          <button type="button" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? '提交中...' : '添加记录' }}
          </button>
        </div>
      </div>

      <!-- 历史记录 -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-900">历史记录</h4>
          <button type="button" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1" @click="handleExport" :disabled="dailyRecords.length === 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导出
          </button>
        </div>
        <div v-if="dailyRecords.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无记录</div>
        <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left">日期</th>
                <th class="px-3 py-2 text-left">温度</th>
                <th class="px-3 py-2 text-left">湿度</th>
                <th class="px-3 py-2 text-left">母株损耗</th>
                <th class="px-3 py-2 text-left">小苗产出</th>
                <th class="px-3 py-2 text-left">小苗损耗</th>
                <th class="px-3 py-2 text-left">操作员</th>
                <th class="px-3 py-2 text-left">备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in dailyRecords" :key="r.id" class="border-t border-gray-100">
                <td class="px-3 py-2">{{ r.recordDate }}</td>
                <td class="px-3 py-2">{{ r.temperature ?? '-' }}</td>
                <td class="px-3 py-2">{{ r.humidity ?? '-' }}</td>
                <td class="px-3 py-2">{{ r.survivalCountChange ?? '-' }}</td>
                <td class="px-3 py-2">{{ r.runnerIncreaseCount ?? '-' }}</td>
                <td class="px-3 py-2">{{ r.lossCountChange ?? '-' }}</td>
                <td class="px-3 py-2">{{ r.operator ?? '-' }}</td>
                <td class="px-3 py-2">{{ r.remarks ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button type="button" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" @click="$emit('close')">{{ readOnly ? '关闭' : '取消' }}</button>
      </div>
    </template>
  </SimpleModal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import SimpleModal from '@/components/common/SimpleModal.vue'
import { useSeedlingStore } from '@/stores/modules/seedling'
import * as apiSeedlingService from '@/services/apiSeedlingService'
import { todayLocal } from '@/lib/dateUtils'

const props = defineProps({
  visible: Boolean,
  record: Object,
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'success'])

const seedlingStore = useSeedlingStore()
const submitting = ref(false)
const dailyRecords = ref([])

const formData = ref({
  recordDate: todayLocal(),
  temperature: undefined,
  humidity: undefined,
  watering: false,
  wateringMethod: undefined,
  wateringAmount: undefined,
  wateringUnit: 'L',
  fertilizerRecords: [],
  pesticideRecords: [],
  abnormality: '',
  survivalCountChange: undefined,
  lossCountChange: undefined,
  runnerIncreaseCount: undefined,
  replantChange: undefined,
  remarks: '',
  phValue: undefined,
  ecValue: undefined,
  operator: ''
})

// 加载历史记录
const loadHistory = async () => {
  if (!props.record) return
  try {
    const list = await apiSeedlingService.getDailyRecords(String(props.record.id))
    dailyRecords.value = list || []
  } catch {
    dailyRecords.value = []
  }
}

watch(() => props.visible, (val) => {
  if (val) loadHistory()
})

const isMotherMode = () => (props.record?.propagationMode || 'one_to_one') === 'one_to_many'

const handleSubmit = async () => {
  if (!formData.value.recordDate) { ElMessage.warning('请选择记录日期'); return }
  submitting.value = true
  try {
    const sc = isMotherMode() ? (formData.value.survivalCountChange || 0) : 0
    const ri = isMotherMode() ? (formData.value.runnerIncreaseCount || 0) : 0
    const lc = formData.value.lossCountChange || 0
    const rc = formData.value.replantChange || 0

    const bizData = {
      temperature: formData.value.temperature,
      humidity: formData.value.humidity,
      motherLossChange: sc,
      seedlingLossChange: lc,
      expandedChange: ri,
      replantChange: rc,
      abnormality: formData.value.abnormality || undefined,
      survivalCountChange: sc,
      lossCountChange: lc,
      runnerIncreaseCount: ri,
      phValue: formData.value.phValue,
      ecValue: formData.value.ecValue,
      operator: formData.value.operator || undefined
    }

    const result = await seedlingStore.addDailyRecord(String(props.record.id), {
      recordDate: formData.value.recordDate,
      data: bizData,
      remarks: formData.value.remarks || undefined
    })

    if (result) {
      ElMessage.success('添加记录成功')
      formData.value = { ...formData.value, recordDate: todayLocal(), temperature: undefined, humidity: undefined, survivalCountChange: undefined, lossCountChange: undefined, runnerIncreaseCount: undefined, replantChange: undefined, abnormality: '', remarks: '', phValue: undefined, ecValue: undefined, operator: '' }
      await loadHistory()
      emit('success')
    } else {
      ElMessage.error('添加记录失败，请重试')
    }
  } catch (error) {
    console.error('[DailyRecordModal] error:', error)
    ElMessage.error('添加记录失败')
  } finally {
    submitting.value = false
  }
}

const handleExport = () => {
  if (dailyRecords.value.length === 0) return
  const data = dailyRecords.value.map(r => ({
    '日期': r.recordDate, '温度(℃)': r.temperature ?? '', '湿度(%)': r.humidity ?? '',
    '母株损耗': r.survivalCountChange ?? '', '小苗产出': r.runnerIncreaseCount ?? '',
    '小苗损耗': r.lossCountChange ?? '', '操作员': r.operator ?? '', '备注': r.remarks ?? ''
  }))
  const headers = Object.keys(data[0] || {})
  const csv = headers.join(',') + '\n' + data.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `每日记录_${props.record?.seedlingCode || ''}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => { if (props.visible) loadHistory() })
</script>

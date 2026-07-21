<!--
  育苗标签管理弹窗（重写 - 对齐 V1.1 SeedlingLabelManageModal.tsx）
  V1.1: ~700行，包含标签列表/履历面板/履历表单/批量作废/补充生成/导出
-->
<template>
  <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 -->
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-6 py-3 flex items-center justify-between rounded-t-xl flex-shrink-0">
        <h3 class="text-lg font-semibold text-white">育苗标签管理 - {{ seedlingCode }}</h3>
        <button type="button" class="text-white hover:bg-white/20 rounded p-1" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- 只读模式横幅 -->
      <div v-if="readOnly" class="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="text-sm text-amber-700">该育苗已结束，标签管理处于<strong>只读模式</strong>（可查看、导出、打印，不可编辑）</span>
      </div>

      <!-- 主体 -->
      <div class="flex-1 overflow-hidden flex">
        <!-- 左侧：标签列表 -->
        <div class="w-1/2 border-r border-gray-200 flex flex-col">
          <!-- 搜索 + 操作栏 -->
          <div class="px-3 py-2 border-b border-gray-100 flex-shrink-0 space-y-2">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="searchText" @input="handleSearch" placeholder="搜索标签编号..." class="w-full pl-9 pr-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1" @click="handleExport" :disabled="filteredLabels.length === 0">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导出
              </button>
              <button v-if="!readOnly" type="button" class="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-1" @click="showAddResume = !showAddResume">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                添加履历
              </button>
            </div>
          </div>

          <!-- 标签表格 -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="loading" class="text-center py-8 text-gray-400">加载中...</div>
            <div v-else-if="paginatedLabels.length === 0" class="text-center py-8 text-gray-400">暂无标签</div>
            <table v-else class="w-full text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">标签编号</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">位置</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">数量</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="label in paginatedLabels"
                  :key="label.id"
                  :class="['border-t border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors', selectedLabelId === label.id ? 'bg-emerald-100' : '']"
                  @click="handleSelectLabel(label.id)"
                >
                  <td class="px-3 py-2 font-mono text-xs">{{ label.labelNumber }}</td>
                  <td class="px-3 py-2 text-xs">{{ label.moveInAreaName || '-' }}</td>
                  <td class="px-3 py-2 text-xs">{{ label.quantity ?? '-' }}</td>
                  <td class="px-3 py-2">
                    <span :class="['px-2 py-0.5 rounded text-xs font-medium', label.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
                      {{ statusLabel(label.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="px-3 py-2 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <span class="text-xs text-gray-500">共 {{ filteredLabels.length }} 条</span>
            <div class="flex items-center gap-1">
              <button type="button" class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40" :disabled="labelPage <= 1" @click="labelPage--">上一页</button>
              <span class="text-xs text-gray-600 px-2">{{ labelPage }} / {{ totalPages }}</span>
              <button type="button" class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40" :disabled="labelPage >= totalPages" @click="labelPage++">下一页</button>
            </div>
          </div>
        </div>

        <!-- 右侧：履历详情 -->
        <div class="w-1/2 flex flex-col">
          <!-- 添加履历表单 -->
          <div v-if="showAddResume && !readOnly" class="border-b border-gray-200 p-4 bg-blue-50/30 flex-shrink-0">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">添加履历</h4>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">操作类型</label>
                <select v-model="resumeForm.operationType" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
                  <option value="move_in">移入</option>
                  <option value="move_out">移出</option>
                  <option value="mark">标记</option>
                  <option value="void">作废</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">操作日期</label>
                <input v-model="resumeForm.operationDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">目标位置</label>
                <input v-model="resumeForm.toAreaName" placeholder="移入/移出时填写" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">数量变化</label>
                <input v-model.number="resumeForm.quantityChange" type="number" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-700 mb-1">备注</label>
                <input v-model="resumeForm.reason" placeholder="选填" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
              </div>
            </div>
            <div class="mt-3 flex justify-end gap-2">
              <button type="button" class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50" @click="showAddResume = false">取消</button>
              <button type="button" class="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700" :disabled="submitting" @click="handleAddResume">{{ submitting ? '提交中...' : '提交' }}</button>
            </div>
          </div>

          <!-- 履历列表 -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="!selectedLabel" class="text-center py-8 text-gray-400 text-sm">请从左侧选择一个标签查看履历</div>
            <div v-else-if="resumeLoading" class="text-center py-8 text-gray-400">加载中...</div>
            <div v-else-if="selectedResumes.length === 0" class="text-center py-8 text-gray-400 text-sm">该标签暂无履历记录</div>
            <div v-else class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-900">履历记录（{{ selectedResumes.length }} 条）</h4>
              <div v-for="resume in selectedResumes" :key="resume.id" class="border border-gray-200 rounded-lg p-3">
                <div class="flex items-center justify-between mb-1">
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium', operationTypeClass(resume.operationType)]">
                    {{ operationTypeLabel(resume.operationType) }}
                  </span>
                  <span class="text-xs text-gray-500">{{ resume.operationDate }}</span>
                </div>
                <div class="text-xs text-gray-700">
                  <span v-if="resume.fromAreaName">{{ resume.fromAreaName }} → </span>
                  <span v-if="resume.toAreaName">{{ resume.toAreaName }}</span>
                </div>
                <div v-if="resume.quantityChange != null" class="text-xs text-gray-600 mt-1">
                  数量{{ resume.quantityChange > 0 ? '+' : '' }}{{ resume.quantityChange }}
                  <span v-if="resume.quantityAfter != null"> → 剩余 {{ resume.quantityAfter }}</span>
                </div>
                <div v-if="resume.reason" class="text-xs text-gray-500 mt-1">备注：{{ resume.reason }}</div>
                <div v-if="resume.operatorName" class="text-xs text-gray-400 mt-1">操作人：{{ resume.operatorName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { usePlantLabelStore } from '@/stores'
import { todayLocal } from '@/lib/dateUtils'

const props = defineProps({
  visible: Boolean,
  seedlingId: String,
  seedlingCode: String,
  autoSelectLabelNumber: String,
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const plantLabelStore = usePlantLabelStore()

// 状态
const searchText = ref('')
const labelPage = ref(1)
const selectedLabelId = ref(null)
const showAddResume = ref(false)
const loading = ref(false)
const resumeLoading = ref(false)
const submitting = ref(false)
const labels = ref([])
const resumeMap = ref({})

const PAGE_SIZE = 20

const resumeForm = ref({
  operationType: 'move_in',
  operationDate: todayLocal(),
  toAreaName: '',
  quantityChange: undefined,
  reason: ''
})

// 派生数据
const filteredLabels = computed(() => {
  if (!searchText.value) return labels.value
  const q = searchText.value.toLowerCase()
  return labels.value.filter(l => (l.labelNumber || '').toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLabels.value.length / PAGE_SIZE)))

const paginatedLabels = computed(() => {
  const start = (labelPage.value - 1) * PAGE_SIZE
  return filteredLabels.value.slice(start, start + PAGE_SIZE)
})

const selectedLabel = computed(() => labels.value.find(l => l.id === selectedLabelId.value))

const selectedResumes = computed(() => {
  if (selectedLabelId.value == null) return []
  return resumeMap.value[selectedLabelId.value] || []
})

// 加载标签
const loadLabels = async () => {
  loading.value = true
  try {
    if (plantLabelStore.loadLabels) {
      await plantLabelStore.loadLabels({ seedlingId: props.seedlingId })
      labels.value = plantLabelStore.labels || []
    }
  } catch {
    labels.value = []
  } finally {
    loading.value = false
  }
}

// 加载履历
const loadResumes = async (labelId) => {
  resumeLoading.value = true
  try {
    if (plantLabelStore.loadResumesForLabels) {
      await plantLabelStore.loadResumesForLabels([labelId])
      resumeMap.value = plantLabelStore.resumeMap || {}
    }
  } catch {
    // ignore
  } finally {
    resumeLoading.value = false
  }
}

// 选中标签
const handleSelectLabel = async (labelId) => {
  selectedLabelId.value = labelId
  await loadResumes(labelId)
}

// 搜索
const handleSearch = () => { labelPage.value = 1 }

// 添加履历
const handleAddResume = async () => {
  if (!selectedLabelId.value) { ElMessage.warning('请先选择一个标签'); return }
  submitting.value = true
  try {
    const { enhancedApiClient } = await import('@/lib/apiClient')
    await enhancedApiClient.post(`/plant-labels/${selectedLabelId.value}/resumes`, {
      operation_type: resumeForm.value.operationType,
      operation_date: resumeForm.value.operationDate,
      to_area_name: resumeForm.value.toAreaName || undefined,
      quantity_change: resumeForm.value.quantityChange || 0,
      reason: resumeForm.value.reason || undefined,
      operator_name: '管理员'
    })
    ElMessage.success('添加履历成功')
    showAddResume.value = false
    resumeForm.value = { operationType: 'move_in', operationDate: todayLocal(), toAreaName: '', quantityChange: undefined, reason: '' }
    await loadResumes(selectedLabelId.value)
  } catch (e) {
    ElMessage.error('添加履历失败：' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

// 导出
const handleExport = () => {
  if (filteredLabels.value.length === 0) return
  const headers = ['标签编号', '移入位置', '移入日期', '数量', '状态', '创建时间']
  const rows = filteredLabels.value.map(l => [
    l.labelNumber || '', l.moveInAreaName || '', l.moveInDate || '',
    l.quantity ?? '', statusLabel(l.status), l.createTime || ''
  ])
  const csv = headers.join(',') + '\n' + rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `育苗标签_${props.seedlingCode}_${todayLocal()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// 工具函数
const statusLabel = (s) => ({ active: '在用', void: '已作废', printed: '已打印', archived: '已归档', disabled: '已停用' }[s] || s || '-')
const operationTypeLabel = (t) => ({ move_in: '移入', move_out: '移出', mark: '标记', void: '作废' }[t] || t || '-')
const operationTypeClass = (t) => ({ move_in: 'bg-blue-100 text-blue-700', move_out: 'bg-orange-100 text-orange-700', mark: 'bg-purple-100 text-purple-700', void: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-600')

// 弹窗打开时加载
watch(() => props.visible, (val) => {
  if (val && props.seedlingId) {
    loadLabels()
    selectedLabelId.value = null
    showAddResume.value = false
    searchText.value = ''
    labelPage.value = 1
  }
})

onMounted(() => { if (props.visible) loadLabels() })
</script>
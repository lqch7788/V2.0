<template>
  <!--
    种源标签管理弹窗（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/modals/SeedSourceLabelManageModal.tsx
    功能：种源标签全生命周期管理（两栏布局：标签列表 + 履历面板）
  -->
  <el-dialog
    :model-value="visible"
    :title="`种源标签管理 - ${seedSourceCode}`"
    width="1350px"
    top="5vh"
    :close-on-click-modal="false"
    v-dialog-draggable
    @update:model-value="(v) => $emit('update:visible', v)"
    @close="handleClose"
  >
    <!-- 2026-07-15: 自定义绿色渐变 header 1:1 对齐 V1.1 UnifiedModal 默认 header -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">{{ `种源标签管理 - ${seedSourceCode}` }}</h3>
        <button
          type="button"
          class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
          aria-label="关闭"
          @click="handleClose"
        >
          <X :size="20" />
        </button>
      </div>
    </template>
    <!-- 顶部统计 -->
    <div class="grid grid-cols-4 gap-3 mb-4">
      <div class="bg-emerald-50 p-3 rounded-lg text-center">
        <div class="text-2xl font-bold text-emerald-600">{{ stats.total }}</div>
        <div class="text-xs text-gray-600 mt-1">总标签数</div>
      </div>
      <div class="bg-blue-50 p-3 rounded-lg text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.printed }}</div>
        <div class="text-xs text-gray-600 mt-1">已打印</div>
      </div>
      <div class="bg-amber-50 p-3 rounded-lg text-center">
        <div class="text-2xl font-bold text-amber-600">{{ stats.used }}</div>
        <div class="text-xs text-gray-600 mt-1">已使用</div>
      </div>
      <div class="bg-red-50 p-3 rounded-lg text-center">
        <div class="text-2xl font-bold text-red-600">{{ stats.voided }}</div>
        <div class="text-xs text-gray-600 mt-1">已作废</div>
      </div>
    </div>

    <!-- 主体两栏：左 LabelTable + 右 LabelResumePanel -->
    <div class="flex gap-4" style="min-height: 500px">
      <!-- 左：标签列表 -->
      <div class="w-1/2 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <el-input v-model="searchText" placeholder="搜索标签编号" clearable size="small" style="flex: 1" />
          <el-button size="small" :disabled="selectedIds.size === 0" @click="clearSelection">取消选择</el-button>
        </div>
        <el-table
          v-loading="loading"
          :data="pagedLabels"
          :row-key="(row) => row.id"
          :row-class-name="labelRowClass"
          @row-click="handleSelectLabel"
          @selection-change="handleSelectionChange"
          height="450"
          size="small"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column label="标签编号" prop="labelCode" min-width="140" show-overflow-tooltip />
          <el-table-column label="状态" min-width="70">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="打印次数" prop="printCount" min-width="60" align="right" />
        </el-table>
        <div class="px-3 py-2 border-t border-gray-200 flex items-center justify-end">
          <el-pagination
            v-model:current-page="labelPage"
            :page-size="20"
            :total="filteredLabels.length"
            layout="total, prev, pager, next"
            small
            background
          />
        </div>
      </div>

      <!-- 右：履历面板 -->
      <div class="w-1/2 border border-gray-200 rounded-lg flex flex-col">
        <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span class="text-sm font-semibold">
            履历面板 {{ selectedLabelId ? `（#${selectedLabelId}）` : '' }}
          </span>
          <el-button
            type="primary"
            size="small"
            :disabled="!selectedLabelId || selectedLabelStatus === 'voided' || selectedIds.size > 1"
            @click="showAddResume = true"
          >
            新增履历
          </el-button>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <el-empty v-if="!selectedLabelId" description="请选择左侧标签查看履历" />
          <el-timeline v-else-if="resumes.length > 0">
            <el-timeline-item
              v-for="r in resumes"
              :key="r.id"
              :timestamp="r.time"
              :type="resumeType(r.action)"
            >
              <strong>{{ resumeActionLabel(r.action) }}</strong>
              <span v-if="r.operator" class="ml-2 text-gray-500">操作人：{{ r.operator }}</span>
              <div v-if="r.remark" class="text-sm text-gray-600 mt-1">{{ r.remark }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无履历" />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
      <span class="text-sm text-gray-600">
        已选 <strong class="text-emerald-600">{{ selectedIds.size }}</strong> 个标签
      </span>
      <div class="flex gap-2">
        <el-button @click="showBatchGenerate = true" type="primary">
          补充生成
        </el-button>
        <el-button @click="showExportModal = true" :disabled="labels.length === 0">
          导出
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedIds.size === 0"
          @click="showBatchVoid = true"
        >
          批量作废
        </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </div>

    <!-- 新增履历弹窗 -->
    <el-dialog v-model="showAddResume" title="新增履历" width="500px" append-to-body>
      <el-form :model="resumeForm" label-width="80px">
        <el-form-item label="动作">
          <el-select v-model="resumeForm.action" placeholder="请选择">
            <el-option label="打印" value="print" />
            <el-option label="使用" value="use" />
            <el-option label="补充" value="supplement" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="resumeForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="resumeForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddResume = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAddResume">确认</el-button>
      </template>
    </el-dialog>

    <!-- 补充生成弹窗 -->
    <el-dialog v-model="showBatchGenerate" title="补充生成标签" width="500px" append-to-body>
      <el-form :model="generateForm" label-width="80px">
        <el-form-item label="生成数量">
          <el-input-number v-model="generateForm.count" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="区域名称">
          <el-input v-model="generateForm.areaName" placeholder="如：A区-1号大棚" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-input v-model="generateForm.startDate" type="date" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchGenerate = false">取消</el-button>
        <el-button type="primary" :loading="batchGenerating" @click="handleBatchGenerate">生成</el-button>
      </template>
    </el-dialog>

    <!-- 批量作废弹窗 -->
    <el-dialog v-model="showBatchVoid" title="批量作废标签" width="500px" append-to-body>
      <el-alert type="warning" :closable="false" class="mb-3">
        即将作废 <strong>{{ selectedIds.size }}</strong> 个标签，此操作不可恢复
      </el-alert>
      <el-form :model="voidForm" label-width="80px">
        <el-form-item label="作废原因" required>
          <el-input v-model="voidForm.reason" type="textarea" :rows="3" placeholder="请填写作废原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchVoid = false">取消</el-button>
        <el-button type="danger" :loading="batchVoiding" :disabled="!voidForm.reason" @click="handleBatchVoid">确认作废</el-button>
      </template>
    </el-dialog>

    <!-- 导出弹窗 -->
    <el-dialog v-model="showExportModal" title="导出标签" width="600px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportScope">
            <el-radio value="selected">已选 ({{ selectedIds.size }})</el-radio>
            <el-radio value="filtered">筛选结果 ({{ filteredLabels.length }})</el-radio>
            <el-radio value="all">全部 ({{ labels.length }})</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出字段">
          <div class="flex gap-2 mb-2">
            <el-button size="small" @click="selectAllExportFields">全选</el-button>
            <el-button size="small" @click="deselectAllExportFields">全不选</el-button>
          </div>
          <el-checkbox-group v-model="selectedExportFields">
            <el-checkbox v-for="f in exportFieldOptions" :key="f.value" :value="f.value" :label="f.label" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确认导出</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { X } from 'lucide-vue-next'
import { enhancedApiClient } from '@/lib/apiClient'

const props = defineProps({
  visible: { type: Boolean, default: false },
  seedSourceId: { type: String, required: true },
  seedSourceCode: { type: String, default: '' },
  unit: { type: String, default: '粒' },
  autoSelectLabelNumber: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'close'])

const loading = ref(false)
const searchText = ref('')
const labelPage = ref(1)
const selectedLabelId = ref(null)
const selectedLabelStatus = ref('')
const selectedIds = ref(new Set())
const labels = ref([])
const resumes = ref([])

const showAddResume = ref(false)
const resumeForm = ref({ action: 'use', operator: '', remark: '' })
const submitting = ref(false)

const showBatchGenerate = ref(false)
const generateForm = ref({ count: 10, areaName: '', startDate: '' })
const batchGenerating = ref(false)

const showBatchVoid = ref(false)
const voidForm = ref({ reason: '' })
const batchVoiding = ref(false)

const showExportModal = ref(false)
const exportScope = ref('filtered')
const selectedExportFields = ref(['labelCode', 'status', 'printCount', 'createTime'])
const exportFieldOptions = [
  { value: 'labelCode', label: '标签编号' },
  { value: 'status', label: '状态' },
  { value: 'printCount', label: '打印次数' },
  { value: 'createTime', label: '创建时间' },
  { value: 'lastPrintTime', label: '最后打印' },
  { value: 'useTime', label: '使用时间' }
]

const stats = computed(() => ({
  total: labels.value.length,
  printed: labels.value.filter(l => l.status === 'printed' || l.status === 'used').length,
  used: labels.value.filter(l => l.status === 'used').length,
  voided: labels.value.filter(l => l.status === 'voided').length
}))

const filteredLabels = computed(() => {
  if (!searchText.value) return labels.value
  return labels.value.filter(l => (l.labelCode || '').toLowerCase().includes(searchText.value.toLowerCase()))
})

const pagedLabels = computed(() => {
  const start = (labelPage.value - 1) * 20
  return filteredLabels.value.slice(start, start + 20)
})

const statusLabel = (s) => ({ pending: '待打印', printed: '已打印', used: '已使用', voided: '已作废' }[s] || s)
const statusTagType = (s) => ({ pending: 'info', printed: 'success', used: 'primary', voided: 'danger' }[s] || '')

const resumeActionLabel = (a) => ({ create: '创建', print: '打印', use: '使用', supplement: '补充', void: '作废' }[a] || a)
const resumeType = (a) => ({ create: 'primary', print: 'success', use: 'info', supplement: 'warning', void: 'danger' }[a] || '')

const labelRowClass = ({ row }) => {
  if (selectedLabelId.value === row.id) return 'bg-blue-50'
  return ''
}

const loadLabels = async () => {
  loading.value = true
  try {
    const res = await enhancedApiClient.get(`/seed-sources/${props.seedSourceId}/labels`)
    labels.value = res?.data || res?.items || []
    // 自动选中
    if (props.autoSelectLabelNumber) {
      const idx = labels.value.findIndex(l => l.labelCode === props.autoSelectLabelNumber)
      if (idx >= 0) {
        labelPage.value = Math.floor(idx / 20) + 1
        nextTick(() => {
          selectedLabelId.value = labels.value[idx].id
          selectedLabelStatus.value = labels.value[idx].status
          loadResumes()
        })
      }
    }
  } catch (e) {
    console.error('[LabelManage] 加载标签失败:', e)
  } finally {
    loading.value = false
  }
}

const loadResumes = async () => {
  if (!selectedLabelId.value) return
  try {
    const res = await enhancedApiClient.get(`/seed-sources/${props.seedSourceId}/labels/${selectedLabelId.value}/resumes`)
    resumes.value = res?.data || res?.items || []
  } catch (e) {
    console.error('[LabelManage] 加载履历失败:', e)
  }
}

const handleSelectLabel = (row) => {
  selectedLabelId.value = row.id
  selectedLabelStatus.value = row.status
  showAddResume.value = false
  loadResumes()
}

const handleSelectionChange = (rows) => {
  selectedIds.value = new Set(rows.map(r => r.id))
  if (rows.length > 1) {
    showAddResume.value = false
  }
}

const clearSelection = () => {
  selectedIds.value.clear()
}

const handleAddResume = async () => {
  if (!selectedLabelId.value) return
  submitting.value = true
  try {
    await enhancedApiClient.post(`/seed-sources/${props.seedSourceId}/labels/${selectedLabelId.value}/resumes`, resumeForm.value)
    ElMessage.success('履历已添加')
    showAddResume.value = false
    resumeForm.value = { action: 'use', operator: '', remark: '' }
    await loadResumes()
    await loadLabels()
  } catch (e) {
    ElMessage.error('添加失败')
  } finally {
    submitting.value = false
  }
}

const handleBatchGenerate = async () => {
  batchGenerating.value = true
  try {
    await enhancedApiClient.post(`/seed-sources/${props.seedSourceId}/labels/batch-generate`, generateForm.value)
    ElMessage.success(`已生成 ${generateForm.value.count} 个标签`)
    showBatchGenerate.value = false
    await loadLabels()
  } catch (e) {
    ElMessage.error('生成失败')
  } finally {
    batchGenerating.value = false
  }
}

const handleBatchVoid = async () => {
  if (!voidForm.value.reason) {
    ElMessage.warning('请填写作废原因')
    return
  }
  batchVoiding.value = true
  let success = 0, failed = 0
  for (const id of selectedIds.value) {
    try {
      await enhancedApiClient.post(`/seed-sources/${props.seedSourceId}/labels/${id}/resumes`, {
        action: 'void',
        operator: '',
        remark: voidForm.value.reason
      })
      success++
    } catch (e) {
      failed++
    }
  }
  batchVoiding.value = false
  showBatchVoid.value = false
  voidForm.value.reason = ''
  ElMessage.success(`作废完成：成功 ${success}，失败 ${failed}`)
  await loadLabels()
  if (selectedLabelId.value) await loadResumes()
}

const selectAllExportFields = () => {
  selectedExportFields.value = exportFieldOptions.map(f => f.value)
}
const deselectAllExportFields = () => {
  selectedExportFields.value = []
}

const handleConfirmExport = () => {
  if (exportScope.value === 'selected') {
    data = labels.value.filter(l => selectedIds.value.has(l.id))
  } else if (exportScope.value === 'filtered') {
    data = filteredLabels.value
  } else {
    data = labels.value
  }
  if (data.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  const headers = selectedExportFields.value
  const rows = data.map(l => headers.map(h => {
    if (h === 'status') return statusLabel(l[h])
    return l[h] || ''
  }))
  // 带 BOM 的 HTML（保证 Excel 正确识别中文）
  const html = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `种源标签_${props.seedSourceCode}_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
  showExportModal.value = false
  ElMessage.success('导出成功')
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    loadLabels()
  } else {
    selectedLabelId.value = null
    resumes.value = []
    selectedIds.value = new Set()
  }
})

onMounted(() => {
  if (props.visible) loadLabels()
})
</script>

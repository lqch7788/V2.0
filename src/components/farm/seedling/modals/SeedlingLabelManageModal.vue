<template>
  <!-- 育苗标签管理弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
    <div class="bg-white rounded-xl w-full seedling-label-dialog shadow-xl max-h-[85vh] flex flex-col">
      <!-- 标题栏（2026-07-20：添加拖拽/最大化/缩放/关闭按钮，对齐 el-dialog 头部） -->
      <div
        class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl flex-shrink-0 cursor-move"
        @mousedown="startDrag"
      >
        <h3 class="text-lg font-semibold text-white">
          育苗标签管理 - {{ seedlingCode }}
        </h3>
        <div class="flex items-center gap-1">
          <el-button circle text @click="toggleMaximize" class="!text-white hover:!bg-white/20" title="最大化/还原">
            <el-icon :size="18"><FullScreen v-if="!isMaximized" /><Aim v-else /></el-icon>
          </el-button>
          <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20" title="关闭 (Esc)">
            <el-icon :size="20"><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- readOnly 模式横幅（对齐 V1.1 L140-155） -->
      <div v-if="readOnly" class="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 flex-shrink-0">
        <el-icon :size="16" class="text-amber-600"><Lock /></el-icon>
        <span class="text-sm text-amber-700">该育苗已结束，标签管理处于<strong>只读模式</strong>（可查看、导出、打印，不可编辑）</span>
      </div>

      <!-- 主体：左侧标签列表 + 右侧履历时间线 -->
      <div class="flex-1 overflow-hidden flex">
        <!-- 左侧：标签列表（使用 LabelTable 子组件） -->
        <div class="w-1/2 border-r border-gray-200 overflow-y-auto">
          <LabelTable
            :labels="paginatedLabels"
            :selected-label-id="selectedLabelId"
            :search-text="searchText"
            :page="labelPage"
            :total-pages="labelTotalPages"
            :loading="plantLabelStore.labelsLoading"
            :selected-ids="selectedIds"
            unit="株"
            @update:search-text="handleSearchChange"
            @select-label="handleSelectLabel"
            @page-change="(p) => labelPage = p"
            @toggle-select="toggleSelectLabel"
            @toggle-select-all="toggleSelectAll"
            @clear-selection="clearSelection"
          />
        </div>

        <!-- 右侧：标签履历时间线（使用 LabelResumePanel 子组件） -->
        <div class="w-1/2 overflow-y-auto p-4">
          <LabelResumePanel
            :selected-label="selectedLabel"
            :resumes="selectedResumes"
            :loading="plantLabelStore.resumeLoading"
          />
        </div>
      </div>

      <!-- 新增履历行内表单（使用 AddResumeForm 子组件） -->
      <AddResumeForm
        v-if="showAddResume"
        :selected-label="selectedLabel"
        @submitted="handleResumeSubmitted"
        @cancel="showAddResume = false"
      />

      <!-- 补充生成小表单 -->
      <div v-if="showBatchGenerate" class="px-4 py-3 border-t border-blue-200 bg-blue-50 flex-shrink-0">
        <div class="text-xs font-semibold text-blue-900 mb-2">补充生成标签</div>
        <div class="flex flex-wrap items-center gap-2">
          <el-input
            v-model="batchCount"
            type="number"
            placeholder="生成数量"
            class="!w-24"
            size="small"
          />
          <div class="flex items-center gap-1">
            <el-input
              v-model="batchAreaName"
              type="text"
              placeholder="移入区域（如：东区-A区）"
              class="!w-40"
              size="small"
            />
            <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold cursor-help" title="该植株被种植到的具体地块位置（如：东区-A区-3号畦），非育苗温室区域">?</span>
          </div>
          <el-button size="small" type="primary" :disabled="batchGenerating" @click="handleBatchGenerate">
            {{ batchGenerating ? '生成中...' : '生成' }}
          </el-button>
          <el-button size="small" @click="showBatchGenerate = false">取消</el-button>
        </div>
      </div>

      <!-- 底部 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
        <span class="text-xs text-gray-400">
          共 {{ filteredLabels.length }} 个标签
        </span>
        <div class="flex items-center gap-2">
          <!-- 只读模式下隐藏"写"操作按钮 -->
          <template v-if="!readOnly">
            <el-button
              size="small"
              type="primary"
              :disabled="!selectedLabelId || selectedLabel?.status === 'voided' || selectedIds.size > 0"
              :title="getAddResumeTitle()"
              @click="showAddResume = !showAddResume"
            >
              <el-icon><Plus /></el-icon> 新增履历
            </el-button>
            <el-button
              size="small"
              @click="showBatchGenerate = !showBatchGenerate"
              class="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <el-icon><Plus /></el-icon> 补充生成
            </el-button>
          </template>
          <el-button
            size="small"
            @click="handleOpenExport"
            class="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
          >
            <el-icon><Download /></el-icon> 导出
          </el-button>
          <template v-if="!readOnly">
            <el-button
              size="small"
              :disabled="selectedIds.size === 0"
              :title="selectedIds.size === 0 ? '请先勾选标签' : '批量作废已选 ' + selectedIds.size + ' 个标签'"
              @click="openBatchVoid"
              class="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              <el-icon><Delete /></el-icon> 批量作废{{ selectedIds.size > 0 ? ' (' + selectedIds.size + ')' : '' }}
            </el-button>
          </template>
          <el-button size="small" @click="handleClose" class="bg-red-600 hover:bg-red-700 text-white border-red-600">
            <el-icon><Close /></el-icon> 关闭
          </el-button>
        </div>
      </div>
    </div>
  </div>

  <!-- 导出弹窗（选择字段 + 范围） -->
  <div v-if="exportModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
    <div class="bg-white rounded-xl w-full max-w-md shadow-xl">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
        <h3 class="text-base font-semibold text-white flex items-center gap-2">
          <el-icon><Download /></el-icon>
          选择导出内容
        </h3>
        <el-button circle text @click="exportModalOpen = false" class="!text-white hover:!bg-blue-700">
          <el-icon :size="16"><Close /></el-icon>
        </el-button>
      </div>
      <div class="p-4 space-y-4">
        <!-- 字段多选 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">导出字段（可多选）</span>
            <div class="flex gap-1">
              <el-button size="small" text @click="selectAllExportFields" class="text-xs text-blue-600">全选</el-button>
              <el-button size="small" text @click="deselectAllExportFields" class="text-xs text-gray-500">全不选</el-button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
            <label
              v-for="f in EXPORT_FIELDS"
              :key="f.key"
              :class="['flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm hover:bg-blue-50 transition-colors',
                selectedExportFields.has(f.key) ? 'bg-blue-50' : '']"
            >
              <el-checkbox
                :checked="selectedExportFields.has(f.key)"
                @change="toggleExportField(f.key)"
                size="small"
              />
              <span class="text-gray-700">{{ f.label }}</span>
            </label>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            已选 {{ selectedExportFields.size }} / {{ EXPORT_FIELDS.length }} 个字段
          </div>
        </div>

        <!-- 导出范围 -->
        <div>
          <span class="text-sm font-semibold text-gray-700 block mb-2">导出范围</span>
          <div class="flex gap-2">
            <label :class="['flex-1 flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors',
              exportScope === 'selected' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            ]">
              <el-radio
                v-model="exportScope"
                label="selected"
                :disabled="selectedIds.size === 0"
                size="small"
              />
              <div class="flex-1">
                <div class="text-sm text-gray-700">已选标签</div>
                <div class="text-xs text-gray-500">{{ selectedIds.size > 0 ? '共 ' + selectedIds.size + ' 条' : '请先在左侧勾选标签' }}</div>
              </div>
            </label>
            <label :class="['flex-1 flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors',
              exportScope === 'filtered' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            ]">
              <el-radio v-model="exportScope" label="filtered" size="small" />
              <div class="flex-1">
                <div class="text-sm text-gray-700">当前筛选结果</div>
                <div class="text-xs text-gray-500">共 {{ filteredLabels.length }} 条</div>
              </div>
            </label>
            <label :class="['flex-1 flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors',
              exportScope === 'currentPage' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            ]">
              <el-radio v-model="exportScope" label="currentPage" size="small" />
              <div class="flex-1">
                <div class="text-sm text-gray-700">当前页</div>
                <div class="text-xs text-gray-500">最多 20 条</div>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
        <el-button size="small" @click="exportModalOpen = false">取消</el-button>
        <el-button size="small" type="primary" @click="handleConfirmExport">
          <el-icon><Download /></el-icon> 确认导出
        </el-button>
      </div>
    </div>
  </div>

  <!-- 批量作废弹窗 -->
  <div v-if="showBatchVoid" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
    <div class="bg-white rounded-xl w-full max-w-sm shadow-xl">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl">
        <h3 class="text-base font-semibold text-white flex items-center gap-2">
          <el-icon><Delete /></el-icon>
          批量作废 {{ selectedIds.size }} 个标签
        </h3>
        <el-button circle text @click="showBatchVoid = false" class="!text-white hover:!bg-red-700">
          <el-icon :size="16"><Close /></el-icon>
        </el-button>
      </div>
      <div class="p-4 space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作废原因 *</label>
          <el-input
            v-model="batchVoidReason"
            type="text"
            placeholder="如：标签重复、植株死亡、录入错误等"
            size="small"
          />
        </div>
        <div class="text-sm text-gray-500">
          将对已选的 {{ selectedIds.size }} 个标签执行作废操作，操作后标签状态变为"已作废"且不可再添加履历。
        </div>
      </div>
      <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
        <el-button size="small" @click="showBatchVoid = false" :disabled="batchVoiding">取消</el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleBatchVoid"
          :disabled="batchVoiding || !batchVoidReason.trim()"
        >
          {{ batchVoiding ? '作废中...' : '确认作废' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Close, Download, Plus, Delete, Lock, FullScreen, Aim } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePlantLabelStore } from '@/stores'
import { useUserStore } from '@/stores/modules/user'
import { todayLocal } from '@/lib/dateUtils'
import { generateBatchLabels } from '@/api/crop'
import LabelTable from './LabelTable.vue'
import LabelResumePanel from './LabelResumePanel.vue'
import AddResumeForm from './AddResumeForm.vue'

const props = defineProps({
  visible: Boolean,
  seedlingId: String,
  seedlingCode: String,
  // 只读模式（已结束的记录禁用写操作）
  readOnly: { type: Boolean, default: false },
  // 扫码跳转时自动选中指定编号的标签
  autoSelectLabelNumber: { type: String, default: undefined }
})

const emit = defineEmits(['update:visible'])

// 2026-07-19 修复：el-dialog modelValue 变化处理
const onModelValueChange = (val) => {
  if (!val) emit('update:visible', false)
}

// 2026-07-20：拖拽/最大化支持（对齐 el-dialog 的 v-dialog-draggable/maximizable）
const isMaximized = ref(false)
const savedRect = ref({ left: 0, top: 0, width: '', height: '' })
const dragOffset = ref({ x: 0, y: 0 })

const startDrag = (e) => {
  if (isMaximized.value) return
  // 找到外层 div
  const dialogEl = e.currentTarget.closest('.fixed.inset-0 > div')
  if (!dialogEl) return
  const rect = dialogEl.getBoundingClientRect()
  dragOffset.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }

  const onMove = (ev) => {
    const newLeft = ev.clientX - dragOffset.value.x
    const newTop = ev.clientY - dragOffset.value.y
    dialogEl.style.position = 'fixed'
    dialogEl.style.left = `${newLeft}px`
    dialogEl.style.top = `${newTop}px`
    dialogEl.style.margin = '0'
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const toggleMaximize = () => {
  const dialogEl = document.querySelector('.seedling-label-dialog')
  if (!dialogEl) return
  if (!isMaximized.value) {
    savedRect.value = {
      left: dialogEl.offsetLeft,
      top: dialogEl.offsetTop,
      width: dialogEl.style.width,
      height: dialogEl.style.height
    }
    dialogEl.style.position = 'fixed'
    dialogEl.style.left = '0'
    dialogEl.style.top = '0'
    dialogEl.style.width = '100vw'
    dialogEl.style.height = '100vh'
    dialogEl.style.maxHeight = '100vh'
    dialogEl.style.borderRadius = '0'
    isMaximized.value = true
  } else {
    dialogEl.style.left = `${savedRect.value.left}px`
    dialogEl.style.top = `${savedRect.value.top}px`
    dialogEl.style.width = savedRect.value.width
    dialogEl.style.height = savedRect.value.height
    dialogEl.style.borderRadius = ''
    isMaximized.value = false
  }
}

// ---------- Store ----------
const plantLabelStore = usePlantLabelStore()
const userStore = useUserStore()

// ---------- 常量 ----------
const PAGE_SIZE = 20

// 导出可选字段（与 V1.1 一致）
const EXPORT_FIELDS = [
  { key: 'labelNumber', label: '标签编号', defaultChecked: true },
  { key: 'moveInAreaName', label: '移入位置', defaultChecked: true },
  { key: 'moveInDate', label: '移入日期', defaultChecked: true },
  { key: 'moveOutAreaName', label: '移出位置', defaultChecked: true },
  { key: 'moveOutDate', label: '移出日期', defaultChecked: true },
  { key: 'quantity', label: '数量', defaultChecked: true },
  { key: 'status', label: '状态', defaultChecked: false },
  { key: 'createTime', label: '创建时间', defaultChecked: true },
  { key: 'resumes', label: '履历记录（移入/移出/标记）', defaultChecked: false }
]

// 枚举值中文映射（导出用）
const STATUS_LABEL_MAP = {
  active: '在用',
  void: '已作废',
  printed: '已打印',
  archived: '已归档',
  disabled: '已停用'
}
const OPERATION_TYPE_MAP = {
  move_in: '移入',
  move_out: '移出',
  mark: '标记',
  void: '作废'
}
// ---------- 标签列表状态 ----------
const searchText = ref('')
const labelPage = ref(1)
const selectedLabelId = ref(null)
const selectedIds = ref(new Set())
const showAddResume = ref(false)
const showBatchVoid = ref(false)
const batchVoidReason = ref('')
const batchVoiding = ref(false)

// ---------- 补充生成状态 ----------
const showBatchGenerate = ref(false)
const batchCount = ref('10')
const batchAreaName = ref('')
const batchGenerating = ref(false)

// ---------- 自动选中 ----------
const hasAutoSelected = ref(false)

// ---------- 导出状态 ----------
const exportModalOpen = ref(false)
const selectedExportFields = ref(new Set(EXPORT_FIELDS.filter(f => f.defaultChecked).map(f => f.key)))
const exportScope = ref('filtered')

// ---------- 派生数据 ----------

// snake_case → camelCase 转换（V2.0 API 返回 snake_case，组件需 camelCase）
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    acc[camelKey] = obj[key]
    return acc
  }, {})
}

// 筛选标签
const filteredLabels = computed(() => {
  let result = plantLabelStore.labels
  // 转换 camelCase 供子组件使用
  result = result.map(toCamelCase)
  if (searchText.value) {
    result = result.filter(l =>
      l.labelNumber?.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  return result
})

// 分页
const paginatedLabels = computed(() => {
  const start = (labelPage.value - 1) * PAGE_SIZE
  return filteredLabels.value.slice(start, start + PAGE_SIZE)
})

const labelTotalPages = computed(() => Math.max(1, Math.ceil(filteredLabels.value.length / PAGE_SIZE)))

// 当前选中标签（camelCase 格式，供子组件使用）
const selectedLabel = computed(() => {
  return filteredLabels.value.find(l => l.id === selectedLabelId.value) || null
})

// 选中标签的履历
const selectedResumes = computed(() => {
  if (selectedLabelId.value === null) return []
  return plantLabelStore.resumeMap[selectedLabelId.value] || []
})

// ---------- 事件处理 ----------

// 加载标签数据
const loadLabels = async () => {
  try {
    await plantLabelStore.loadLabels({ seedling_id: props.seedlingId })
  } catch (error) {
    console.error('获取标签数据失败:', error)
  }
}

// 选择标签时加载履历
const handleSelectLabel = async (labelId) => {
  selectedLabelId.value = labelId
  await plantLabelStore.loadResumesForLabels([labelId])
}

// 多选切换
const toggleSelectLabel = (labelId) => {
  const next = new Set(selectedIds.value)
  if (next.has(labelId)) next.delete(labelId)
  else next.add(labelId)
  selectedIds.value = next
}

// 清除多选
const clearSelection = () => {
  selectedIds.value = new Set()
}

// 全选/取消当前页
const toggleSelectAll = () => {
  const pageIds = new Set(paginatedLabels.value.map(l => l.id))
  const allSelected = paginatedLabels.value.every(l => selectedIds.value.has(l.id))
  if (allSelected) {
    const next = new Set(selectedIds.value)
    pageIds.forEach(id => next.delete(id))
    selectedIds.value = next
  } else {
    selectedIds.value = new Set([...selectedIds.value, ...pageIds])
  }
}

// 搜索变化时重置分页
const handleSearchChange = (v) => {
  searchText.value = v
  labelPage.value = 1
}

// 履历提交成功回调
const handleResumeSubmitted = async () => {
  if (selectedLabelId.value !== null) {
    await plantLabelStore.loadResumesForLabels([selectedLabelId.value])
  }
  showAddResume.value = false
}

// 切换选中标签时收起表单
watch(selectedLabelId, () => {
  showAddResume.value = false
  showBatchGenerate.value = false
})

// 获取"新增履历"按钮的 title
const getAddResumeTitle = () => {
  if (selectedIds.value.size > 0) return '多选模式下请先取消勾选，再点击行选择单个标签'
  if (!selectedLabelId.value) return '请先在左侧选择标签'
  if (selectedLabel.value?.status === 'voided') return '已作废标签无法添加履历'
  return '为当前标签新增履历'
}

// ---------- 批量作废 ----------
const openBatchVoid = () => {
  if (selectedIds.value.size === 0) {
    ElMessage.warning('请先勾选要作废的标签')
    return
  }
  batchVoidReason.value = ''
  showBatchVoid.value = true
}

const handleBatchVoid = async () => {
  if (selectedIds.value.size === 0) {
    ElMessage.warning('请先勾选要作废的标签')
    return
  }
  if (!batchVoidReason.value.trim()) {
    ElMessage.warning('请填写作废原因')
    return
  }
  batchVoiding.value = true
  let success = 0
  let fail = 0
  try {
    const { enhancedApiClient } = await import('@/lib/apiClient')
    for (const labelId of selectedIds.value) {
      try {
        await enhancedApiClient.post(`/plant-labels/${labelId}/resumes`, {
          operation_type: 'void',
          operation_date: todayLocal(),
          operator_name: userStore.userInfo?.realName || 'system',
          reason: batchVoidReason.value.trim(),
          quantity_change: 0
        })
        success++
      } catch { fail++ }
    }
    ElMessage.success(`批量作废完成：成功 ${success} 个${fail > 0 ? '，失败 ' + fail + ' 个' : ''}`)
    showBatchVoid.value = false
    batchVoidReason.value = ''
    selectedIds.value = new Set()
    await loadLabels()
    if (selectedLabelId.value && selectedIds.value.has(selectedLabelId.value)) {
      selectedLabelId.value = null
    }
  } catch (e) {
    ElMessage.error('网络错误：' + (e?.message || String(e)))
  } finally {
    batchVoiding.value = false
  }
}

// ---------- 补充生成 ----------
const handleBatchGenerate = async () => {
  const count = parseInt(batchCount.value, 10)
  if (!count || count < 1) {
    ElMessage.warning('请输入有效的生成数量')
    return
  }
  batchGenerating.value = true
  try {
    const result = await generateBatchLabels({
      seedling_id: props.seedlingId,
      count,
      area_name: batchAreaName.value.trim() || undefined,
      start_date: todayLocal()
    })
    if (result) {
      const totalPrinted = result.totalPrinted ?? result.labels?.length ?? 0
      ElMessage.success(`成功生成 ${totalPrinted} 个标签`)
      await loadLabels()
      showBatchGenerate.value = false
      batchAreaName.value = ''
    } else {
      ElMessage.error('生成失败，请重试')
    }
  } catch (e) {
    ElMessage.error('网络错误：' + (e?.message || String(e)))
  } finally {
    batchGenerating.value = false
  }
}

// ---------- 导出 ----------
const handleOpenExport = () => {
  exportModalOpen.value = true
}

const toggleExportField = (key) => {
  const next = new Set(selectedExportFields.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  selectedExportFields.value = next
}

const selectAllExportFields = () => {
  selectedExportFields.value = new Set(EXPORT_FIELDS.map(f => f.key))
}

const deselectAllExportFields = () => {
  selectedExportFields.value = new Set()
}

const handleConfirmExport = async () => {
  if (selectedExportFields.value.size === 0) {
    ElMessage.warning('请至少选择一个导出字段')
    return
  }

  // 决定导出范围
  let dataSource
  if (exportScope.value === 'selected') {
    dataSource = filteredLabels.value.filter(l => selectedIds.value.has(l.id))
  } else if (exportScope.value === 'currentPage') {
    dataSource = paginatedLabels.value
  } else {
    dataSource = filteredLabels.value
  }
  if (dataSource.length === 0) {
    ElMessage.warning('无数据可导出')
    return
  }

  const selectedFields = EXPORT_FIELDS.filter(f => selectedExportFields.value.has(f.key))
  const headers = selectedFields.map(f => f.label)

  // 检查是否需要加载履历
  const needResumes = selectedExportFields.value.has('resumes')
  let resumeMapForExport = plantLabelStore.resumeMap
  if (needResumes && dataSource.length > 0) {
    const labelIds = dataSource.map(l => l.id)
    await plantLabelStore.loadResumesForLabels(labelIds)
    resumeMapForExport = plantLabelStore.resumeMap
  }

  const rows = dataSource.map((l) => {
    const resumeText = needResumes
      ? (resumeMapForExport[l.id] || [])
          .map((r) => {
            const opTypeCn = OPERATION_TYPE_MAP[r.operationType] || r.operationType || '-'
            const fromArea = r.fromAreaName || '-'
            const toArea = r.toAreaName || '-'
            const date = r.operationDate || ''
            const markName = r.markName || ''
            const qtyChange = r.quantityChange != null
              ? '(数量' + (r.quantityChange > 0 ? '+' : '') + r.quantityChange + (r.quantityAfter != null ? '->剩' + r.quantityAfter : '') + ')'
              : ''
            const reason = r.reason ? ' 备注:' + r.reason : ''
            const operator = r.operatorName ? ' 操作人:' + r.operatorName : ''
            if (r.operationType === 'mark') {
              return opTypeCn + ' ' + (markName || '-') + qtyChange + operator + reason
            }
            return opTypeCn + ' ' + fromArea + '->' + toArea + ' ' + date + qtyChange + operator + reason
          })
          .join('; ')
      : ''

    return selectedFields.map((f) => {
      switch (f.key) {
        case 'labelNumber': return l.labelNumber || ''
        case 'moveInAreaName': return l.moveInAreaName || ''
        case 'moveInDate': return l.moveInDate || ''
        case 'moveOutAreaName': return l.moveOutAreaName || ''
        case 'moveOutDate': return l.moveOutDate || ''
        case 'quantity': return l.quantity ?? ''
        case 'status': return STATUS_LABEL_MAP[l.status] || l.status || ''
        case 'createTime': return l.createTime || ''
        case 'resumes': return resumeText
        default: return ''
      }
    })
  })

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>育苗标签数据</title>
<style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px 10px}th{background:#059669;color:#fff}</style>
</head><body><table><thead><tr>${headers.map(h => '<th>' + h + '</th>').join('')}</tr></thead>
<tbody>${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}</tbody></table></body></html>`

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '育苗标签_' + props.seedlingCode + '_' + todayLocal() + '.xls'
  a.click()
  URL.revokeObjectURL(url)
  exportModalOpen.value = false
}

// ---------- 关闭 ----------
const handleClose = () => {
  emit('update:visible', false)
}

// ---------- 生命周期 ----------
watch(() => props.visible, async (val) => {
  if (val && props.seedlingId) {
    selectedLabelId.value = null
    searchText.value = ''
    labelPage.value = 1
    selectedIds.value = new Set()
    hasAutoSelected.value = false
    showAddResume.value = false
    showBatchGenerate.value = false
    await loadLabels()
  }
})

// 自动选中指定编号标签
watch([() => props.visible, () => props.autoSelectLabelNumber, filteredLabels], ([vis, autoNum, labels]) => {
  if (vis && autoNum && labels.length > 0 && !hasAutoSelected.value) {
    const idx = labels.findIndex(l => l.labelNumber === autoNum)
    if (idx !== -1) {
      hasAutoSelected.value = true
      const label = labels[idx]
      selectedLabelId.value = label.id
      labelPage.value = Math.floor(idx / PAGE_SIZE) + 1
      plantLabelStore.loadResumesForLabels([label.id])
    }
  }
}, { immediate: false })
</script>

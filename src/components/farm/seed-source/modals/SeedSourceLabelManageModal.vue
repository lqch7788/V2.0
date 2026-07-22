<!--
  种源标签管理弹窗（V1.1 1:1 重写版）
  V1.1 源文件：src/components/farm/seed-source/modals/SeedSourceLabelManageModal.tsx（643 行）
  迁移目标：1:1 保留 V1.1 所有字段、事件、数据展示、交互流程
  迁移规范：
    - V1.1 UnifiedModal → V2.0 el-dialog + 自定义绿色渐变 header
    - V1.1 LabelTable → 直接复用 @/components/farm/seedling/modals/LabelTable.vue（结构完全一致）
    - V1.1 LabelResumePanel → 直接复用 @/components/farm/seedling/modals/LabelResumePanel.vue
    - V1.1 AddResumeForm → 直接复用 @/components/farm/seedling/modals/AddResumeForm.vue
    - V1.1 showAlert → V2.0 ElMessage/ElMessageBox
    - V1.1 useAuthStore → V2.0 useUserStore（V2.0 统一用户 store）
    - V1.1 usePlantLabelStore.generateBatchLabels → V2.0 enhancedApiClient.post('/plant-labels/generate-batch')
  功能：标签列表/搜索/分页、履历（时间线+表格）、新增履历（移入/移出/打标记/作废）、
        补充生成、批量作废、导出（可选字段+可选范围）
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    width="1350px"
    top="5vh"
    :close-on-click-modal="true"
    :show-close="false"
    @close="handleClose"
  >
    <!-- 自定义绿色渐变 header 1:1 对齐 V1.1 UnifiedModal（最大化 + 关闭） -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">
          {{ `种源标签管理 - ${seedSourceCode}` }}
        </h3>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
            aria-label="最大化"
            title="最大化/还原"
            @click="toggleMaximize"
          >
            <component :is="isMaximized ? Minimize2 : Maximize2" :size="18" />
          </button>
          <button
            type="button"
            class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
            aria-label="关闭"
            @click="handleClose"
          >
            <X :size="20" />
          </button>
        </div>
      </div>
    </template>

    <!-- 主体：左侧标签列表 + 右侧履历（V1.1 1:1：UnifiedModal enableDrag/enableResize/showMaximize/size="xxxl"/showFooter={false}） -->
    <div class="flex gap-4" style="min-height: 600px">
      <!-- 左：标签列表（V1.1 LabelTable 1:1：搜索 + 多选 + 分页 + 选中行绿色高亮） -->
      <div class="w-1/2 border border-gray-200 rounded-lg overflow-hidden">
        <LabelTable
          :labels="paginatedLabels"
          :selected-label-id="selectedLabelId"
          :search-text="searchText"
          :page="labelPage"
          :total-pages="labelTotalPages"
          :loading="labelsLoading"
          :selected-ids="selectedIds"
          :unit="unit"
          @update:search-text="handleSearchChange"
          @select-label="handleSelectLabel"
          @page-change="(p) => (labelPage = p)"
          @toggle-select="toggleSelectLabel"
          @toggle-select-all="toggleSelectAll"
          @clear-selection="clearSelection"
        />
      </div>

      <!-- 右：履历面板（V1.1 LabelResumePanel 1:1：selectedLabel + resumes + loading） -->
      <div class="w-1/2 border border-gray-200 rounded-lg overflow-hidden">
        <div class="flex-1 overflow-y-auto p-3">
          <LabelResumePanel
            :selected-label="selectedLabel"
            :resumes="selectedResumes"
            :loading="resumeLoading"
          />
        </div>
      </div>
    </div>

    <!-- V1.1 1:1：新增履历表单（V1.1 用 <AddResumeForm> 组件，V2.0 直接复用 AddResumeForm.vue） -->
    <AddResumeForm
      v-if="showAddResume"
      :selected-label="selectedLabel"
      @submitted="handleResumeSubmitted"
      @cancel="showAddResume = false"
    />

    <!-- V1.1 1:1：补充生成表单（内嵌蓝色背景栏，V1.1 L430-459 1:1） -->
    <div v-if="showBatchGenerate" class="px-4 py-3 border-t border-blue-200 bg-blue-50 flex-shrink-0">
      <div class="text-xs font-semibold text-blue-900 mb-2">补充生成标签</div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="batchCount"
          type="number"
          placeholder="生成数量"
          class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-24"
        />
        <div class="flex items-center gap-1">
          <input
            v-model="batchAreaName"
            type="text"
            placeholder="区域（如：A区-1号架）"
            class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-40"
          />
          <span
            class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold cursor-help"
            title="该种源标签所在的具体仓库位置（如：A区-1号架-3层），非育苗温室区域"
          >?</span>
        </div>
        <el-button
          size="small"
          :loading="batchGenerating"
          :disabled="batchGenerating"
          class="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600"
          @click="handleBatchGenerate"
        >
          {{ batchGenerating ? '生成中...' : '生成' }}
        </el-button>
        <el-button
          size="small"
          class="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
          @click="showBatchGenerate = false"
        >
          取消
        </el-button>
      </div>
    </div>

    <!-- V1.1 1:1：底部操作栏（5 个按钮：新增履历 / 补充生成 / 导出 / 批量作废 / 关闭） -->
    <div class="mt-4 p-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
      <span class="text-xs text-gray-400">
        共 {{ filteredLabels.length }} 个标签
      </span>
      <div class="flex items-center gap-2">
        <!-- V1.1 1:1：新增履历按钮 disabled 逻辑 -->
        <el-button
          size="small"
          :disabled="!selectedLabelId || selectedLabel?.status === 'voided' || selectedIds.size > 0"
          :title="selectedIds.size > 0 ? '多选模式下请先取消勾选，再点击行选择单个标签' : !selectedLabelId ? '请先在左侧选择标签' : selectedLabel?.status === 'voided' ? '已作废标签无法添加履历' : '为当前标签新增履历'"
          @click="showAddResume = !showAddResume"
        >
          <el-icon><Plus /></el-icon>
          新增履历
        </el-button>
        <!-- V1.1 1:1：补充生成按钮 -->
        <el-button
          size="small"
          class="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600"
          @click="showBatchGenerate = !showBatchGenerate"
        >
          <el-icon><Plus /></el-icon>
          补充生成
        </el-button>
        <!-- V1.1 1:1：导出按钮 -->
        <el-button
          size="small"
          class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-emerald-600"
          @click="handleOpenExport"
        >
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <!-- V1.1 1:1：批量作废按钮（带计数 + title 提示） -->
        <el-button
          size="small"
          class="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
          :disabled="selectedIds.size === 0"
          :title="selectedIds.size === 0 ? '请先勾选标签' : `批量作废已选 ${selectedIds.size} 个标签`"
          @click="handleOpenBatchVoid"
        >
          <el-icon><Trash2 /></el-icon>
          批量作废{{ selectedIds.size > 0 ? ` (${selectedIds.size})` : '' }}
        </el-button>
        <!-- V1.1 1:1：关闭按钮（红色实色 + X 图标） -->
        <el-button
          size="small"
          class="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
          @click="handleClose"
        >
          <el-icon><X /></el-icon>
          关闭
        </el-button>
      </div>
    </div>

    <!-- V1.1 1:1：导出弹窗（蓝色 header + 字段多选 + 范围 radio） -->
    <el-dialog
      v-model="exportModalOpen"
      :show-close="false"
      width="500px"
      append-to-body
    >
      <template #header>
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-white flex items-center gap-2">
            <el-icon><Download /></el-icon>
            选择导出内容
          </h3>
          <button type="button" class="text-white hover:bg-blue-700 rounded p-1 transition-colors" @click="exportModalOpen = false">
            <X :size="18" />
          </button>
        </div>
      </template>
      <div class="space-y-4">
        <!-- V1.1 1:1：导出字段（多选 + 全选/全不选） -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">导出字段（可多选）</span>
            <div class="flex gap-1">
              <el-button size="small" link type="primary" @click="selectAllExportFields">全选</el-button>
              <el-button size="small" link @click="deselectAllExportFields">全不选</el-button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
            <label
              v-for="f in EXPORT_FIELDS"
              :key="f.key"
              :class="['flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm hover:bg-blue-50 transition-colors',
                selectedExportFields.has(f.key) ? 'bg-blue-50' : '']"
            >
              <input
                type="checkbox"
                :checked="selectedExportFields.has(f.key)"
                class="w-4 h-4 text-blue-600 rounded"
                @change="toggleExportField(f.key)"
              />
              <span class="text-gray-700">{{ f.label }}</span>
            </label>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            已选 {{ selectedExportFields.size }} / {{ EXPORT_FIELDS.length }} 个字段
          </div>
        </div>

        <!-- V1.1 1:1：导出范围（已选 / 当前筛选 / 当前页） -->
        <div>
          <span class="text-sm font-semibold text-gray-700 block mb-2">导出范围</span>
          <div class="flex gap-2">
            <label :class="['flex-1 flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors',
              exportScope === 'selected' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50']">
              <input
                type="radio"
                name="exportScope"
                :checked="exportScope === 'selected'"
                :disabled="selectedIds.size === 0"
                class="w-4 h-4 text-blue-600"
                @change="exportScope = 'selected'"
              />
              <div class="flex-1">
                <div class="text-sm text-gray-700">已选标签</div>
                <div class="text-xs text-gray-500">{{ selectedIds.size > 0 ? `共 ${selectedIds.size} 条` : '请先在左侧勾选标签' }}</div>
              </div>
            </label>
            <label :class="['flex-1 flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors',
              exportScope === 'filtered' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50']">
              <input
                type="radio"
                name="exportScope"
                :checked="exportScope === 'filtered'"
                class="w-4 h-4 text-blue-600"
                @change="exportScope = 'filtered'"
              />
              <div class="flex-1">
                <div class="text-sm text-gray-700">当前筛选结果</div>
                <div class="text-xs text-gray-500">共 {{ filteredLabels.length }} 条</div>
              </div>
            </label>
            <label :class="['flex-1 flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors',
              exportScope === 'currentPage' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50']">
              <input
                type="radio"
                name="exportScope"
                :checked="exportScope === 'currentPage'"
                class="w-4 h-4 text-blue-600"
                @change="exportScope = 'currentPage'"
              />
              <div class="flex-1">
                <div class="text-sm text-gray-700">当前页</div>
                <div class="text-xs text-gray-500">最多 {{ PAGE_SIZE }} 条</div>
              </div>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="exportModalOpen = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">
          <el-icon><Download /></el-icon>
          确认导出
        </el-button>
      </template>
    </el-dialog>

    <!-- V1.1 1:1：批量作废弹窗（红色 header + 作废原因 textarea + 提示） -->
    <el-dialog
      v-model="showBatchVoid"
      :show-close="false"
      width="500px"
      append-to-body
    >
      <template #header>
        <div class="bg-gradient-to-r from-red-500 to-red-600 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-white flex items-center gap-2">
            <el-icon><Trash2 /></el-icon>
            批量作废 {{ selectedIds.size }} 个标签
          </h3>
          <button type="button" class="text-white hover:bg-red-700 rounded p-1 transition-colors" @click="showBatchVoid = false">
            <X :size="18" />
          </button>
        </div>
      </template>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作废原因 <span class="text-red-500">*</span></label>
          <input
            v-model="batchVoidReason"
            type="text"
            placeholder="如：标签重复、录入错误等"
            class="px-3 py-2 border border-gray-400 rounded-lg text-sm w-full"
          />
        </div>
        <div class="text-sm text-gray-500">
          将对已选的 {{ selectedIds.size }} 个标签执行作废操作，操作后标签状态变为"已作废"且不可再添加履历。
        </div>
      </div>
      <template #footer>
        <el-button :disabled="batchVoiding" @click="showBatchVoid = false">取消</el-button>
        <el-button
          type="danger"
          :loading="batchVoiding"
          :disabled="batchVoiding || !batchVoidReason.trim()"
          @click="handleBatchVoid"
        >
          {{ batchVoiding ? '作废中...' : '确认作废' }}
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
/**
 * 种源标签管理弹窗 — 编排层
 * 2026-07-01: 从育苗标签管理弹窗适配，支持种源标签全生命周期管理
 * 功能：标签列表/搜索/分页、履历（时间线+表格）、新增履历（移入/移出/打标记/作废）、
 *        补充生成、批量作废、导出（可选字段+可选范围）
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { X, Download, Plus, Trash2, Maximize2, Minimize2 } from 'lucide-vue-next'
import { todayLocal } from '@/lib/dateUtils'
import { enhancedApiClient } from '@/lib/apiClient'
import { usePlantLabelStore } from '@/stores/modules/plantLabel'
import { useUserStore } from '@/stores/modules/user'
// 复用 V1.1 1:1 三个组件（结构与 V1.1 完全一致）
import LabelTable from '@/components/farm/seedling/modals/LabelTable.vue'
import LabelResumePanel from '@/components/farm/seedling/modals/LabelResumePanel.vue'
import AddResumeForm from '@/components/farm/seedling/modals/AddResumeForm.vue'

// V1.1 1:1：分页大小
const PAGE_SIZE = 20

// V1.1 1:1：导出可选字段（labelNumber/moveInAreaName/moveInDate/moveOutAreaName/moveOutDate/quantity/status/createTime/resumes）
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

// V1.1 1:1：状态中文映射
const STATUS_LABEL_MAP = {
  active: '在用',
  void: '已作废',
  voided: '已作废',
  printed: '已打印',
  archived: '已归档',
  disabled: '已停用'
}

// V1.1 1:1：履历操作类型中文映射
const OPERATION_TYPE_MAP = {
  move_in: '移入',
  move_out: '移出',
  mark: '标记',
  void: '作废'
}

const props = defineProps({
  // V1.1 props 1:1
  isOpen: { type: Boolean, default: false },
  seedSourceId: { type: String, required: true },
  seedSourceCode: { type: String, default: '' },
  /** 标签单位（默认"粒"，种源可能为"粒/颗/kg"等） */
  unit: { type: String, default: '粒' },
  /** 扫码跳转时自动选中指定编号的标签 */
  autoSelectLabelNumber: { type: String, default: '' },
  /** 只读模式（V1.1 props 中存在，V2.0 保留以对齐 1:1） */
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'update:isOpen', 'success'])

// V1.1 1:1：Store 解构（V1.1 usePlantLabelStore 提供 labels/labelsLoading/resumeMap/resumeLoading/loadLabels/loadResumesForLabels）
const {
  labels,
  labelsLoading,
  resumeMap,
  resumeLoading,
  loadLabels,
  loadResumesForLabels
} = usePlantLabelStore()

// V1.1 1:1：当前登录用户（V1.1 用 useAuthStore，V2.0 用 useUserStore 替代）
const userStore = useUserStore()
const currentUser = computed(() => userStore.userInfo || userStore.currentUser || {})

// V1.1 1:1：el-dialog 双向绑定
const dialogVisible = computed({
  get: () => props.isOpen,
  set: (v) => emit('update:isOpen', v)
})

// ---------- V1.1 1:1：标签列表状态 ----------
const searchText = ref('')
const labelPage = ref(1)
const selectedLabelId = ref(null)
const selectedIds = ref(new Set())
const showAddResume = ref(false)
const showBatchVoid = ref(false)
const batchVoidReason = ref('')
const batchVoiding = ref(false)

// ---------- V1.1 1:1：补充生成状态 ----------
const showBatchGenerate = ref(false)
const batchCount = ref('10')
const batchAreaName = ref('')
const batchGenerating = ref(false)

// ---------- V1.1 1:1：导出弹窗状态 ----------
const exportModalOpen = ref(false)
const selectedExportFields = ref(
  new Set(EXPORT_FIELDS.filter((f) => f.defaultChecked).map((f) => f.key))
)
const exportScope = ref('filtered') // 'selected' | 'filtered' | 'currentPage'

// ---------- V1.1 1:1：弹窗最大化状态（顶部 header 按钮触发） ----------
const isMaximized = ref(false)
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

// ---------- V1.1 1:1：自动选中 ref（扫码跳转，仅执行一次） ----------
const hasAutoSelected = ref(false)

// ---------- V1.1 1:1：打开弹窗时加载标签 ----------
watch(
  () => props.isOpen,
  (val) => {
    if (val && props.seedSourceId) {
      loadLabels({ seedSourceId: props.seedSourceId })
      hasAutoSelected.value = false
    }
  }
)

// ---------- V1.1 1:1：自动选中指定编号标签 ----------
watch(
  [() => props.isOpen, () => props.autoSelectLabelNumber, labels],
  () => {
    if (props.isOpen && props.autoSelectLabelNumber && labels.value.length > 0 && !hasAutoSelected.value) {
      const idx = labels.value.findIndex((l) => l.labelNumber === props.autoSelectLabelNumber)
      if (idx !== -1) {
        hasAutoSelected.value = true
        const label = labels.value[idx]
        selectedLabelId.value = label.id
        labelPage.value = Math.floor(idx / PAGE_SIZE) + 1
        loadResumesForLabels([label.id])
      }
    }
  }
)

// ---------- V1.1 1:1：派生数据 ----------
// V1.1 L126: const seedSourceLabels = labels
const seedSourceLabels = labels

// V1.1 L128-133: filteredLabels
const filteredLabels = computed(() => {
  if (!searchText.value) return seedSourceLabels.value
  const q = searchText.value.toLowerCase()
  return seedSourceLabels.value.filter((l) =>
    (l.labelNumber || '').toLowerCase().includes(q)
  )
})

// V1.1 L135-138: paginatedLabels
const paginatedLabels = computed(() => {
  const start = (labelPage.value - 1) * PAGE_SIZE
  return filteredLabels.value.slice(start, start + PAGE_SIZE)
})

// V1.1 L140: labelTotalPages
const labelTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredLabels.value.length / PAGE_SIZE))
)

// V1.1 L142-144: selectedLabel
const selectedLabel = computed(() =>
  seedSourceLabels.value.find((l) => l.id === selectedLabelId.value)
)

// V1.1 L146-149: selectedResumes
const selectedResumes = computed(() => {
  if (selectedLabelId.value === null) return []
  return resumeMap.value[selectedLabelId.value] || []
})

// ---------- V1.1 1:1：事件处理 ----------
// V1.1 L152-158: handleSelectLabel
const handleSelectLabel = async (labelId) => {
  selectedLabelId.value = labelId
  await loadResumesForLabels([labelId])
}

// V1.1 L160-167: toggleSelectLabel
const toggleSelectLabel = (labelId) => {
  const next = new Set(selectedIds.value)
  if (next.has(labelId)) next.delete(labelId)
  else next.add(labelId)
  selectedIds.value = next
}

// V1.1 L169: clearSelection
const clearSelection = () => {
  selectedIds.value = new Set()
}

// V1.1 L171-183: toggleSelectAll
const toggleSelectAll = () => {
  const pageIds = new Set(paginatedLabels.value.map((l) => l.id))
  const allSelected = paginatedLabels.value.every((l) => selectedIds.value.has(l.id))
  if (allSelected) {
    const next = new Set(selectedIds.value)
    pageIds.forEach((id) => next.delete(id))
    selectedIds.value = next
  } else {
    selectedIds.value = new Set([...selectedIds.value, ...pageIds])
  }
}

// V1.1 L186-220: handleBatchVoid（核心逻辑 1:1 — 逐个 POST /plant-labels/:id/resumes）
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
    for (const labelId of selectedIds.value) {
      try {
        await enhancedApiClient.post(`/plant-labels/${labelId}/resumes`, {
          operation_type: 'void',
          operation_date: todayLocal(),
          operator_name: currentUser.value?.realName || 'system',
          reason: batchVoidReason.value.trim(),
          quantity_change: 0
        })
        success++
      } catch {
        fail++
      }
    }
    ElMessage.success(`批量作废完成：成功 ${success} 个${fail > 0 ? `，失败 ${fail} 个` : ''}`)
    showBatchVoid.value = false
    batchVoidReason.value = ''
    selectedIds.value = new Set()
    await loadLabels({ seedSourceId: props.seedSourceId })
    if (selectedLabelId.value && selectedIds.value.has(selectedLabelId.value)) {
      selectedLabelId.value = null
    }
  } catch (e) {
    console.error('[SeedSourceLabelManageModal] 批量作废失败:', e)
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.error('网络错误：' + msg)
  } finally {
    batchVoiding.value = false
  }
}

// V1.1 L222-225: handleSearchChange
const handleSearchChange = (v) => {
  searchText.value = v
  labelPage.value = 1
}

// V1.1 L228-231: 切换标签时收起表单
watch(selectedLabelId, () => {
  showAddResume.value = false
  showBatchGenerate.value = false
})

// V1.1 L234-239: handleResumeSubmitted
const handleResumeSubmitted = async () => {
  if (selectedLabelId.value !== null) {
    await loadResumesForLabels([selectedLabelId.value])
  }
  showAddResume.value = false
}

// ---------- V1.1 1:1：导出 ----------
// V1.1 L242: handleOpenExport
const handleOpenExport = () => {
  exportModalOpen.value = true
}

// V1.1 L244-251: toggleExportField
const toggleExportField = (key) => {
  const next = new Set(selectedExportFields.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  selectedExportFields.value = next
}

// V1.1 L253-255: selectAllExportFields
const selectAllExportFields = () => {
  selectedExportFields.value = new Set(EXPORT_FIELDS.map((f) => f.key))
}

// V1.1 L257-259: deselectAllExportFields
const deselectAllExportFields = () => {
  selectedExportFields.value = new Set()
}

// V1.1 L498-502: handleOpenBatchVoid（V1.1 1:1：打开前校验 + 清空原因）
const handleOpenBatchVoid = () => {
  if (selectedIds.value.size === 0) {
    ElMessage.warning('请先勾选要作废的标签')
    return
  }
  batchVoidReason.value = ''
  showBatchVoid.value = true
}

// V1.1 L261-342: handleConfirmExport（核心逻辑 1:1 — 数据源选择 + 字段映射 + 履历拼接 + Blob 下载）
const handleConfirmExport = async () => {
  if (selectedExportFields.value.size === 0) {
    ElMessage.warning('请至少选择一个导出字段')
    return
  }

  let dataSource
  if (exportScope.value === 'selected') {
    dataSource = filteredLabels.value.filter((l) => selectedIds.value.has(l.id))
  } else if (exportScope.value === 'currentPage') {
    dataSource = paginatedLabels.value
  } else {
    dataSource = filteredLabels.value
  }
  if (dataSource.length === 0) {
    ElMessage.warning('无数据可导出')
    return
  }

  const selectedFields = EXPORT_FIELDS.filter((f) => selectedExportFields.value.has(f.key))
  const headers = selectedFields.map((f) => f.label)

  const needResumes = selectedExportFields.value.has('resumes')
  let resumeMapForExport = resumeMap.value
  if (needResumes && dataSource.length > 0) {
    const labelIds = dataSource.map((l) => l.id)
    await loadResumesForLabels(labelIds)
    // 重新读取 Pinia store 的最新 resumeMap
    resumeMapForExport = usePlantLabelStore().resumeMap
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
            const qtyChange =
              r.quantityChange != null
                ? `(数量${r.quantityChange > 0 ? '+' : ''}${r.quantityChange}${
                    r.quantityAfter != null ? `→剩${r.quantityAfter}` : ''
                  })`
                : ''
            const reason = r.reason ? ` 备注:${r.reason}` : ''
            const operator = r.operatorName ? ` 操作人:${r.operatorName}` : ''
            if (r.operationType === 'mark') {
              return `${opTypeCn} ${markName || '-'}${qtyChange}${operator}${reason}`
            }
            return `${opTypeCn} ${fromArea}→${toArea} ${date}${qtyChange}${operator}${reason}`
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

  // V1.1 L329-332: HTML 表格模板（带绿色表头 #059669）
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>种源标签数据</title>
<style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px 10px}th{background:#059669;color:#fff}</style>
</head><body><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`

  // V1.1 L334: 带 BOM 的 Blob（Excel 正确识别中文）
  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `种源标签_${props.seedSourceCode}_${todayLocal()}.xls`
  a.click()
  URL.revokeObjectURL(url)
  exportModalOpen.value = false
}

// ---------- V1.1 1:1：补充生成 ----------
// V1.1 L345-372: handleBatchGenerate（核心逻辑 1:1 — store.generateBatchLabels → V2.0 enhancedApiClient POST /plant-labels/generate-batch）
const handleBatchGenerate = async () => {
  const count = parseInt(batchCount.value, 10)
  if (!count || count < 1) {
    ElMessage.warning('请输入有效的生成数量')
    return
  }
  batchGenerating.value = true
  try {
    // V1.1 L350-356: store.generateBatchLabels 调用
    // V2.0 适配：直接走 enhancedApiClient POST /plant-labels/generate-batch（V2.0 plantLabel.js store 中尚未封装此方法）
    const result = await enhancedApiClient.post('/plant-labels/generate-batch', {
      seed_source_id: props.seedSourceId,
      count,
      area_name: batchAreaName.value.trim() || undefined,
      start_date: todayLocal()
    })
    if (result && (result.totalPrinted || result.labels || result)) {
      const totalPrinted = result.totalPrinted || count
      ElMessage.success(`成功生成 ${totalPrinted} 个标签`)
      await loadLabels({ seedSourceId: props.seedSourceId })
      showBatchGenerate.value = false
      batchAreaName.value = ''
    } else {
      ElMessage.error('生成失败，请重试')
    }
  } catch (e) {
    console.error('[SeedSourceLabelManageModal] 补充生成失败:', e)
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.error('网络错误：' + msg)
  } finally {
    batchGenerating.value = false
  }
}

// ---------- V1.1 1:1：关闭 ----------
// V1.1 L375-376: if (!isOpen) return null → V2.0 el-dialog 自动处理
const handleClose = () => {
  emit('close')
  emit('update:isOpen', false)
}

// 兼容 V1.1 onSuccess 回调（V2.0 emit('success')）
const emitSuccess = () => emit('success')

// 暴露方法给父组件（V2.0 兼容）
defineExpose({ emitSuccess })
</script>

<style scoped>
/* V1.1 1:1：保留默认 Tailwind 样式（V1.1 中所有样式来自 Tailwind className，无需额外 CSS） */
</style>
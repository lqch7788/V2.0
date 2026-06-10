<!--
  采购计划数据表格组件
  1:1 翻译自 V1.1 src/components/purchasePlan/PurchasePlanTable.tsx
  包含：模式感知工具栏、排序、选择、展开行（物料明细）、逾期预警、归档状态、分页
-->
<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 工具栏 - 与生产模块按钮风格 1:1 对齐 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">采购计划列表</h3>
      <div v-if="isInMode" class="flex gap-2">
        <!-- 批量编辑模式（按钮 variant=blue 与 V1.1 L180-181 1:1 对齐） -->
        <template v-if="batchEditMode">
          <button :class="btnBlue" @click="handleBatchEditConfirm">
            <Edit class="w-4 h-4" />
            编辑
          </button>
          <button :class="btnSecondary" @click="$emit('batchEditCancel')">
            取消
          </button>
        </template>
        <!-- 批量删除模式 -->
        <template v-if="batchDeleteMode">
          <button
            :class="btnDestructive"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDeleteConfirm"
          >
            <Trash2 class="w-4 h-4" />
            删除
          </button>
          <button :class="btnSecondary" @click="$emit('batchDeleteCancel')">
            取消
          </button>
        </template>
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <button :class="btnDefault" @click="$emit('exportConfirm')">
            <Download class="w-4 h-4" />
            确认导出
          </button>
          <button :class="btnSecondary" @click="$emit('exportCancel')">
            取消
          </button>
        </template>
      </div>
      <div v-else class="flex gap-2">
        <button v-if="canCreate" :class="btnDefault" @click="$emit('create')">
          <Plus class="w-4 h-4" />
          新增
        </button>
        <button v-if="canEdit" :class="btnBlue" @click="$emit('batchEdit')">
          <Edit class="w-4 h-4" />
          编辑
        </button>
        <button v-if="canDelete" :class="btnDestructive" @click="$emit('batchDelete')">
          <Trash2 class="w-4 h-4" />
          删除
        </button>
        <button v-if="canExport" :class="btnDefault" @click="$emit('export')">
          <Download class="w-4 h-4" />
          导出
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <!-- 展开按钮列 - 非导出/批量模式时显示 -->
            <th
              v-if="!isInMode"
              class="px-2 py-3 text-left text-sm font-semibold whitespace-nowrap w-10"
            ></th>
            <!-- checkbox 列 - 导出/批量模式时显示 -->
            <th
              v-if="isInMode"
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12"
            >
              <el-checkbox
                :model-value="isAllSelected"
                @change="$emit('selectAll')"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采购申请批次号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">关联生产批次</th>
            <th
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10"
              @click="$emit('sortChange', 'purchaseType')"
            >
              采购类型<span v-if="sortConfig?.field === 'purchaseType'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10"
              @click="$emit('sortChange', 'applicant')"
            >
              申请人<span v-if="sortConfig?.field === 'applicant'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请部门</th>
            <th
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10"
              @click="$emit('sortChange', 'applyDate')"
            >
              申请日期<span v-if="sortConfig?.field === 'applyDate'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10"
              @click="$emit('sortChange', 'requiredDate')"
            >
              需求日期<span v-if="sortConfig?.field === 'requiredDate'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10"
              @click="$emit('sortChange', 'priority')"
            >
              优先级<span v-if="sortConfig?.field === 'priority'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10"
              @click="$emit('sortChange', 'status')"
            >
              状态<span v-if="sortConfig?.field === 'status'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <!-- ✅ 修复 P0-1: 补"执行状态"列（V1.1 L288 1:1 翻译） -->
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">执行状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <template v-for="plan in paginatedData" :key="plan.id">
            <tr :class="rowClass(plan)">
              <!-- 展开/折叠按钮 - 非导出/批量模式时显示 -->
              <td v-if="!isInMode" class="px-2 py-3 w-10">
                <button
                  :class="btnGhost + ' p-1 text-gray-500 hover:text-gray-700'"
                  :title="expandedRows.has(plan.id) ? '折叠' : '展开'"
                  @click="$emit('toggleExpand', plan.id)"
                >
                  <component :is="expandedRows.has(plan.id) ? ArrowDown : ArrowRight" class="w-4 h-4" />
                </button>
              </td>
              <!-- checkbox - 导出/批量模式时显示 -->
              <td v-if="isInMode" class="px-4 py-3">
                <el-checkbox
                  :model-value="selectedRows.includes(plan.purchaseApplicationCode)"
                  :disabled="isRowDisabled(plan)"
                  @change="$emit('selectRow', plan.purchaseApplicationCode)"
                />
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <button
                  :class="btnGhost + ' text-blue-600 hover:text-blue-800'"
                  title="点击查看详情"
                  @click="$emit('viewDetail', plan)"
                >
                  {{ plan.purchaseApplicationCode }}
                </button>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ plan.relatedBatchCode || '不关联批次' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.purchaseTypeName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.applicant }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.applicantDepartment }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.applyDate }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.requiredDate }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', priorityClass(plan.priority)]">
                  {{ plan.priorityText }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', statusClass(plan.status)]">
                  {{ plan.statusText }}
                </span>
                <!-- 逾期预警标记 -->
                <span
                  v-if="getOverdueAlert(plan).level !== 'normal'"
                  :class="['inline-flex items-center ml-1 px-1.5 py-0.5 rounded text-xs font-medium', overdueAlertClass(getOverdueAlert(plan).level)]"
                >
                  {{ getOverdueAlert(plan).level === 'overdue' ? '🔴逾期' : '⚠️将到期' }}
                </span>
              </td>
              <!-- ✅ 修复 P0-1: 补"执行状态"列（V1.1 L350-352 1:1 翻译） -->
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', executionStatusClass(plan.executionStatus)]">
                  {{ executionStatusText(plan.executionStatus) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <!-- V1.1 L372-394 1:1 翻译：归档状态(completed/cancelled)禁用编辑/删除，显示"已归档" -->
                  <template v-if="plan.executionStatus !== 'completed' && plan.executionStatus !== 'cancelled'">
                    <button
                      :class="btnGhost + ' text-blue-600 hover:text-blue-800 p-1'"
                      title="编辑"
                      @click="$emit('edit', plan)"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      :class="btnGhost + ' text-red-600 hover:text-red-800 p-1'"
                      title="删除"
                      @click="handleDeleteClick(plan)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </template>
                  <span
                    v-else
                    class="text-xs text-gray-400"
                  >已归档</span>
                </div>
              </td>
            </tr>
            <!-- 展开的物料明细行 -->
            <tr v-if="expandedRows.has(plan.id)" class="bg-blue-50/50">
              <!-- ✅ 修复 P0-1: colspan=12（V1.1 L389 colSpan=12，V2.0 加"执行状态"列后保持 12 列） -->
              <td :colspan="12" class="px-4 py-4">
                <div class="text-sm font-medium text-gray-700 mb-3">
                  物料明细（共 {{ plan.items?.length || 0 }} 项）
                </div>
                <!--
                  ✅ 修复 P1-2: 用共享 MaterialItemsTable 组件替换 V2.0 内联实现
                  1:1 对齐 V1.1 L403 <MaterialItemsTable items={plan.items || []} headerTheme="emerald" />
                -->
                <MaterialItemsTable
                  :items="plan.items || []"
                  mode="view"
                  header-theme="emerald"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- 选择状态栏 - 仅在导出/批量模式下显示 -->
      <div
        v-if="isInMode"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <button :class="btnGhost + ' text-blue-600 hover:text-blue-800'" @click="$emit('selectAll')">
            {{ selectedRows.length === filteredAndSortedData.length ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :page-size-options="[10, 20, 50, 100]"
        :show-page-size="true"
        @page-change="(p) => $emit('pageChange', p)"
        @page-size-change="(s) => $emit('pageSizeChange', s)"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * 采购计划数据表格组件
 * 1:1 翻译自 V1.1 PurchasePlanTable.tsx
 * - props: 14 个（data, currentPage, pageSize, selectedRows, exportMode, batchEditMode,
 *          batchDeleteMode, sortConfig, expandedRows, filteredAndSortedData,
 *          canCreate, canEdit, canDelete, canExport）
 * - emits: 18 个（toggleExpand, selectAll, selectRow, sortChange, pageChange,
 *          pageSizeChange, viewDetail, edit, delete, create, batchEdit,
 *          batchDelete, export, exportConfirm, exportCancel, batchEditConfirm,
 *          batchEditCancel, batchDeleteConfirm, batchDeleteCancel）
 */
import { computed } from 'vue'
import { Plus, Pencil, Trash2, Download, ArrowDown, ArrowRight, Edit } from 'lucide-vue-next'
import { calculateOverdueAlert } from '@/types/purchase'
import { showAlert, showConfirm } from '@/lib/dialogService'
// 与生产模块共享按钮样式常量
import { btnDefault, btnSecondary, btnDestructive, btnBlue, btnGhost } from '@/views/production/constants/buttonStyles'
import Pagination from '@/components/ui/Pagination/Pagination.vue'
// ✅ 修复 P1-2: 引入共享的物料明细表格组件（V1.1 1:1 翻译）
import MaterialItemsTable from './MaterialItemsTable.vue'

/**
 * @typedef {Object} PurchasePlan
 * @property {string} id
 * @property {string} purchaseApplicationCode
 * @property {string} [relatedBatchCode]
 * @property {string} purchaseType
 * @property {string} purchaseTypeName
 * @property {string} applicant
 * @property {string} applicantDepartment
 * @property {string} applyDate
 * @property {string} requiredDate
 * @property {string} priority
 * @property {string} priorityText
 * @property {string} status
 * @property {string} statusText
 * @property {Array<any>} [items]
 *
 * @typedef {Object} SortConfig
 * @property {string} field
 * @property {'asc'|'desc'} direction
 */

const props = defineProps({
  /** 数据（已筛选+排序的完整列表） */
  data: { type: Array, required: true },
  /** 当前页码 */
  currentPage: { type: Number, default: 1 },
  /** 每页大小 */
  pageSize: { type: Number, default: 10 },
  /** 选中行的 purchaseApplicationCode 集合 */
  selectedRows: { type: Array, default: () => [] },
  /** 导出模式 */
  exportMode: { type: Boolean, default: false },
  /** 批量编辑模式 */
  batchEditMode: { type: Boolean, default: false },
  /** 批量删除模式 */
  batchDeleteMode: { type: Boolean, default: false },
  /** 排序配置 */
  sortConfig: { type: Object, default: null },
  /** 展开行 id 集合 */
  expandedRows: { type: Set, default: () => new Set() },
  /** 全选/禁用判定用的全集（已筛选+排序） */
  filteredAndSortedData: { type: Array, default: () => [] },
  /** 工具栏权限 */
  canCreate: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true }
})

const emit = defineEmits([
  'toggleExpand', 'selectAll', 'selectRow', 'sortChange',
  'pageChange', 'pageSizeChange', 'viewDetail', 'edit', 'delete',
  'create', 'batchEdit', 'batchDelete', 'export',
  'exportConfirm', 'exportCancel',
  'batchEditConfirm', 'batchEditCancel',
  'batchDeleteConfirm', 'batchDeleteCancel'
])

/** 是否处于任一特殊模式（导出/批量编辑/批量删除） */
const isInMode = computed(() => props.exportMode || props.batchEditMode || props.batchDeleteMode)

/** 全选 checkbox 状态：所有可选行都被选中时为 true */
const isAllSelected = computed(() =>
  props.selectedRows.length === props.filteredAndSortedData.length && props.filteredAndSortedData.length > 0
)

/** 总页数 */
const totalPages = computed(() =>
  Math.ceil(props.filteredAndSortedData.length / props.pageSize) || 1
)

/** 当前页数据（V1.1 由表格内部做分页切片，保持一致） */
const paginatedData = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return props.data.slice(start, end)
})

/**
 * 行 class：在批量编辑/删除模式下，已归档（completed/cancelled 按 executionStatus）行显示为灰色
 * ✅ 修复 P0-6: 归档条件改用 executionStatus
 * @param {PurchasePlan} plan
 * @returns {string}
 */
function rowClass(plan) {
  const isArchived = plan.executionStatus === 'completed' || plan.executionStatus === 'cancelled'
  const inBatch = props.batchEditMode || props.batchDeleteMode
  if (inBatch && isArchived) {
    return 'transition-colors bg-gray-100 hover:bg-gray-100'
  }
  return 'transition-colors hover:bg-blue-50'
}

/**
 * 行是否在批量模式下被禁用（不允许选择）
 * ✅ 修复 P0-6: 归档条件改用 executionStatus
 * @param {PurchasePlan} plan
 * @returns {boolean}
 */
function isRowDisabled(plan) {
  // V1.1 1:1 翻译：批量编辑/删除模式下，已归档行 checkbox 禁用
  // executionStatus='completed'/'cancelled' 视为归档
  if (!(props.batchEditMode || props.batchDeleteMode)) return false
  return plan.executionStatus === 'completed' || plan.executionStatus === 'cancelled'
}

/**
 * 优先级 Badge class（V1.1 一致配色）
 * @param {string} priority
 * @returns {string}
 */
function priorityClass(priority) {
  if (priority === 'urgent') return 'bg-red-100 text-red-700'
  if (priority === 'high') return 'bg-orange-100 text-orange-700'
  if (priority === 'normal') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

/**
 * 状态 Badge class（V1.1 PURCHASE_STATUS_STYLE 1:1 对齐）
 * @param {string} status
 * @returns {string}
 */
function statusClass(status) {
  if (status === 'draft') return 'bg-gray-100 text-gray-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'approved') return 'bg-blue-100 text-blue-700'
  if (status === 'purchasing') return 'bg-purple-100 text-purple-700'
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

/**
 * 执行状态 Badge class（V1.1 ExecutionStatusBadge 1:1 翻译）
 * @param {string} executionStatus
 * @returns {string}
 */
function executionStatusClass(executionStatus) {
  if (executionStatus === 'completed') return 'bg-green-100 text-green-700'
  if (executionStatus === 'purchasing') return 'bg-purple-100 text-purple-700'
  if (executionStatus === 'pending_execution') return 'bg-amber-100 text-amber-700'
  if (executionStatus === 'cancelled') return 'bg-gray-100 text-gray-600'
  return 'bg-amber-100 text-amber-700'
}

/**
 * 执行状态显示文本（V1.1 PURCHASE_EXECUTION_STATUS_TEXT 1:1 翻译）
 * @param {string} executionStatus
 * @returns {string}
 */
function executionStatusText(executionStatus) {
  if (executionStatus === 'completed') return '已完成'
  if (executionStatus === 'purchasing') return '采购中'
  if (executionStatus === 'cancelled') return '已取消'
  return '待执行'  // pending_execution 或未设置
}

/**
 * 逾期预警样式映射（内联，对应 V1.1 OVERDUE_ALERT_STYLE）
 */
const OVERDUE_ALERT_STYLE = {
  normal: { bg: '', text: '' },
  warning: { bg: 'bg-orange-100', text: 'text-orange-700' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700' }
}

/**
 * 计算逾期预警
 * @param {PurchasePlan} plan
 */
function getOverdueAlert(plan) {
  return calculateOverdueAlert(plan)
}

/**
 * 逾期预警 Badge class
 * @param {string} level
 * @returns {string}
 */
function overdueAlertClass(level) {
  const style = OVERDUE_ALERT_STYLE[level] || OVERDUE_ALERT_STYLE.normal
  return `${style.bg} ${style.text}`.trim()
}

/**
 * 批量编辑确认：选中行数为 0 时提示
 */
async function handleBatchEditConfirm() {
  if (props.selectedRows.length === 0) {
    await showAlert('请先选择要编辑的数据')
    return
  }
  emit('batchEditConfirm')
}

/**
 * 批量删除确认：选中行数为 0 时提示
 */
async function handleBatchDeleteConfirm() {
  if (props.selectedRows.length === 0) {
    await showAlert('请先选择要删除的数据')
    return
  }
  emit('batchDeleteConfirm')
}

/**
 * 行内删除按钮：直接 emit，由父组件 PurchasePlanPage 统一弹出 DeleteWarningModal
 * @param {PurchasePlan} plan
 */
function handleDeleteClick(plan) {
  emit('delete', plan)
}
</script>

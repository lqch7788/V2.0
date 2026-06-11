<!--
  @file 采购计划详情弹窗 - 1:1 翻译自 V1.1 PlanDetailModal.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\PlanDetailModal.tsx
  @description 采购申请单详情：字段网格 + 物料明细表格 + 可选审批记录
-->
<template>
  <!-- ✅ 修复 P1-1: 1:1 对齐 V1.1 PlanDetailModal.tsx L243-244 width=900 height=600 -->
  <ElModal
    :model-value="visible"
    title="采购申请单详情"
    :width="900"
    :height="600"
    
    @update:model-value="(v) => !v && handleClose()"
    @close="handleClose"
  >
    <div v-if="selectedPlanDetail" class="space-y-4">
      <!-- 字段网格（1:1 V1.1 fields 6 行 2 列 + 物料明细全宽行）-->
      <div class="grid grid-cols-2 gap-x-6 gap-y-3">
        <!-- 行 1 -->
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">采购申请批次号：</span>
          <span class="text-sm text-gray-900 font-medium">{{ selectedPlanDetail.purchaseApplicationCode }}</span>
        </div>
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">采购类型：</span>
          <span class="text-sm text-gray-900">{{ selectedPlanDetail.purchaseTypeName || selectedPlanDetail.purchaseType }}</span>
        </div>

        <!-- 行 2 -->
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">关联生产批次号：</span>
          <span class="text-sm text-gray-900">{{ selectedPlanDetail.relatedBatchCode || '不关联批次' }}</span>
        </div>
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">申请人：</span>
          <span class="text-sm text-gray-900">{{ selectedPlanDetail.applicant }}</span>
        </div>

        <!-- 行 3 -->
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">申请部门：</span>
          <span class="text-sm text-gray-900">{{ selectedPlanDetail.applicantDepartment }}</span>
        </div>
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">申请日期：</span>
          <span class="text-sm text-gray-900">{{ selectedPlanDetail.applyDate }}</span>
        </div>

        <!-- 行 4 -->
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">需求日期：</span>
          <span class="text-sm text-gray-900">{{ selectedPlanDetail.requiredDate }}</span>
        </div>
        <div class="flex items-center">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">优先级：</span>
          <span
            :class="[
              'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
              priorityBadgeClass(selectedPlanDetail.priority),
            ]"
          >
            {{ selectedPlanDetail.priorityText || selectedPlanDetail.priority }}
          </span>
        </div>

        <!-- 行 5 -->
        <div class="flex items-center">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">状态：</span>
          <span
            :class="[
              'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
              statusBadgeClass(selectedPlanDetail.status),
            ]"
          >
            {{ selectedPlanDetail.statusText || selectedPlanDetail.status }}
          </span>
        </div>
        <div class="flex">
          <span class="text-sm text-gray-500 w-32 flex-shrink-0">备注：</span>
          <span class="text-sm text-gray-900">{{ selectedPlanDetail.remark || selectedPlanDetail.remarks || '-' }}</span>
        </div>

        <!-- ✅ 修复 P0-2: 行 5.5 执行状态（V1.1 L130-172 1:1 翻译，含编辑 UI） -->
        <div class="flex items-center col-span-2">
          <template v-if="!editingExec">
            <span
              :class="[
                'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                executionStatusClass(currentExecutionStatus),
              ]"
            >
              {{ executionStatusText(currentExecutionStatus) }}
            </span>
            <el-button link size="small" class="ml-2" :disabled="saving" @click="handleStartEditExec">
              <el-icon><EditPen /></el-icon>
            </el-button>
          </template>
          <template v-else>
            <el-select
              v-model="newExecStatus"
              size="small"
              style="width: 180px"
              :disabled="saving"
            >
              <el-option
                v-for="o in EXEC_OPTIONS"
                :key="o.value"
                :label="o.label"
                :value="o.value"
              />
            </el-select>
            <button
              class="ml-2 h-8 px-4 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="saving"
              @click="handleSaveExec"
            >
              {{ saving ? '保存中…' : '保存' }}
            </button>
            <button
              class="ml-1 h-8 px-4 rounded-md text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="saving"
              @click="editingExec = false"
            >
              取消
            </button>
          </template>
        </div>

        <!-- 行 6: 物料明细 (全宽) -->
        <!-- ✅ 修复 P-H + P-J: 1:1 翻译 V1.1 PlanDetailModal.tsx L177-183
             之前 V2.0 内联实现缺 blue 主题表头 + 重复 11 列定义
             修复后用 MaterialItemsTable 共享组件，蓝色渐变表头（与 V1.1 一致）-->
        <div class="col-span-2">
          <div class="flex items-start">
            <span class="text-sm text-gray-500 w-32 flex-shrink-0 pt-1">物料明细：</span>
            <div class="w-full">
              <div
                v-if="selectedPlanDetail.items && selectedPlanDetail.items.length > 0"
                class="mt-1 overflow-auto max-h-80 rounded-lg border border-gray-300 bg-white"
              >
                <div style="min-width: 1600px">
                  <MaterialItemsTable
                    :items="selectedPlanDetail.items"
                    mode="view"
                    header-theme="blue"
                  />
                </div>
              </div>
              <span v-else class="text-gray-400">暂无物料明细</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 审批记录卡片（1:1 翻译 V1.1 renderApprovalRecords） -->
      <div
        v-if="approvalRecords && approvalRecords.length > 0"
        class="mt-4 bg-purple-50 rounded-xl p-4"
      >
        <h4 class="text-sm font-medium text-purple-600 mb-3 flex items-center gap-2">
          <el-icon><Clock /></el-icon>
          审批记录
        </h4>
        <div class="space-y-3">
          <div
            v-for="(record, index) in approvalRecords"
            :key="index"
            class="flex items-start gap-3 p-2 bg-white rounded-lg"
          >
            <div
              :class="[
                'w-2 h-2 rounded-full mt-2',
                record.action === 'approve'
                  ? 'bg-emerald-500'
                  : record.action === 'reject'
                  ? 'bg-red-500'
                  : 'bg-gray-400',
              ]"
            />
            <div class="flex-1">
              <p class="text-sm text-gray-900">
                <span class="font-medium">{{ record.approverName }}</span>
                <span class="text-gray-500 mx-1">
                  {{
                    record.action === 'approve'
                      ? '通过了申请'
                      : record.action === 'reject'
                      ? '拒绝了申请'
                      : record.action === 'partially_approve'
                      ? '部分通过了'
                      : '操作了'
                  }}
                </span>
              </p>
              <p v-if="record.comment" class="text-xs text-gray-500 mt-1">
                备注：{{ record.comment }}
              </p>
              <p class="text-xs text-gray-400 mt-1">{{ record.actionTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          class="h-8 px-4 rounded-md text-sm bg-gray-100 text-gray-900 hover:bg-gray-200"
          @click="handleClose"
        >
          关闭
        </button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * @file PlanDetailModal.vue
 * @description 采购计划详情弹窗 - 1:1 翻译自 V1.1 PlanDetailModal.tsx
 *              展示采购申请单详情字段 + 物料明细表格 + 可选审批记录
 *              修复 P0-2: 补可编辑执行状态 UI
 *              修复 P0-3: approvalRecords prop 已在父组件传递，此处接收
 *              修复 P0-4: 调用 apiUpdateExecutionStatus
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\PlanDetailModal.tsx
 */
import { ref, computed } from 'vue'
import { ElModal } from '@/components/ui'
import { Clock, EditPen } from '@element-plus/icons-vue'
import { PURCHASE_EXECUTION_STATUS_OPTIONS, PURCHASE_EXECUTION_STATUS_STYLE, PURCHASE_EXECUTION_STATUS_TEXT } from '@/types/purchase'
import { updateExecutionStatus as apiUpdateExecutionStatus } from '@/services/apiPurchasePlanService'
import { showAlert } from '@/lib/dialogService'
// ✅ 修复 P-H: 复用物料明细共享组件（V1.1 PlanDetailModal.tsx L177-183 1:1 翻译）
import MaterialItemsTable from './MaterialItemsTable.vue'

// ==================== JSDoc 类型定义 ====================

/**
 * 采购计划主体（来自后端 /purchase-plans）
 * @typedef {import('@/types/purchase').PurchasePlan} PurchasePlan
 */

/**
 * 审批记录单条
 * @typedef {Object} ApprovalRecord
 * @property {string} approverName     审批人姓名
 * @property {'approve'|'reject'|'partially_approve'|string} action  操作类型
 * @property {string} [comment]        备注
 * @property {string} actionTime       操作时间
 */

// ==================== Props (完整定义，匹配 V1.1) ====================

const props = defineProps({
  /** 弹窗显示状态 */
  visible: {
    type: Boolean,
    default: false,
  },
  /** 当前查看的采购计划详情 */
  selectedPlanDetail: {
    type: Object,
    default: null,
  },
  /** 审批记录（可选）- V1.1 PlanDetailModal.tsx L28 1:1 */
  approvalRecords: {
    type: Array,
    default: () => [],
  },
})

// ==================== Emits ====================

/**
 * @event close 关闭弹窗
 * @event execution-status-changed 执行状态更新成功回调（让父组件刷新列表）
 */
const emit = defineEmits(['close', 'update:visible', 'execution-status-changed'])

// ==================== Badge 样式映射（1:1 V1.1 PriorityBadge/StatusBadge） ====================

/**
 * 优先级 Badge 样式（1:1 翻译 V1.1 PriorityBadge）
 * @param {string} priority
 * @returns {string}
 */
function priorityBadgeClass(priority) {
  if (priority === 'urgent') return 'bg-red-100 text-red-700'
  if (priority === 'high') return 'bg-orange-100 text-orange-700'
  if (priority === 'normal') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

/**
 * 状态 Badge 样式（1:1 翻译 V1.1 StatusBadge L52-63）
 * V1.1 配色：rejected=红, pending=琥珀, approved=蓝, 其他=灰
 * @param {string} status
 * @returns {string}
 */
function statusBadgeClass(status) {
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'approved') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

// ==================== ✅ 修复 P0-2: 执行状态编辑（V1.1 L75-106 1:1 翻译） ====================

/** 4 档下拉选项 */
const EXEC_OPTIONS = PURCHASE_EXECUTION_STATUS_OPTIONS

/** 是否处于编辑态 */
const editingExec = ref(false)

/** 保存中（按钮 loading） */
const saving = ref(false)

/** 正在编辑的值 */
const newExecStatus = ref('pending_execution')

/** 当前展示的执行状态（props 变化时自动重算） */
const currentExecutionStatus = computed(() => {
  return props.selectedPlanDetail?.executionStatus || 'pending_execution'
})

/** Tailwind class（从 PURCHASE_EXECUTION_STATUS_STYLE 拼出） */
function executionStatusClass(status) {
  const style = PURCHASE_EXECUTION_STATUS_STYLE[status] || PURCHASE_EXECUTION_STATUS_STYLE.pending_execution
  return `${style.bg} ${style.text}`
}

/** 显示文本 */
function executionStatusText(status) {
  return PURCHASE_EXECUTION_STATUS_TEXT[status] || '待执行'
}

/** 点击编辑图标 */
function handleStartEditExec() {
  newExecStatus.value = currentExecutionStatus.value
  editingExec.value = true
}

/** 保存：调用 updateExecutionStatus API */
async function handleSaveExec() {
  if (newExecStatus.value === currentExecutionStatus.value) {
    editingExec.value = false
    return
  }
  saving.value = true
  try {
    const updated = await apiUpdateExecutionStatus(props.selectedPlanDetail.id, newExecStatus.value)
    if (updated) {
      emit('execution-status-changed', updated)
    }
    editingExec.value = false
  } catch (err) {
    showAlert('更新执行状态失败: ' + (err && err.message ? err.message : err))
  } finally {
    saving.value = false
  }
}

// ==================== 关闭 ====================

function handleClose() {
  emit('update:visible', false)
  emit('close')
}
</script>

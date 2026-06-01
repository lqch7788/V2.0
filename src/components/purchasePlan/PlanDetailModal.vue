<!--
  @file 采购计划详情弹窗 - 1:1 翻译自 V1.1 PlanDetailModal.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\PlanDetailModal.tsx
  @description 采购申请单详情：字段网格 + 物料明细表格 + 可选审批记录
-->
<template>
  <el-dialog
    :model-value="visible"
    title="采购申请单详情"
    width="900px"
    :destroy-on-close="false"
    @close="handleClose"
    @update:model-value="(v) => !v && handleClose()"
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

        <!-- 行 6: 物料明细 (全宽) -->
        <div class="col-span-2">
          <div class="flex items-start">
            <span class="text-sm text-gray-500 w-32 flex-shrink-0 pt-1">物料明细：</span>
            <div class="w-full">
              <div
                v-if="selectedPlanDetail.items && selectedPlanDetail.items.length > 0"
                class="mt-1 overflow-auto max-h-80 rounded-lg border border-gray-300 bg-white"
              >
                <div style="min-width: 1600px">
                  <table class="w-full bg-white rounded-lg overflow-hidden text-xs">
                    <thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        <th class="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap">物料编码</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap">物料名称</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap">分类</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap">规格型号</th>
                        <th class="px-2 py-2 text-center text-xs font-semibold whitespace-nowrap">单位</th>
                        <th class="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap">数量</th>
                        <th class="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap">预估单价</th>
                        <th class="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap">小计</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap">供应商</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap">用途说明</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap">备注</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr
                        v-for="item in selectedPlanDetail.items"
                        :key="item.id"
                        class="hover:bg-gray-50"
                      >
                        <td class="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {{ item.materialCode || '-' }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-900 font-medium whitespace-nowrap">
                          {{ item.materialName || '-' }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {{ item.category || '-' }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {{ item.specification || '-' }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 text-center whitespace-nowrap">
                          {{ item.unit || '-' }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 text-right whitespace-nowrap">
                          {{ item.quantity }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 text-right whitespace-nowrap">
                          ¥{{ (item.estimatedPrice || 0).toFixed(2) }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 text-right whitespace-nowrap">
                          ¥{{ (item.estimatedTotalPrice || 0).toLocaleString() }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {{ item.supplier || '-' }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {{ item.purpose || '-' }}
                        </td>
                        <td class="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {{ item.remark || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * @file PlanDetailModal.vue
 * @description 采购计划详情弹窗 - 1:1 翻译自 V1.1 PlanDetailModal.tsx
 *              展示采购申请单详情字段 + 物料明细表格 + 可选审批记录
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\PlanDetailModal.tsx
 */
import { Clock } from '@element-plus/icons-vue'

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
  /** 审批记录（可选） */
  approvalRecords: {
    type: Array,
    default: () => [],
  },
})

// ==================== Emits ====================

/**
 * @event close 关闭弹窗
 */
const emit = defineEmits(['close', 'update:visible'])

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
 * 状态 Badge 样式（1:1 翻译 V1.1 StatusBadge）
 * @param {string} status
 * @returns {string}
 */
function statusBadgeClass(status) {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'purchasing') return 'bg-purple-100 text-purple-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'approved') return 'bg-blue-100 text-blue-700'
  if (status === 'draft') return 'bg-gray-100 text-gray-700'
  return 'bg-red-100 text-red-700'
}

// ==================== 关闭 ====================

function handleClose() {
  emit('update:visible', false)
  emit('close')
}
</script>

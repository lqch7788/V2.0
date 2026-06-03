<template>
  <!--
    @file BatchDetailModal.vue
    @description 生产批次详情弹窗 - 1:1 翻译 V1.1 BatchDetailModal.tsx
                 V1.1 是单段 + 底部审批记录布局，本版本已恢复 1:1
    @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\production\modals\BatchDetailModal.tsx
    @fix P0-001: 删除 V2.0 自创的 3-Tab 结构
    @fix P0-001-EX: 删除 V2.0 自创的"关联记录"Tab
    @fix P0-002-EX: 删除 V2.0 自创的"生长进度"进度条
  -->
  <ElModal
    v-model="visible"
    title="批次详情"
    size="xl"
    :show-submit="false"
    :show-cancel="false"
    @close="handleClose"
  >
    <div v-if="batch" class="space-y-4 modal-form-inputs">
      <!--
        基本信息：14 个字段，2 列 grid，1:1 对应 V1.1 DetailField[][] 配置
        V1.1 L98-127
      -->
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(field, i) in basicInfoFields" :key="i">
          <label class="text-xs text-gray-600 block mb-1 text-center">{{ field.label }}</label>
          <p
            class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700"
            v-html="field.value"
          />
        </div>
      </div>

      <!--
        审批记录：V1.1 通过 DetailModal 的 bottom slot 渲染
        V1.1 L198-212 bottom={<div>...renderApprovalRecords()</div>}
        本版本在基本信息下方用 border-t 分隔，与 V1.1 视觉一致
      -->
      <div class="border-t pt-4">
        <div class="text-sm font-medium text-gray-700 mb-3">审批记录</div>
        <div v-if="loadingApprovals" class="text-center text-gray-500 py-4">加载中...</div>
        <div v-else-if="approvals.length === 0" class="text-center text-gray-400 py-4">暂无审批记录</div>
        <div v-else class="space-y-4">
          <div v-for="approval in approvals" :key="approval.id" class="mb-4">
            <!-- 审批单概要 -->
            <div class="flex items-center gap-3 mb-2 text-sm flex-wrap">
              <span class="font-medium text-gray-700">{{ approval.title || approval.code }}</span>
              <span
                :class="getApprovalStatusClass(approval.status)"
                class="px-2 py-0.5 rounded text-xs"
              >
                {{ approvalStatusLabels[approval.status] || approval.status }}
              </span>
              <span class="text-gray-400">第{{ approval.currentStep }}/{{ approval.totalSteps }}步</span>
              <span class="text-gray-400">提交时间：{{ formatDateTime(approval.createdAt) }}</span>
            </div>
            <!-- 审批记录列表 -->
            <div v-if="approval.records && approval.records.length > 0" class="space-y-2 pl-4 border-l-2 border-gray-200">
              <div
                v-for="(record, idx) in approval.records"
                :key="record.id || idx"
                class="flex flex-wrap items-start gap-x-4 gap-y-1 text-sm"
              >
                <span class="text-gray-500 min-w-[140px]">{{ formatDateTime(record.actionTime) }}</span>
                <span class="text-gray-700">{{ record.approverName }}</span>
                <span
                  :class="getActionTextClass(record.action)"
                  class="font-medium"
                >
                  {{ actionLabels[record.action] || record.action }}
                </span>
                <span v-if="record.comment" class="text-gray-500 w-full pl-32">理由：{{ record.comment }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 pl-4 border-l-2 border-gray-200">尚未有审批操作</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
          @click="handleClose"
        >关闭</button>
        <button
          v-if="onViewWorkOrders"
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="onViewWorkOrders"
        >查看工单</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * @file BatchDetailModal.vue - 1:1 翻译 V1.1 BatchDetailModal.tsx
 * @description 批次详情弹窗，使用 ElModal + 单段 + 底部审批记录
 *              P0-001: 恢复 V1.1 单段布局（删除 3-Tab）
 *              P0-001-EX: 删除"关联记录"Tab
 *              P0-002-EX: 删除"生长进度"进度条
 */
import { computed, ref, watch } from 'vue'
import { ElModal } from '@/components/ui'
import {
  batchStatusColors,
  batchStatusLabels,
  SEED_BREEDING_MODES,
  SEEDLING_MODES,
  PLANTING_MODES
} from '../constants'
import { getProductionPlanApprovals } from '@/services/productionPlanService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  batch: { type: Object, default: null },
  onViewWorkOrders: { type: Function, default: null }
})

const emit = defineEmits(['update:modelValue', 'close'])

// 弹窗可见性 - 1:1 对应 V1.1 `isOpen={!!batch}` + onClose
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

// 审批记录 - 1:1 对应 V1.1 renderApprovalRecords
const approvals = ref([])
const loadingApprovals = ref(false)

// 审批操作类型中文映射 - 1:1 对应 V1.1 L20-25
const actionLabels = {
  approve: '通过',
  reject: '拒绝',
  partially_approve: '部分通过',
  cancel: '撤销'
}

// 审批状态中文映射 - 1:1 对应 V1.1 L28-34
const approvalStatusLabels = {
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已撤销',
  partially_approved: '部分通过'
}

// 种植模式中文映射 - 1:1 对应 V1.1 L70-76
const allModes = [...SEED_BREEDING_MODES, ...SEEDLING_MODES, ...PLANTING_MODES]
const modeMap = Object.fromEntries(allModes.map(m => [m.value, m.label]))
const plantingModeLabel = computed(() => {
  if (!props.batch?.plantingMode) return '-'
  return String(props.batch.plantingMode)
    .split(',')
    .map(v => modeMap[v.trim()] || v.trim())
    .filter(Boolean)
    .join('、') || '-'
})

// 单位中文映射 - 1:1 对应 V1.1 L79-87
const unitLabels = {
  kg: '公斤',
  t: '吨',
  '株': '株',
  '粒': '粒',
  '袋': '袋',
  'm²': '平方米',
  '亩': '亩'
}
const unitLabel = computed(() => unitLabels[props.batch?.unit] || props.batch?.unit || '公斤')

// 状态 Badge - 1:1 对应 V1.1 L91-95
const statusBadge = computed(() => {
  const status = props.batch?.batchStatus || 'draft'
  return `<span class="inline-flex px-2 py-1 rounded-lg text-sm font-medium ${batchStatusColors[status]}">${batchStatusLabels[status]}</span>`
})

// 14 个基本字段 - 1:1 对应 V1.1 DetailField[][] L98-127（7 行 × 2 列）
const basicInfoFields = computed(() => {
  if (!props.batch) return []
  const b = props.batch
  return [
    { label: '批次编号', value: b.batchCode || '-' },
    { label: '种植模式', value: plantingModeLabel.value },
    { label: '作物名称', value: b.cropName || '-' },
    { label: '作物品种', value: b.variety || '-' },
    { label: '种植区域', value: b.greenhouseName || '-' },
    { label: '种植面积', value: `${b.plantingArea || ''} ${b.plantingAreaUnit || 'm²'}`.trim() },
    { label: '开始时间', value: b.startDate || '-' },
    { label: '预计结束时间', value: b.expectedHarvestDate || '-' },
    { label: '负责人', value: b.responsiblePerson || '-' },
    { label: '目标产量', value: b.targetYield != null ? `${b.targetYield} ${unitLabel.value}` : '-' },
    { label: '当前状态', value: statusBadge.value },
    { label: '发布人', value: b.publisher || '-' },
    { label: '初次发布时间', value: b.publishDate || '-' },
    { label: '最后修改时间', value: b.lastModifyDate || '-' }
  ]
})

// 加载审批记录 - 1:1 对应 V1.1 loadApprovals L47-58
watch(() => props.batch, async (batch) => {
  if (batch) {
    loadingApprovals.value = true
    try {
      const result = await getProductionPlanApprovals(batch.id)
      approvals.value = result || []
    } catch (error) {
      console.error('加载审批记录失败:', error)
      approvals.value = []
    } finally {
      loadingApprovals.value = false
    }
  } else {
    approvals.value = []
  }
}, { immediate: true })

// 格式化时间 - 1:1 对应 V1.1 formatDateTime L63-68
function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 审批状态样式 - 1:1 对应 V1.1 L144-149
function getApprovalStatusClass(status) {
  if (status === 'approved') return 'bg-green-100 text-green-700'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

// 审批动作样式 - 1:1 对应 V1.1 L163-167
function getActionTextClass(action) {
  if (action === 'approve') return 'text-green-600'
  if (action === 'reject') return 'text-red-600'
  return 'text-gray-600'
}

function handleClose() {
  emit('close')
}
</script>

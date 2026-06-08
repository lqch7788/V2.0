<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <!-- 单行布局：8 字段均布（flex-1），2 按钮固定宽度在右（shrink-0） -->
    <div class="flex flex-nowrap gap-3 items-end">
      <!-- 关联生产批次 -->
      <div class="flex-1 min-w-0">
        <label class="text-sm font-medium text-gray-700 block mb-1">关联生产批次</label>
        <el-input
          :model-value="relatedBatchCode"
          @update:model-value="(v) => $emit('relatedBatchCodeChange', v)"
          placeholder="请输入"
        />
      </div>
      <!-- 申请人 -->
      <div class="flex-1 min-w-0">
        <label class="text-sm font-medium text-gray-700 block mb-1">申请人</label>
        <el-input
          :model-value="applicant"
          @update:model-value="(v) => $emit('applicantChange', v)"
          placeholder="请输入"
        />
      </div>
      <!-- 申请部门 -->
      <div class="flex-1 min-w-0">
        <label class="text-sm font-medium text-gray-700 block mb-1">申请部门</label>
        <el-input
          :model-value="applicantDepartment"
          @update:model-value="(v) => $emit('applicantDepartmentChange', v)"
          placeholder="请输入"
        />
      </div>
      <!-- 优先级 -->
      <div class="flex-1 min-w-0">
        <label class="text-sm font-medium text-gray-700 block mb-1">优先级</label>
        <el-select
          :model-value="priority"
          @update:model-value="(v) => $emit('priorityChange', v)"
          placeholder="全部"
          style="width: 100%"
        >
          <el-option label="全部" value="all" />
          <el-option label="紧急" value="urgent" />
          <el-option label="高" value="high" />
          <el-option label="中" value="normal" />
          <el-option label="低" value="low" />
        </el-select>
      </div>
      <!-- 状态 -->
      <div class="flex-1 min-w-0">
        <label class="text-sm font-medium text-gray-700 block mb-1">状态</label>
        <el-select
          :model-value="status"
          @update:model-value="(v) => $emit('statusChange', v)"
          placeholder="全部"
          style="width: 100%"
        >
          <el-option label="全部" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="采购中" value="purchasing" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
      <!-- 预警状态 -->
      <div class="flex-1 min-w-0">
        <label class="text-gray-700 text-sm block mb-1">预警状态</label>
        <el-select
          :model-value="alertFilter"
          @update:model-value="(v) => $emit('alertFilterChange', v)"
          placeholder="全部"
          style="width: 100%"
        >
          <el-option label="全部" value="all" />
          <el-option label="已逾期" value="overdue" />
          <el-option label="即将到期" value="warning" />
        </el-select>
      </div>
      <!-- 需求开始日期 -->
      <div class="flex-1 min-w-0">
        <label class="text-sm font-medium text-gray-700 block mb-1">需求开始日期</label>
        <el-date-picker
          :model-value="requiredStartDate"
          @update:model-value="(v) => $emit('requiredStartDateChange', v)"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>
      <!-- 需求结束日期 -->
      <div class="flex-1 min-w-0">
        <label class="text-sm font-medium text-gray-700 block mb-1">需求结束日期</label>
        <el-date-picker
          :model-value="requiredEndDate"
          @update:model-value="(v) => $emit('requiredEndDateChange', v)"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>
      <!-- 操作按钮（固定宽度，不参与字段均布，固定在最右） - 与技术方案 TechSolutionFilters 1:1 对齐 -->
      <div class="flex gap-2 items-end shrink-0">
        <button :class="btnDefault" @click="$emit('reset')">
          重置
        </button>
        <button :class="btnDefault" @click="$emit('search')">
          <Search class="w-4 h-4" />
          搜索
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 采购计划筛选表单组件
 * 1:1 翻译自 V1.1 src/components/purchasePlan/PurchasePlanFilters.tsx
 * 按钮/图标样式与技术方案 TechSolutionFilters 1:1 对齐
 */
import { Search } from 'lucide-vue-next'
// 与技术方案共享按钮样式常量
import { btnDefault } from '@/views/production/constants/buttonStyles'

/**
 * @typedef {Object} PurchasePlanFiltersProps
 * @property {string} relatedBatchCode - 关联生产批次
 * @property {string} purchaseType - 采购类型（V1.1 props 中保留以保持字段集合一致）
 * @property {string} status - 状态
 * @property {string} alertFilter - 预警状态
 * @property {string} applicant - 申请人
 * @property {string} applicantDepartment - 申请部门
 * @property {string} priority - 优先级
 * @property {string} requiredStartDate - 需求开始日期
 * @property {string} requiredEndDate - 需求结束日期
 */

defineProps({
  /** @type {import('vue').PropType<string>} */
  relatedBatchCode: { type: String, default: '' },
  /** @type {import('vue').PropType<string>} */
  purchaseType: { type: String, default: '' },
  /** @type {import('vue').PropType<string>} */
  status: { type: String, default: 'all' },
  /** @type {import('vue').PropType<string>} */
  alertFilter: { type: String, default: 'all' },
  /** @type {import('vue').PropType<string>} */
  applicant: { type: String, default: '' },
  /** @type {import('vue').PropType<string>} */
  applicantDepartment: { type: String, default: '' },
  /** @type {import('vue').PropType<string>} */
  priority: { type: String, default: 'all' },
  /** @type {import('vue').PropType<string>} */
  requiredStartDate: { type: String, default: '' },
  /** @type {import('vue').PropType<string>} */
  requiredEndDate: { type: String, default: '' }
})

defineEmits([
  'relatedBatchCodeChange',
  'purchaseTypeChange',
  'statusChange',
  'alertFilterChange',
  'applicantChange',
  'applicantDepartmentChange',
  'priorityChange',
  'requiredStartDateChange',
  'requiredEndDateChange',
  'reset',
  'search'
])
</script>

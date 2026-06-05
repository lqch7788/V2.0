<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 关联生产批次 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700">关联生产批次</label>
        <el-input
          :model-value="relatedBatchCode"
          @update:model-value="(v) => $emit('relatedBatchCodeChange', v)"
          placeholder="请输入"
        />
      </div>
      <!-- 申请人 -->
      <div class="min-w-[90px]">
        <label class="text-gray-700">申请人</label>
        <el-input
          :model-value="applicant"
          @update:model-value="(v) => $emit('applicantChange', v)"
          placeholder="请输入"
        />
      </div>
      <!-- 申请部门 -->
      <div class="min-w-[90px]">
        <label class="text-gray-700">申请部门</label>
        <el-input
          :model-value="applicantDepartment"
          @update:model-value="(v) => $emit('applicantDepartmentChange', v)"
          placeholder="请输入"
        />
      </div>
      <!-- 优先级 -->
      <div class="min-w-[70px]">
        <label class="text-gray-700">优先级</label>
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
      <div class="min-w-[90px]">
        <label class="text-gray-700">状态</label>
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
      <div class="min-w-[100px]">
        <label class="text-gray-700">预警状态</label>
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
      <div class="min-w-[110px]">
        <label class="text-gray-700">需求开始日期</label>
        <el-date-picker
          :model-value="requiredStartDate"
          @update:model-value="(v) => $emit('requiredStartDateChange', v)"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>
      <!-- 需求结束日期 -->
      <div class="min-w-[110px]">
        <label class="text-gray-700">需求结束日期</label>
        <el-date-picker
          :model-value="requiredEndDate"
          @update:model-value="(v) => $emit('requiredEndDateChange', v)"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>
      <!-- 操作按钮（V1.1 button.tsx 无 variant = default 但实际渲染绿 outline 风格） -->
      <div class="flex gap-2 items-end ml-auto">
        <el-button size="small" plain type="success" @click="$emit('reset')">重置</el-button>
        <el-button size="small" plain type="success" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 采购计划筛选表单组件
 * 1:1 翻译自 V1.1 src/components/purchasePlan/PurchasePlanFilters.tsx
 */
import { Search } from '@element-plus/icons-vue'

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

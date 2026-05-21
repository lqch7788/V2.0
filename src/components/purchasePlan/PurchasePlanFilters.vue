<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 关联批次号 -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">关联批次号</label>
        <el-input
          :model-value="relatedBatchCode"
          @update:model-value="$emit('relatedBatchCodeChange', $event)"
          placeholder="请输入关联批次号"
          clearable
        />
      </div>

      <!-- 采购类型 -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">采购类型</label>
        <el-select
          :model-value="purchaseType"
          @update:model-value="$emit('purchaseTypeChange', $event)"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option label="全部" value="全部" />
          <el-option label="生产物资采购" value="生产物资采购" />
          <el-option label="紧急采购" value="紧急采购" />
          <el-option label="常规采购" value="常规采购" />
          <el-option label="劳保用品" value="劳保用品" />
          <el-option label="通用物资" value="通用物资" />
          <el-option label="设备采购" value="设备采购" />
          <el-option label="其他" value="其他" />
        </el-select>
      </div>

      <!-- 状态 -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">状态</label>
        <el-select
          :model-value="status"
          @update:model-value="$emit('statusChange', $event)"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option label="全部" value="全部" />
          <el-option label="草稿" value="草稿" />
          <el-option label="待审批" value="待审批" />
          <el-option label="审批被拒绝" value="审批被拒绝" />
          <el-option label="采购中" value="采购中" />
          <el-option label="已完成" value="已完成" />
        </el-select>
      </div>

      <!-- 预警筛选 -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">预警筛选</label>
        <el-select
          :model-value="alertFilter"
          @update:model-value="$emit('alertFilterChange', $event)"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option label="全部" value="全部" />
          <el-option label="已逾期" value="已逾期" />
          <el-option label="即将到期" value="即将到期" />
        </el-select>
      </div>

      <!-- 申请人 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">申请人</label>
        <el-input
          :model-value="applicant"
          @update:model-value="$emit('applicantChange', $event)"
          placeholder="请输入申请人"
          clearable
        />
      </div>

      <!-- 申请部门 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">申请部门</label>
        <el-input
          :model-value="applicantDepartment"
          @update:model-value="$emit('applicantDepartmentChange', $event)"
          placeholder="请输入申请部门"
          clearable
        />
      </div>

      <!-- 优先级 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">优先级</label>
        <el-select
          :model-value="priority"
          @update:model-value="$emit('priorityChange', $event)"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option label="全部" value="全部" />
          <el-option label="紧急" value="紧急" />
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
        </el-select>
      </div>

      <!-- 交货日期开始 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">交货日期开始</label>
        <el-date-picker
          :model-value="requiredStartDate"
          @update:model-value="$emit('requiredStartDateChange', $event)"
          type="date"
          placeholder="请选择"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>

      <!-- 交货日期结束 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">交货日期结束</label>
        <el-date-picker
          :model-value="requiredEndDate"
          @update:model-value="$emit('requiredEndDateChange', $event)"
          type="date"
          placeholder="请选择"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <el-button type="primary" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="$emit('reset')">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({})

defineEmits(['relatedBatchCodeChange'])
</script>

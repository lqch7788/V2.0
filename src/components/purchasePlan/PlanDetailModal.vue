<template>
  <el-dialog
    :model-value="visible"
    title="采购计划详情"
    width="800px"
    @close="handleClose"
  >
    <div class="space-y-4" v-if="selectedPlanDetail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划编号">
          {{ selectedPlanDetail.purchaseApplicationCode }}
        </el-descriptions-item>
        <el-descriptions-item label="计划名称">
          {{ selectedPlanDetail.planTitle || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="采购类型">
          {{ selectedPlanDetail.purchaseTypeName || selectedPlanDetail.purchaseType }}
        </el-descriptions-item>
        <el-descriptions-item label="关联批次号">
          {{ selectedPlanDetail.relatedBatchCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">
          {{ selectedPlanDetail.applicant }}
        </el-descriptions-item>
        <el-descriptions-item label="申请部门">
          {{ selectedPlanDetail.applicantDepartment }}
        </el-descriptions-item>
        <el-descriptions-item label="申请日期">
          {{ selectedPlanDetail.applyDate }}
        </el-descriptions-item>
        <el-descriptions-item label="交货日期">
          {{ selectedPlanDetail.requiredDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="总金额">
          ¥{{ selectedPlanDetail.totalAmount?.toFixed(2) || '0.00' }}
        </el-descriptions-item>
        <el-descriptions-item label="供应商">
          {{ selectedPlanDetail.supplierName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(selectedPlanDetail.priority)" size="small">
            {{ selectedPlanDetail.priorityText || selectedPlanDetail.priority }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedPlanDetail.status)" size="small">
            {{ selectedPlanDetail.statusText || selectedPlanDetail.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批人">
          {{ selectedPlanDetail.approvalPerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ selectedPlanDetail.remarks || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 物料明细 -->
      <div v-if="selectedPlanDetail.items?.length">
        <h4 class="font-medium text-gray-900 mb-2">物料明细</h4>
        <el-table :data="selectedPlanDetail.items" stripe size="small">
          <el-table-column prop="materialName" label="物料名称" />
          <el-table-column prop="specification" label="规格" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="estimatedUnitPrice" label="预估单价" width="100">
            <template #default="{ row }">
              ¥{{ row.estimatedUnitPrice?.toFixed(2) || '0.00' }}
            </template>
          </el-table-column>
          <el-table-column prop="estimatedTotalPrice" label="预估总价" width="120">
            <template #default="{ row }">
              ¥{{ row.estimatedTotalPrice?.toFixed(2) || '0.00' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {  PurchasePlan  } from '@/types/purchase'

defineProps({})

const emit = defineEmits(['close'])

const getPriorityType = (priority) => {
  if (priority === 'urgent') return 'danger'
  if (priority === 'high') return 'warning'
  if (priority === 'normal') return 'info'
  return 'info'
}

const getStatusType = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'purchasing') return 'primary'
  if (status === 'pending') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'info'
}

const handleClose = () => {
  emit('close')
}
</script>

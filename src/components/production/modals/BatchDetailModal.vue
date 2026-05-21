<template>
  <el-dialog
    :model-value="visible"
    title="批次详情"
    width="800px"
    @close="handleClose"
  >
    <div class="space-y-4" v-if="batch">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="批次编号">
          {{ batch.batchCode }}
        </el-descriptions-item>
        <el-descriptions-item label="计划类型">
          {{ batch.planTypeName || batch.planType }}
        </el-descriptions-item>
        <el-descriptions-item label="作物名称">
          {{ batch.cropName }}
        </el-descriptions-item>
        <el-descriptions-item label="品种">
          {{ batch.variety }}
        </el-descriptions-item>
        <el-descriptions-item label="种植区域">
          {{ batch.greenhouseName }}
        </el-descriptions-item>
        <el-descriptions-item label="种植面积">
          {{ batch.plantingArea }} m²
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ batch.startDate }}
        </el-descriptions-item>
        <el-descriptions-item label="预计结束时间">
          {{ batch.expectedHarvestDate }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
          {{ batch.responsiblePerson }}
        </el-descriptions-item>
        <el-descriptions-item label="目标产量">
          {{ batch.targetYield }} kg
        </el-descriptions-item>
        <el-descriptions-item label="实际产量">
          {{ batch.actualYield || 0 }} kg
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(batch.batchStatus)" size="small">
            {{ getStatusName(batch.batchStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布人">
          {{ batch.publisher || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">
          {{ batch.publishDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ batch.description || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {  CropBatch  } from '@/types'

defineProps({})

const emit = defineEmits(['close'])

const getStatusName = (status) => {
  const map = {
    draft: '草稿',
    pending: '待审批',
    approved: '已审批',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已作废'
  }
  return map[status || ''] || status || ''
}

const getStatusType = (status) => {
  const map = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status || ''] || 'info'
}

const handleClose = () => {
  emit('close')
}
</script>

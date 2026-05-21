<template>
  <el-dialog
    :model-value="visible"
    title="订单详情"
    width="700px"
    @close="handleClose"
  >
    <div class="space-y-4" v-if="record">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">
          {{ record.orderCode }}
        </el-descriptions-item>
        <el-descriptions-item label="订单名称">
          {{ record.orderName }}
        </el-descriptions-item>
        <el-descriptions-item label="订单类型">
          {{ getOrderTypeName(record.orderType) }}
        </el-descriptions-item>
        <el-descriptions-item label="作物名称">
          {{ record.cropName }}
        </el-descriptions-item>
        <el-descriptions-item label="品种路径">
          {{ record.cropCategory || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="作物品种">
          {{ record.cropVariety || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="计划数量">
          {{ record.plannedQuantity }} {{ record.unit }}
        </el-descriptions-item>
        <el-descriptions-item label="实际数量">
          {{ record.actualQuantity }} {{ record.unit }}
        </el-descriptions-item>
        <el-descriptions-item label="订单日期">
          {{ record.orderDate }}
        </el-descriptions-item>
        <el-descriptions-item label="预计采收日期">
          {{ record.expectedHarvestDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(record.status)" size="small">
            {{ getStatusName(record.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ record.createBy }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ record.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ record.remarks || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {  CropOrder  } from '@/types/crop'

defineProps({})

const emit = defineEmits(['close'])

const getOrderTypeName = (type) => {
  const typeMap = {
    breeding: '育种订单',
    seedling: '育苗订单',
    production: '生产订单',
    research: '研发订单',
    other: '其他'
  }
  return typeMap[type] || type
}

const getStatusName = (status) => {
  const statusMap = {
    planned: '已计划',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const handleClose = () => {
  emit('close')
}
</script>

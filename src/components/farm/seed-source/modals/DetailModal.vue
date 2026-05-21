<template>
  <el-dialog
    :model-value="visible"
    title="种源详情"
    width="700px"
    @close="handleClose"
  >
    <div v-if="record" class="space-y-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="种源批号">{{ record.seedCode }}</el-descriptions-item>
        <el-descriptions-item label="种源类型">{{ getSourceTypeLabel(record.sourceType) }}</el-descriptions-item>
        <el-descriptions-item label="作物类别">{{ record.cropCategory }}</el-descriptions-item>
        <el-descriptions-item label="作物名称">{{ record.cropName }}</el-descriptions-item>
        <el-descriptions-item label="作物品种">{{ record.cropVariety || '-' }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ record.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="采购日期">{{ record.purchaseDate }}</el-descriptions-item>
        <el-descriptions-item label="采购数量">{{ record.quantity }} {{ record.unit }}</el-descriptions-item>
        <el-descriptions-item label="单价">{{ record.unitPrice }} 元</el-descriptions-item>
        <el-descriptions-item label="总金额">{{ record.totalAmount }} 元</el-descriptions-item>
        <el-descriptions-item label="初始数量">{{ record.initialCount }}</el-descriptions-item>
        <el-descriptions-item label="可用数量">{{ record.availableCount }}</el-descriptions-item>
        <el-descriptions-item label="库存状态">
          <el-tag :type="getStatusType(record.status)" size="small">
            {{ getStatusLabel(record.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="溯源码">{{ record.traceabilityCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ record.createBy }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ record.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ record.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 图片展示 -->
      <div v-if="record.pictures && record.pictures.length > 0">
        <h4 class="text-sm font-medium text-gray-700 mb-2">种源图片</h4>
        <div class="flex gap-2 flex-wrap">
          <el-image
            v-for="(img, index) in record.pictures"
            :key="index"
            :src="img"
            :preview-src-list="record.pictures"
            fit="cover"
            class="w-24 h-24 rounded"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {  SeedSource  } from '@/types/crop'

defineProps({})

const emit = defineEmits(['(e', 'value'])

const handleClose = () => {
  emit('update:visible', false)
}

const getSourceTypeLabel = (type) => {
  const map = {
    'seed': '种子',
    'seedling': '种苗/实生苗',
    'cutting': '扦插苗',
    'grafting': '嫁接苗',
    'tissue_culture': '组培苗',
    'split': '分株苗',
    'bulb': '种球/球根',
    'other': '其他'
  }
  return map[type] || type
}

const getStatusLabel = (status) => {
  const map = {
    'sufficient': '充足',
    'low': '不足',
    'depleted': '耗尽'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    'sufficient': 'success',
    'low': 'warning',
    'depleted': 'danger'
  }
  return map[status] || 'info'
}
</script>

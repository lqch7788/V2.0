<template>
  <el-dialog
    :model-value="visible"
    title="育苗详情"
    width="800px"
    @close="handleClose"
  >
    <div v-if="record" class="space-y-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="育苗批号">{{ record.seedlingCode }}</el-descriptions-item>
        <el-descriptions-item label="关联种源">{{ record.sourceCode }}</el-descriptions-item>
        <el-descriptions-item label="作物名称">{{ record.cropName }}</el-descriptions-item>
        <el-descriptions-item label="作物品种">{{ record.cropVariety || '-' }}</el-descriptions-item>
        <el-descriptions-item label="育苗方式">{{ record.seedlingType }}</el-descriptions-item>
        <el-descriptions-item label="场地">{{ record.siteName }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ record.startDate }}</el-descriptions-item>
        <el-descriptions-item label="预计结束">{{ record.expectedEndDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="实际结束">{{ record.endDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="初始数量">{{ record.initialCount }}</el-descriptions-item>
        <el-descriptions-item label="成活数量">{{ record.survivalCount }}</el-descriptions-item>
        <el-descriptions-item label="已定植数量">{{ record.plantedCount }}</el-descriptions-item>
        <el-descriptions-item label="损耗数量">{{ record.lossCount }}</el-descriptions-item>
        <el-descriptions-item label="成苗率">{{ record.survivalRate }}%</el-descriptions-item>
        <el-descriptions-item label="损耗率">{{ record.lossRate }}%</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(record.status)" size="small">
            {{ getStatusLabel(record.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="品质等级">{{ record.qualityGrade || '-' }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ record.chargePerson || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ record.createBy }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ record.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ record.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 图片展示 -->
      <div v-if="record.pictures && record.pictures.length > 0">
        <h4 class="text-sm font-medium text-gray-700 mb-2">育苗图片</h4>
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

      <!-- 每日记录 -->
      <div v-if="record.dailyRecords && record.dailyRecords.length > 0">
        <h4 class="text-sm font-medium text-gray-700 mb-2">每日记录</h4>
        <el-table :data="record.dailyRecords" size="small">
          <el-table-column prop="recordDate" label="记录日期" width="120" />
          <el-table-column prop="temperature" label="温度(℃)" width="100" />
          <el-table-column prop="humidity" label="湿度(%)" width="100" />
          <el-table-column prop="watering" label="浇水" width="80">
            <template #default="{ row }">
              {{ row.watering ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column prop="survivalCountChange" label="成活变化" width="100" />
          <el-table-column prop="lossCountChange" label="损耗变化" width="100" />
          <el-table-column prop="abnormality" label="异常情况" />
          <el-table-column prop="remarks" label="备注" />
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {  Seedling  } from '@/types/crop'

defineProps({})

const emit = defineEmits(['(e', 'value'])

const handleClose = () => {
  emit('update:visible', false)
}

const getStatusLabel = (status) => {
  const map = {
    'in_progress': '进行中',
    'transplant_ready': '待定植',
    'completed': '已完成',
    'abnormal': '异常'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    'in_progress': 'primary',
    'transplant_ready': 'warning',
    'completed': 'success',
    'abnormal': 'danger'
  }
  return map[status] || 'info'
}
</script>

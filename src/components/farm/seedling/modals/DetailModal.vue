<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- 头部 - 使用渐变色 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><View /></el-icon>
          <h3 class="text-lg font-semibold text-white">育苗详情</h3>
        </div>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="space-y-6" v-if="record">
          <!-- 基本信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">基本信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">育苗批号：</span>
                <span class="text-sm font-mono text-blue-600">{{ record.seedlingCode }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">作物品种：</span>
                <span class="text-sm text-gray-900">{{ record.cropName }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">品种路径：</span>
                <span class="text-sm text-gray-900">{{ record.cropVariety || '-' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">关联种源：</span>
                <span class="text-sm text-gray-900">{{ record.sourceCode }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">育苗方式：</span>
                <span class="text-sm text-gray-900">{{ record.seedlingType || '-' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">温室场地：</span>
                <span class="text-sm text-gray-900">{{ record.siteName }}</span>
              </div>
              <div class="flex items-center" v-if="record.workHours !== undefined">
                <span class="text-sm text-gray-500 w-24">育苗工时：</span>
                <span class="text-sm text-gray-900">{{ record.workHours }} 小时</span>
              </div>
            </div>
          </div>

          <!-- 数量信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">数量信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">开始日期：</span>
                <span class="text-sm text-gray-900">{{ record.startDate }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">结束日期：</span>
                <span class="text-sm text-gray-900">{{ record.endDate || '-' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">预计结束：</span>
                <span class="text-sm text-gray-900">{{ record.expectedEndDate || '-' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">初始数量：</span>
                <span class="text-sm text-gray-900">{{ record.initialCount?.toLocaleString() }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">成活数量：</span>
                <span class="text-sm text-emerald-600 font-medium">{{ record.survivalCount?.toLocaleString() }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">成苗率：</span>
                <span class="text-sm text-emerald-600 font-bold">{{ record.survivalRate }}%</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">已定植数量：</span>
                <span class="text-sm text-blue-600">{{ record.plantedCount?.toLocaleString() }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">损耗数量：</span>
                <span class="text-sm text-red-600">{{ record.lossCount?.toLocaleString() }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">损耗率：</span>
                <span class="text-sm text-red-600">{{ record.lossRate }}%</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">剩余总数：</span>
                <span class="text-sm text-purple-600 font-medium">
                  {{ ((record.initialCount || 0) - (record.lossCount || 0)).toLocaleString() }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">育苗结束：</span>
                <span class="text-sm text-gray-900">{{ record.isFinished ? '是' : '否' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">状态：</span>
                <el-tag :type="getStatusType(record.status)" size="small">
                  {{ getStatusLabel(record.status) }}
                </el-tag>
              </div>
              <div class="flex items-center" v-if="record.qualityGrade">
                <span class="text-sm text-gray-500 w-24">品质等级：</span>
                <span class="text-sm text-gray-900">{{ record.qualityGrade }}</span>
              </div>
              <div class="flex items-center" v-if="record.chargePerson">
                <span class="text-sm text-gray-500 w-24">负责人：</span>
                <span class="text-sm text-gray-900">{{ record.chargePerson }}</span>
              </div>
            </div>
          </div>

          <!-- 栽种记录 -->
          <div v-if="record.transplantRecords && record.transplantRecords.length > 0">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              栽种记录 ({{ record.transplantRecords.length }} 条)
            </h4>
            <div class="max-h-40 overflow-y-auto space-y-2">
              <div
                v-for="(tr, index) in record.transplantRecords"
                :key="index"
                class="bg-gray-50 rounded p-3 text-sm"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ tr.transplantDate }}</span>
                  <span class="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                    {{ getTransplantStatusLabel(tr.status) }}
                  </span>
                </div>
                <div class="mt-1 text-gray-600 grid grid-cols-2 gap-1 text-xs">
                  <span>场地: {{ tr.areaName }}</span>
                  <span v-if="tr.zoneName">区域: {{ tr.zoneName }}</span>
                  <span v-if="tr.bedName">苗床: {{ tr.bedName }}</span>
                  <span>定植数量: {{ tr.transplantCount }}</span>
                  <span>剩余: {{ tr.remainingCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 其他信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">其他信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">创建人：</span>
                <span class="text-sm text-gray-900">{{ record.createBy }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">创建时间：</span>
                <span class="text-sm text-gray-900">{{ record.createTime }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">更新时间：</span>
                <span class="text-sm text-gray-900">{{ record.updateTime }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">打印次数：</span>
                <span class="text-sm text-gray-900">{{ record.printCount }} 次</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">每日记录：</span>
                <span class="text-sm text-gray-900">{{ record.dailyRecords?.length || 0 }} 条</span>
              </div>
              <div class="flex items-center" v-if="record.remarks">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">备注：</span>
                <span class="text-sm text-gray-900">{{ record.remarks }}</span>
              </div>
            </div>
          </div>

          <!-- 图片展示 -->
          <div v-if="record.pictures && record.pictures.length > 0">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">育苗图片</h4>
            <div class="flex gap-2 flex-wrap">
              <el-image
                v-for="(img, index) in record.pictures"
                :key="index"
                :src="img"
                :preview-src-list="record.pictures"
                fit="cover"
                class="w-24 h-24 rounded cursor-pointer"
              />
            </div>
          </div>

          <!-- 每日记录 -->
          <div v-if="record.dailyRecords && record.dailyRecords.length > 0">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">每日记录</h4>
            <el-table :data="record.dailyRecords" size="small" max-height="300">
              <el-table-column prop="recordDate" label="记录日期" width="120" />
              <el-table-column prop="temperature" label="温度(℃)" width="80">
                <template #default="{ row }">
                  {{ row.temperature || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="humidity" label="湿度(%)" width="80">
                <template #default="{ row }">
                  {{ row.humidity || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="watering" label="浇水" width="60">
                <template #default="{ row }">
                  {{ row.watering ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="survivalCountChange" label="成活变化" width="100">
                <template #default="{ row }">
                  {{ row.survivalCountChange !== undefined ? (row.survivalCountChange > 0 ? '+' : '') + row.survivalCountChange : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="lossCountChange" label="损耗变化" width="100">
                <template #default="{ row }">
                  {{ row.lossCountChange !== undefined ? '+' + row.lossCountChange : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="abnormality" label="异常情况">
                <template #default="{ row }">
                  {{ row.abnormality || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="remarks" label="备注">
                <template #default="{ row }">
                  {{ row.remarks || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end bg-gray-50">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { View, Close } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible'])

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

const getTransplantStatusLabel = (status) => {
  if (!status) return '-'
  switch (status) {
    case 'in_stock': return '库存'
    case 'transplanting': return '定植中'
    case 'growing': return '生长期'
    case 'harvested': return '已采收'
    default: return status
  }
}
</script>

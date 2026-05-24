<template>
  <el-dialog
    :model-value="isOpen"
    title="记录详情"
    width="900px"
    @close="onClose"
  >
    <div class="space-y-6">
      <!-- 巡查类型标签 -->
      <div class="flex items-center gap-2">
        <span v-if="record?.inspectionType === 'farm'" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
          种植区域巡查
        </span>
        <span v-else-if="record?.inspectionType === 'equipment'" class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
          设备保养巡查
        </span>
        <span v-else-if="record?.inspectionType === 'infrastructure'" class="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
          基础设施巡检
        </span>
        <span v-else class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
          传统巡查
        </span>
      </div>

      <!-- 基本信息 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查人员</span>
          <span class="text-sm font-medium text-gray-900">{{ record?.inspectorName }}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查区域</span>
          <span class="text-sm font-medium text-gray-900">{{ record?.greenhouseName }}</span>
        </div>

        <!-- 种植区域特有 -->
        <template v-if="record?.inspectionType === 'farm'">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">作物名称</span>
            <span class="text-sm font-medium text-gray-900">{{ record?.cropName }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">作物状态</span>
            <span class="text-sm font-medium text-gray-900">{{ record?.cropStatus }}</span>
          </div>
          <div v-if="record?.plantHeight" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">株高</span>
            <span class="text-sm font-medium text-gray-900">{{ record?.plantHeight }} cm</span>
          </div>
          <div v-if="record?.leafCount" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">叶片数</span>
            <span class="text-sm font-medium text-gray-900">{{ record?.leafCount }} 片</span>
          </div>
        </template>

        <!-- 设备保养特有 -->
        <div v-if="record?.inspectionType === 'equipment'" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">设备名称</span>
          <span class="text-sm font-medium text-gray-900">{{ record?.equipmentName }}</span>
        </div>

        <!-- 基础设施巡检特有 -->
        <div v-if="record?.inspectionType === 'infrastructure'" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">设施名称</span>
          <span class="text-sm font-medium text-gray-900">{{ record?.infrastructureName }}</span>
        </div>

        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查日期</span>
          <span class="text-sm font-medium text-gray-900">{{ record?.checkDate }}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">状态</span>
          <span :class="['px-2 py-1 text-xs rounded-full', getStatusBadgeClass(record?.status)]">
            {{ getStatusLabel(record?.status) }}
          </span>
        </div>
        <div v-if="record?.issueStatus" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">问题处理</span>
          <span :class="['px-2 py-1 text-xs rounded-full',
            record?.issueStatus === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
            record?.issueStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          ]">
            {{ record?.issueStatus === 'resolved' ? '已解决' :
               record?.issueStatus === 'processing' ? '处理中' : '待处理' }}
          </span>
        </div>
        <div v-if="record?.duration" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡检时长</span>
          <span class="text-sm font-medium text-gray-900">{{ record?.duration }} 分钟</span>
        </div>
      </div>

      <!-- 生长环境参数 - 仅种植区域显示 -->
      <template v-if="record?.inspectionType === 'farm' && (record?.airTemperature || record?.soilTemperature)">
        <div>
          <h4 class="text-base font-semibold text-gray-900 mb-3">生长环境参数</h4>
          <div class="grid grid-cols-2 gap-6">
            <!-- 空气环境参数 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">空气环境参数</h5>
              <div class="space-y-3">
                <div v-if="record?.airTemperature" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <el-icon class="text-red-500"><HotWater /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">空气温度</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.airTemperature }}°C</span>
                </div>
                <div v-if="record?.airHumidity" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <el-icon class="text-blue-500"><Drizzling /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">空气湿度</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.airHumidity }}%</span>
                </div>
                <div v-if="record?.lightIntensity" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <el-icon class="text-amber-500"><Sunny /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">光照强度</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.lightIntensity }} Lux</span>
                </div>
                <div v-if="record?.co2Concentration" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                      <el-icon class="text-teal-500"><WindPower /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">CO2浓度</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.co2Concentration }} ppm</span>
                </div>
              </div>
            </div>

            <!-- 土壤环境参数 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">土壤环境参数</h5>
              <div class="space-y-3">
                <div v-if="record?.soilTemperature" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <el-icon class="text-orange-500"><Sunny /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">土壤温度</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.soilTemperature }}°C</span>
                </div>
                <div v-if="record?.soilMoisture" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <el-icon class="text-cyan-500"><Drizzling /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">土壤湿度</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.soilMoisture }}%</span>
                </div>
                <div v-if="record?.soilEc" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <el-icon class="text-purple-500"><DataLine /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">土壤EC值</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.soilEc }} mS/cm</span>
                </div>
                <div v-if="record?.soilPh" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                      <el-icon class="text-pink-500"><ScaleToOriginal /></el-icon>
                    </div>
                    <span class="text-sm text-gray-600">土壤PH值</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ record?.soilPh }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 发现问题 -->
      <div v-if="record?.issues && record.issues.length > 0">
        <h4 class="text-base font-semibold text-gray-900 mb-3">发现问题</h4>
        <div class="flex gap-2 flex-wrap">
          <span
            v-for="(issue, idx) in record.issues"
            :key="idx"
            class="px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-full"
          >
            {{ issue }}
          </span>
        </div>
      </div>

      <!-- 问题描述 -->
      <div v-if="record?.issueText">
        <h4 class="text-base font-semibold text-gray-900 mb-2">问题描述</h4>
        <p class="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{{ record?.issueText }}</p>
      </div>

      <!-- 严重程度 -->
      <div v-if="record?.issueSeverity" class="flex items-center gap-3">
        <span class="text-sm text-gray-600">严重程度：</span>
        <span :class="['px-3 py-1 text-sm rounded-full',
          record?.issueSeverity === '严重' ? 'bg-red-100 text-red-700' :
          record?.issueSeverity === '中等' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-700'
        ]">
          {{ record?.issueSeverity }}
        </span>
      </div>

      <!-- 反馈人员 -->
      <div v-if="record?.feedbackUsers && record.feedbackUsers.length > 0" class="flex items-center gap-3">
        <span class="text-sm text-gray-600">反馈人员：</span>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="userId in record.feedbackUsers"
            :key="userId"
            class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {{ getUserName(userId) }}
          </span>
        </div>
      </div>

      <!-- 问题照片 -->
      <div v-if="record?.issuePhotos && record.issuePhotos.length > 0">
        <h4 class="text-base font-semibold text-gray-900 mb-3">问题照片 (最多6张)</h4>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(img, idx) in record.issuePhotos.slice(0, 6)"
            :key="idx"
            class="aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            <img :src="img" :alt="`问题照片${idx + 1}`" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div v-if="record?.remarks">
        <h4 class="text-base font-semibold text-gray-900 mb-3">备注</h4>
        <p class="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{{ record?.remarks }}</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { HotWater, Drizzling, Sunny, WindPower, DataLine, ScaleToOriginal } from '@element-plus/icons-vue'

// 巡查记录类型定义
const props = defineProps({
  visible: Boolean,
  record: Object,
  users: Array
})

// 获取用户名称
const getUserName = (userId) => {
  const user = props.users?.find(u => u.id === userId)
  return user?.name || userId
}

// 状态标签映射
const getStatusBadgeClass = (status) => {
  const map = {
    'normal': 'bg-emerald-100 text-emerald-700',
    'warning': 'bg-yellow-100 text-yellow-700',
    'attention': 'bg-yellow-100 text-yellow-700',
    'critical': 'bg-red-100 text-red-700',
  }
  return map[status || ''] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status) => {
  const map = {
    'normal': '正常',
    'warning': '注意',
    'attention': '需关注',
    'critical': '异常',
  }
  return map[status || ''] || '未知'
}
</script>

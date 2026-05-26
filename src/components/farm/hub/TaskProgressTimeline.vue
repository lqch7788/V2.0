<template>
  <div class="space-y-4">
    <!-- 任务信息头部 -->
    <div v-if="showTaskInfo && taskCode" class="bg-gray-50 rounded-lg p-3">
      <p class="font-medium text-gray-900">{{ taskTitle || '任务详情' }}</p>
      <p class="text-sm text-gray-500">任务编号：{{ taskCode }}</p>
    </div>

    <!-- 时间线 -->
    <div :class="['space-y-4 overflow-y-auto', maxHeightClass]">
      <template v-if="sortedRecords.length === 0">
        <div class="text-center py-8 text-gray-500">
          <el-icon :size="32" class="opacity-50 mb-2"><Clock /></el-icon>
          <p>暂无操作记录</p>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(record, index) in sortedRecords"
          :key="record.id"
          :class="[
            'relative pl-6',
            index !== sortedRecords.length - 1 ? 'border-l-2 border-gray-200 pb-4' : 'pb-0'
          ]"
        >
          <!-- 时间线节点 -->
          <div
            :class="[
              'absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-[7px]',
              index === 0 ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-gray-300'
            ]"
          />

          <!-- 记录卡片 -->
          <div
            :class="[
              'bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow',
              index === 0 ? 'border-emerald-200' : 'border-gray-100'
            ]"
          >
            <!-- 头部：状态标签 + 时间 -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  :class="['px-2 py-0.5 rounded text-xs font-medium', getActionBg(record.action), getActionColor(record.action)]"
                >
                  {{ getActionLabel(record.action) }}
                </span>
                <template v-if="record.fromStatus">
                  <span class="text-gray-400 text-xs">→</span>
                  <span
                    :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusBg(record.toStatus || ''), getStatusColor(record.toStatus || '')]"
                  >
                    {{ getStatusLabel(record.toStatus || '') }}
                  </span>
                </template>
              </div>
              <span class="text-xs text-gray-500 whitespace-nowrap">
                {{ formatTime(record.actionTime) }}
              </span>
            </div>

            <!-- 操作人 -->
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <el-icon :size="12"><User /></el-icon>
              <span>{{ record.operatorName }}</span>
            </div>

            <!-- 进度信息 -->
            <div v-if="record.progress !== undefined" class="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <el-icon :size="12"><Document /></el-icon>
              <span>
                进度：{{ record.progress }}%
                <span v-if="record.progressIncrement !== undefined && record.progressIncrement > 0" class="text-emerald-600 ml-1">
                  (+{{ record.progressIncrement }}%)
                </span>
                <span v-if="record.progressIncrement !== undefined && record.progressIncrement < 0" class="text-red-600 ml-1">
                  ({{ record.progressIncrement }}%)
                </span>
              </span>
            </div>

            <!-- 反馈内容 -->
            <div v-if="record.feedback" class="mt-3 space-y-2">
              <div v-if="record.feedback.text" class="bg-blue-50 rounded p-2 text-sm">
                <p class="text-gray-700">{{ record.feedback.text }}</p>
              </div>

              <div v-if="record.feedback.images && record.feedback.images.length > 0" class="flex gap-2 flex-wrap">
                <div
                  v-for="(img, i) in record.feedback.images"
                  :key="i"
                  class="w-14 h-14 bg-gray-100 rounded flex items-center justify-center border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  :title="`照片 ${i + 1}`"
                >
                  <el-icon :size="20" class="text-gray-400"><Picture /></el-icon>
                </div>
              </div>

              <div v-if="record.feedback.gpsLocation" class="flex items-center gap-2 text-sm text-gray-600">
                <el-icon :size="12" class="text-blue-500"><Location /></el-icon>
                <span>
                  GPS: {{ record.feedback.gpsLocation.lat.toFixed(4) }},
                  {{ record.feedback.gpsLocation.lng.toFixed(4) }}
                </span>
              </div>

              <div v-if="record.feedback.voiceNote" class="flex items-center gap-2 text-sm text-gray-600">
                <el-icon :size="12" class="text-purple-500"><Microphone /></el-icon>
                <span>语音备注</span>
              </div>

              <div v-if="record.feedback.materials && record.feedback.materials.length > 0" class="bg-amber-50 rounded p-2">
                <div class="flex items-center gap-2 text-sm text-amber-700 mb-1">
                  <el-icon :size="12"><Box /></el-icon>
                  <span class="font-medium">物料使用</span>
                </div>
                <div class="text-sm text-amber-600">
                  <span v-for="(m, i) in record.feedback.materials" :key="i" class="mr-3">
                    {{ m.name }}×{{ m.qty }}{{ m.unit }}
                  </span>
                </div>
              </div>

              <div v-if="record.feedback.laborCost !== undefined" class="text-sm text-gray-600">
                <span class="font-medium">人工费：</span>
                ¥{{ record.feedback.laborCost.toFixed(2) }}
              </div>
            </div>

            <!-- 备注/原因 -->
            <p v-if="record.comment" class="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
              {{ record.comment }}
            </p>
            <p v-if="record.reason" class="mt-2 text-sm text-red-600 bg-red-50 rounded p-2 border border-red-100">
              <span class="font-medium">原因：</span>
              {{ record.reason }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, User, Document, Picture, Location, Microphone, Box } from '@element-plus/icons-vue'
import { TASK_ACTION_CONFIG, TASK_STATUS_CONFIG } from '@/config/taskConfig'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  maxHeight: {
    type: String,
    default: '400px'
  },
  showTaskInfo: {
    type: Boolean,
    default: false
  },
  taskCode: String,
  taskTitle: String
})

// 按 actionTime 倒序排序
const sortedRecords = computed(() => {
  return [...props.records].sort(
    (a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime()
  )
})

// 动态最大高度样式
const maxHeightClass = computed(() => {
  return `max-h-[${props.maxHeight}]`
})

const formatTime = (time) => {
  const date = new Date(time)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 使用全局配置映射获取标签（与V1.1完全一致）
const getActionLabel = (action) => TASK_ACTION_CONFIG[action]?.label || action
const getActionBg = (action) => TASK_ACTION_CONFIG[action]?.bg || 'bg-gray-100'
const getActionColor = (action) => TASK_ACTION_CONFIG[action]?.color || 'text-gray-600'
const getStatusLabel = (status) => TASK_STATUS_CONFIG[status]?.label || status
const getStatusBg = (status) => TASK_STATUS_CONFIG[status]?.bg || 'bg-gray-100'
const getStatusColor = (status) => TASK_STATUS_CONFIG[status]?.color || 'text-gray-600'
</script>

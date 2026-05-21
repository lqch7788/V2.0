<template>
  <div class="space-y-4">
    <h4 class="text-sm font-semibold text-gray-900">流转记录</h4>
    <div v-if="!records || records.length === 0" class="text-center py-8 text-gray-400">
      暂无流转记录
    </div>
    <div v-else class="relative">
      <!-- 时间线 -->
      <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div class="space-y-4">
        <div
          v-for="(record, index) in sortedRecords"
          :key="record.id"
          class="relative flex gap-4 pl-10"
        >
          <!-- 图标 -->
          <div
            :class="[
              'absolute left-2 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center z-10',
              getActionColor(record.action)
            ]"
          >
            <el-icon :size="12"><component :is="getActionIcon(record.action)" /></el-icon>
          </div>

          <!-- 内容 -->
          <div :class="['flex-1 pb-4', index !== sortedRecords.length - 1 ? 'border-b border-gray-100' : '']">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-medium text-gray-900">
                {{ record.operatorName }}
              </span>
              <span :class="['text-xs', getActionColor(record.action)]">
                {{ getActionLabel(record.action) }}
              </span>
            </div>

            <div v-if="showStatusChange && record.fromStatus && record.toStatus && record.fromStatus !== record.toStatus" class="text-xs text-gray-500 mb-1">
              {{ record.fromStatus }} → {{ record.toStatus }}
            </div>

            <div v-if="record.comment" class="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mt-1">
              {{ record.comment }}
            </div>

            <div class="text-xs text-gray-400 mt-1">
              {{ formatTime(record.actionTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Check, Close, VideoPlay, Upload, Star, ChatLineSquare } from '@element-plus/icons-vue'

const props = defineProps({"showStatusChange":"true"})

const sortedRecords = computed(() => {
  return [...props.records].sort(
    (a, b) => new Date(a.actionTime).getTime() - new Date(b.actionTime).getTime()
  )
})

// 流转动作配置
const ACTION_CONFIG = {
  report: { icon, color: 'text-gray-500', label: '上报问题' },
  dispatch: { icon: 'Promotion', color: 'text-blue-500', label: '分派任务' },
  accept: { icon, color: 'text-green-500', label: '接单确认' },
  reject: { icon, color: 'text-red-500', label: '拒绝任务' },
  start: { icon, color: 'text-blue-500', label: '开始处理' },
  submit: { icon, color: 'text-amber-500', label: '提交反馈' },
  approve: { icon, color: 'text-green-500', label: '验收通过' },
  complete: { icon, color: 'text-emerald-500', label: '完成' },
  comment: { icon, color: 'text-gray-500', label: '备注' },
}

const getActionIcon = (action) => {
  return ACTION_CONFIG[action]?.icon || ChatLineSquare
}

const getActionColor = (action) => {
  return ACTION_CONFIG[action]?.color || 'text-gray-500'
}

const getActionLabel = (action) => {
  return ACTION_CONFIG[action]?.label || action
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

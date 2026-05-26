<template>
  <div class="bg-white rounded-xl shadow-sm">
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="text-lg font-medium text-gray-900 flex items-center gap-2">
        <el-icon :size="20" class="text-gray-400"><Document /></el-icon>
        今日操作记录
      </h2>
      <el-button type="primary" link @click="onShowAll">
        查看全部
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
    <div class="p-4">
      <template v-if="records.length === 0">
        <p class="text-gray-500 text-center py-4">暂无操作记录</p>
      </template>
      <template v-else>
        <div class="space-y-3">
          <div
            v-for="record in records.slice(0, 5)"
            :key="record.id"
            class="flex items-start gap-3 text-sm"
          >
            <span class="text-gray-400 whitespace-nowrap">
              {{ formatTime(record.timestamp) }}
            </span>
            <span :class="[
              'px-2 py-0.5 rounded text-xs',
              record.operatorType === 'system' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            ]">
              {{ record.operatorType === 'system' ? '系统' : record.operatorName }}
            </span>
            <span class="text-gray-600 flex-1">{{ record.content }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Document, ArrowRight } from '@element-plus/icons-vue'

// 今日操作记录 - 从V1.1 TodayOperationRecords.tsx 1:1迁移
defineProps({
  /** 操作记录列表 */
  records: { type: Array, default: () => [] },
  /** 查看全部回调 */
  onShowAll: { type: Function, default: null },
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

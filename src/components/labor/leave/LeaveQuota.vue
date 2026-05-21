<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">请假配额</h3>
      <span class="text-sm text-gray-500">{{ quota.year }}年</span>
    </div>

    <div class="space-y-4">
      <!-- 年假 -->
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <el-icon :size="16" class="text-amber-600"><Calendar /></el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">年假</span>
            <span class="text-sm text-gray-500">
              {{ quota.annualLeaveRemaining }} / {{ quota.annualLeaveTotal }} 天
            </span>
          </div>
          <el-progress
            :percentage="annualPercent"
            :stroke-width="8"
            color="#f59e0b"
            :show-text="false"
          />
          <p class="text-xs text-gray-400 mt-1">已用 {{ quota.annualLeaveUsed }} 天</p>
        </div>
      </div>

      <!-- 病假 -->
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <el-icon :size="16" class="text-blue-600"><FirstAidKit /></el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">病假</span>
            <span class="text-sm text-gray-500">
              {{ quota.sickLeaveRemaining }} / {{ quota.sickLeaveTotal }} 天
            </span>
          </div>
          <el-progress
            :percentage="sickPercent"
            :stroke-width="8"
            color="#3b82f6"
            :show-text="false"
          />
          <p class="text-xs text-gray-400 mt-1">已用 {{ quota.sickLeaveUsed }} 天</p>
        </div>
      </div>

      <!-- 其他假 -->
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          <el-icon :size="16" class="text-purple-600"><Lightning /></el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">其他假</span>
            <span class="text-sm text-gray-500">
              {{ quota.otherLeaveRemaining }} / {{ quota.otherLeaveTotal }} 天
            </span>
          </div>
          <el-progress
            :percentage="otherPercent"
            :stroke-width="8"
            color="#8b5cf6"
            :show-text="false"
          />
          <p class="text-xs text-gray-400 mt-1">已用 {{ quota.otherLeaveUsed }} 天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, FirstAidKit, Lightning } from '@element-plus/icons-vue'

const props = defineProps({})

const annualPercent = computed(() => {
  return props.quota.annualLeaveTotal > 0
    ? Math.round((props.quota.annualLeaveUsed / props.quota.annualLeaveTotal) * 100)
    : 0
})

const sickPercent = computed(() => {
  return props.quota.sickLeaveTotal > 0
    ? Math.round((props.quota.sickLeaveUsed / props.quota.sickLeaveTotal) * 100)
    : 0
})

const otherPercent = computed(() => {
  return props.quota.otherLeaveTotal > 0
    ? Math.round((props.quota.otherLeaveUsed / props.quota.otherLeaveTotal) * 100)
    : 0
})
</script>

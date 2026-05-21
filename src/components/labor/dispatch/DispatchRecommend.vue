<template>
  <div
    :class="[
      'relative p-4 rounded-lg border-2 transition-all',
      isTopPick
        ? 'border-emerald-500 bg-emerald-50 shadow-md'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
    ]"
  >
    <!-- 排名标识 -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span v-if="isTopPick" class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-sm">
          <el-icon><Star /></el-icon>
        </span>
        <span v-else class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-sm">
          {{ rank }}
        </span>
        <div>
          <span class="font-semibold text-gray-900">{{ recommendation.workerName }}</span>
          <span class="ml-2 text-xs text-gray-500">{{ recommendation.workerType }}</span>
        </div>
      </div>
      <div :class="['px-3 py-1 rounded-full text-sm font-medium', isTopPick ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700']">
        {{ recommendation.matchScore }}分
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="grid grid-cols-3 gap-2 mb-3 text-xs">
      <div class="flex items-center gap-1 text-gray-600">
        <el-icon :size="12"><Location /></el-icon>
        <span>{{ recommendation.currentWorkZone }}</span>
        <span class="text-gray-400">({{ recommendation.distance }}km)</span>
      </div>
      <div class="flex items-center gap-1 text-gray-600">
        <el-icon :size="12"><Lightning /></el-icon>
        <span>负荷{{ recommendation.currentLoad }}%</span>
      </div>
      <div class="flex items-center gap-1 text-gray-600">
        <el-icon :size="12"><CaretTop /></el-icon>
        <span>表现{{ recommendation.recentPerformance }}分</span>
      </div>
    </div>

    <!-- 推荐理由 -->
    <div v-if="recommendation.reasons && recommendation.reasons.length > 0" class="flex flex-wrap gap-1">
      <span
        v-for="(reason, idx) in recommendation.reasons"
        :key="idx"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
      >
        <el-icon :size="12"><CircleCheck /></el-icon>
        {{ reason }}
      </span>
    </div>

    <!-- 技能标签 -->
    <div v-if="recommendation.skills" class="mt-3 flex flex-wrap gap-1">
      <span
        v-for="skill in recommendation.skills"
        :key="skill"
        class="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
      >
        {{ skill }}
      </span>
    </div>

    <!-- 最佳推荐标识 -->
    <div v-if="isTopPick" class="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-medium">
      推荐
    </div>
  </div>
</template>

<script setup>
import { Star, Location, Lightning, CaretTop, CircleCheck } from '@element-plus/icons-vue'

defineProps({"isTopPick":"false"})
</script>

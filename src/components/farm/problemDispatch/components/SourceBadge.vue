<template>
  <!-- 来源模块徽章 - 从V1.1 SourceBadge.tsx 1:1迁移 -->
  <div v-if="problem.sourceModule" class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs text-gray-500">问题来源</span>
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-white border"
        :class="[config.color]">
        <el-icon :size="12"><component :is="configIcon" /></el-icon>
        {{ config.label }}
      </span>
    </div>
    <div v-if="problem.sourceId" class="text-xs text-gray-600">
      原始单据：<span class="font-mono text-gray-800">{{ problem.sourceId }}</span>
    </div>
    <div v-if="problem.sourceDetail" class="text-xs text-gray-600 mt-1">
      {{ problem.sourceDetail }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { List, Warning, Crop, Van, Box, Files } from '@element-plus/icons-vue'
import { getSourceConfig } from '../constants/sourceConfig'

const props = defineProps({
  problem: { type: Object, required: true },
})

const config = computed(() => getSourceConfig(props.problem.sourceModule) || { label: '未知', color: 'text-gray-500' })

const iconMap = {
  List, Warning, Crop, Van, Box, Files,
  AlertTriangle: Warning, Sprout: Crop,
}
const configIcon = computed(() => iconMap[props.problem.sourceModule] || List)
</script>

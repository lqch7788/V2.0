<template>
  <!-- 来源模块单元格 - 从V1.1 SourceCell.tsx 1:1迁移 -->
  <div class="flex flex-col gap-0.5">
    <span class="text-sm font-medium text-gray-700">{{ config.label }}</span>
    <span v-if="problem.sourceId" class="text-sm text-gray-400 font-mono">{{ problem.sourceId }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getSourceConfig } from '../constants/sourceConfig'

const props = defineProps({
  problem: { type: Object, required: true },
})

const config = computed(() => getSourceConfig(props.problem.sourceModule) || { label: '未知' })
</script>

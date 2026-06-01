<!--
  @file 生产计划统计卡片 - 1:1 翻译自 V1.1
  @see V1.1: src/components/production/ProductionStatsCards.tsx
  @description 纯展示组件，统计总批次/执行中/已完成/草稿或已作废四个维度
-->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center gap-2">
        <!-- 图标徽章 -->
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
          <component :is="stat.icon" class="w-4 h-4 text-white" />
        </div>
        <!-- 数值 + 文案 -->
        <div>
          <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file ProductionStatsCards.vue
 * @description 生产计划统计卡片 - 1:1 翻译自 V1.1 ProductionStatsCards.tsx
 */
import { computed } from 'vue'
import { Layers, PlayCircle, CheckCircle2, FileEdit } from 'lucide-vue-next'

/**
 * @typedef {Object} CropBatch
 * @property {string} id
 * @property {'draft'|'pending'|'approved'|'in_progress'|'completed'|'cancelled'|'rejected'} batchStatus
 * @property {string} batchCode
 * @property {string} cropName
 * @property {string} cropType
 * @property {string} variety
 * @property {string} greenhouseId
 * @property {string} greenhouseName
 * @property {number} plantingArea
 * @property {string} [plantingAreaUnit]
 * @property {'seedling'|'vegetative'|'flowering'|'fruiting'|'harvest'} stage
 * @property {string} stageName
 * @property {string} startDate
 * @property {string} expectedHarvestDate
 * @property {number} targetYield
 * @property {number} actualYield
 * @property {string} plantingMode
 * @property {string} responsiblePerson
 * @property {string} [publisher]
 * @property {string} [publishDate]
 * @property {string} [lastModifyDate]
 * @property {string} [planDetailFileName]
 * @property {string} [planDetail]
 */

/**
 * Props - 1:1 翻译 V1.1 ProductionStatsCardsProps
 * @prop {CropBatch[]} batches - 批次列表
 */
const props = defineProps({
  /** @type {CropBatch[]} */
  batches: { type: Array, default: () => [] }
})

// 1:1 翻译 V1.1 stats 数组，computed 对应 V1.1 的内联计算
const stats = computed(() => [
  {
    label: '总批次',
    value: props.batches.length,
    color: 'bg-blue-500',
    icon: Layers
  },
  {
    label: '执行中',
    value: props.batches.filter(
      (/** @type {CropBatch} */ b) => b.batchStatus === 'published' || b.batchStatus === 'in_progress'
    ).length,
    color: 'bg-emerald-500',
    icon: PlayCircle
  },
  {
    label: '已完成',
    value: props.batches.filter(
      (/** @type {CropBatch} */ b) => b.batchStatus === 'completed'
    ).length,
    color: 'bg-green-600',
    icon: CheckCircle2
  },
  {
    label: '草稿/已作废',
    value: props.batches.filter(
      (/** @type {CropBatch} */ b) => b.batchStatus === 'draft' || b.batchStatus === 'cancelled'
    ).length,
    color: 'bg-gray-500',
    icon: FileEdit
  }
])
</script>

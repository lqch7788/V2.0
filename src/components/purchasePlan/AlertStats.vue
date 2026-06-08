<!--
  @file 采购计划预警统计组件
  @description 1:1 翻译 V1.1 AlertStats.tsx
  - 修复 P0-17: defineProps({}) 空对象 → 显式声明 purchasePlansData + 防御 undefined
  - 修复 P0-EX-1: 从"4 张独立卡片"恢复为 V1.1 风格的"1 张卡片 + 标题 + 副标题 + 条件性预警徽章"
-->
<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- 绿色渐变图标块 - 与其他 3 个页面统一使用 lucide-vue-next + Tailwind class -->
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <ShoppingCart class="w-6 h-6 text-white" />
        </div>
      <!-- 标题 + 副标题（V1.1 1:1 还原，V2.0 之前丢失） -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">采购计划</h1>
        <p class="text-gray-500">物资采购计划的管理与审批</p>
      </div>
      </div>
      <!-- 条件性预警徽章（V1.1 AlertStats 唯一变化区） -->
      <div class="ml-auto flex items-center gap-4">
        <div
          v-if="overdueCount > 0"
          class="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg"
        >
          <span class="text-red-500 text-lg">🔴</span>
          <div>
            <div class="text-xs text-red-500">已逾期</div>
            <div class="text-lg font-bold text-red-600">{{ overdueCount }} 项</div>
          </div>
        </div>
        <div
          v-if="warningCount > 0"
          class="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg"
        >
          <span class="text-orange-500 text-lg">⚠️</span>
          <div>
            <div class="text-xs text-orange-500">即将到期</div>
            <div class="text-lg font-bold text-orange-600">{{ warningCount }} 项</div>
          </div>
        </div>
        <div
          v-if="overdueCount === 0 && warningCount === 0"
          class="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg"
        >
          <span class="text-green-500 text-lg">✓</span>
          <div>
            <div class="text-xs text-green-500">暂无预警</div>
            <div class="text-lg font-bold text-green-600">0 项</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file AlertStats.vue
 * @description 采购计划预警统计头部 - 1:1 翻译 V1.1 AlertStats.tsx
 * - 修复 P0-17: 显式声明 props.purchasePlansData
 * - 修复 P0-EX-1: 还原 V1.1 单卡设计（4 卡 → 1 卡 + 条件徽章）
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\AlertStats.tsx
 */
import { computed } from 'vue'
import { ShoppingCart } from 'lucide-vue-next'
import { calculateOverdueAlert } from '@/types/purchase'

// ✅ 修复 P0-17: 显式声明 props（之前 defineProps({}) 是空对象，父传 purchasePlansData 被丢弃）
const props = defineProps({
  /** 采购计划数据列表（来自父组件 PurchasePlanPage） */
  purchasePlansData: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// ✅ 修复 P0-17 衍生: 防御性访问（即使父传 undefined 也不会崩溃）
const overdueCount = computed(() => {
  return (props.purchasePlansData || []).filter((plan) => {
    const alert = calculateOverdueAlert(plan)
    return alert.level === 'overdue'
  }).length
})

const warningCount = computed(() => {
  return (props.purchasePlansData || []).filter((plan) => {
    const alert = calculateOverdueAlert(plan)
    return alert.level === 'warning'
  }).length
})
</script>

<template>
  <!-- 产量明细表组件 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 表头 -->
    <div class="px-6 py-4 border-b border-gray-100">
      <h3 class="font-semibold text-gray-900">产量明细表</h3>
      <p class="text-xs text-gray-400 mt-1">
        共 {{ sortedItems.length }} 条记录，总产量 {{ formatWeight(totalYield) }}
      </p>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">名称</th>
            <th class="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">产量(kg)</th>
            <th class="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">采收次数</th>
            <th class="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">平均单价</th>
            <th class="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">产值</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr
            v-for="(item, idx) in sortedItems"
            :key="`${item.name}-${idx}`"
            class="hover:bg-emerald-50/50 transition-colors"
          >
            <td class="px-4 py-2.5 text-sm text-gray-800 font-medium">{{ item.name || '-' }}</td>
            <td class="px-4 py-2.5 text-sm text-gray-900 text-right tabular-nums">
              {{ formatWeight(Number(item.value) || 0) }}
            </td>
            <td class="px-4 py-2.5 text-sm text-gray-500 text-right">
              {{ item.count ?? '-' }}
            </td>
            <td class="px-4 py-2.5 text-sm text-gray-900 text-right">
              {{ item.avgPrice ? formatMoney(item.avgPrice) : '-' }}
            </td>
            <td class="px-4 py-2.5 text-sm text-gray-900 text-right font-medium">
              {{ formatMoney(Number(item.totalAmount) || 0) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部汇总 -->
    <div class="px-6 py-3 bg-emerald-50/50 border-t border-emerald-100 flex flex-wrap items-center gap-x-6 gap-y-1">
      <span class="text-sm text-gray-600">
        总产量：<span class="font-bold text-emerald-700">{{ formatWeight(totalYield) }}</span>
      </span>
      <span class="text-sm text-gray-600">
        总产值：<span class="font-bold text-emerald-700">{{ formatMoney(totalAmount) }}</span>
      </span>
      <span class="text-xs text-gray-400">
        采收 {{ totalCount }} 次 · 均价 {{ formatMoney(avgUnitPrice) }}/kg
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// ========== Props ==========
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

// ========== 计算属性 ==========

/** 排序后的数据 */
const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
})

/** 总产量 */
const totalYield = computed(() => {
  return sortedItems.value.reduce((s, item) => s + (Number(item.value) || 0), 0)
})

/** 总产值 */
const totalAmount = computed(() => {
  return sortedItems.value.reduce((s, item) => s + (Number(item.totalAmount) || 0), 0)
})

/** 总采收次数 */
const totalCount = computed(() => {
  return sortedItems.value.reduce((s, item) => s + (Number(item.count) || 0), 0)
})

/** 平均单价 */
const avgUnitPrice = computed(() => {
  return totalYield.value > 0 ? totalAmount.value / totalYield.value : 0
})

// ========== 工具函数 ==========

/**
 * 格式化重量
 * @param {number} v - 重量值
 * @returns {string} 格式化后的字符串
 */
function formatWeight(v) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万 kg`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k kg`
  return `${v.toFixed(0)} kg`
}

/**
 * 格式化金额
 * @param {number} v - 金额值
 * @returns {string} 格式化后的字符串
 */
function formatMoney(v) {
  return `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

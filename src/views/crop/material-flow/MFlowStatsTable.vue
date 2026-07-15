<template>
  <!-- 统计通用表格（V1.1 L727-774 1:1） -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-auto max-h-[calc(100vh-280px)]">
      <table class="w-full table-fixed text-sm">
        <colgroup><col v-for="(h, i) in headers" :key="i" :style="{ width: `calc(${100/headers.length}%)` }" /></colgroup>
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th v-for="h in headers" :key="h.key" class="px-2 py-3 text-center text-xs font-semibold">{{ h.label }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading"><td :colspan="headers.length" class="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
          <tr v-else-if="data.length === 0"><td :colspan="headers.length" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
          <tr v-for="(item, i) in data" :key="i" class="hover:bg-emerald-50 transition-colors">
            <td v-for="h in headers" :key="h.key" :class="['px-2 py-3 text-center text-sm whitespace-nowrap', h.key==='totalQty'||h.key==='flowCount'||h.key==='batchCount' ? 'font-medium text-emerald-600 tabular-nums' : 'text-gray-700']">
              {{ rowMapper(item)[h.key] ?? '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  headers: { type: Array, default: () => [] },
  rowMapper: { type: Function, default: () => ({}) }
})
</script>
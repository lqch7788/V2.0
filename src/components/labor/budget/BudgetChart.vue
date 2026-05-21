<template>
  <div class="space-y-6">
    <!-- 月度人工成本趋势 -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">月度人工成本趋势 (万元)</h3>
      <div class="h-[300px] bg-gray-50 rounded flex items-center justify-center">
        <span class="text-gray-400">图表区域 - 柱状图</span>
      </div>
    </div>

    <!-- 月度采收量预测 -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">月度采收量预测 (万斤)</h3>
      <div class="h-[250px] bg-gray-50 rounded flex items-center justify-center">
        <span class="text-gray-400">图表区域 - 折线图</span>
      </div>
    </div>

    <!-- 季度对比 -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">季度人工成本对比 (万元)</h3>
      <div class="h-[300px] bg-gray-50 rounded flex items-center justify-center">
        <span class="text-gray-400">图表区域 - 柱状图</span>
      </div>
    </div>

    <!-- 用工人数趋势 -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">月度用工人数</h3>
      <div class="h-[200px] bg-gray-50 rounded flex items-center justify-center">
        <span class="text-gray-400">图表区域 - 柱状图</span>
      </div>
    </div>
  </div>
</template>

<script setup>

defineProps({})
</script>

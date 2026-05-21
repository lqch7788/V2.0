<template>
  <div :class="['grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3', className]">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
    >
      <div class="flex items-center gap-2">
        <!-- 图标容器 -->
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
          <el-icon :size="16" class="text-white">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <!-- 数值和标签 -->
        <div>
          <p class="text-lg font-bold text-gray-900">
            {{ stat.value }}{{ stat.unit || '' }}
          </p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 统计项配置接口
export 

defineProps({"className":"''"})
</script>

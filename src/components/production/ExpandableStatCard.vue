<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
    :class="{ 'ring-2 ring-blue-500': isExpanded }"
  >
    <!-- 卡片头部 - 可点击展开/收起 -->
    <button
      type="button"
      class="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors rounded-xl"
      @click="$emit('toggle')"
    >
      <!-- 图标区域 -->
      <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="iconBgColor">
        <component :is="icon" class="w-6 h-6 text-white" />
      </div>

      <!-- 标题 -->
      <div class="flex-1 text-left">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      </div>

      <!-- 统计数值区域 -->
      <div class="flex items-center gap-6">
        <div v-for="(stat, index) in stats" :key="index" class="text-right">
          <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
        </div>
      </div>

      <!-- 展开/收起指示器 -->
      <div class="flex items-center justify-center w-8 h-8">
        <ChevronDown
          class="w-5 h-5 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </button>

    <!-- 展开后的内容区域 -->
    <div v-if="isExpanded" class="px-4 pb-4 border-t border-gray-100">
      <div class="pt-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  icon: { type: Object, required: true },
  iconBgColor: { type: String, default: 'bg-blue-500' },
  stats: { type: Array, default: () => [] },
  isExpanded: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<!--
  TabHeader 通用组件（V1.1 1:1）
-->
<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
        <el-icon :size="24" color="white"><DataAnalysis /></el-icon>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-white">{{ title }}</h1>
        <p v-if="subtitle" class="text-emerald-50 mt-1">{{ subtitle }}</p>
      </div>
    </div>
    <div class="px-6">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
          :class="modelValue === tab.key
            ? 'border-emerald-600 text-emerald-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'"
          @click="$emit('update:modelValue', tab.key)"
        >
          <el-icon :size="16"><component :is="tab.icon" /></el-icon>
          {{ tab.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DataAnalysis } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  tabs: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>
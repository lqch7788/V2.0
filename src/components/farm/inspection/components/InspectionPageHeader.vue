<template>
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
        <el-icon :size="24" class="text-white"><View /></el-icon>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <p class="text-gray-500">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { View } from '@element-plus/icons-vue'

defineProps({"title":"'巡查记录'","subtitle":"'人工巡查记录管理'"})
</script>

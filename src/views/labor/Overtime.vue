<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Timer /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">加班管理</h1>
          <p class="text-xs text-gray-500">员工加班申请与审批</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <OvertimePanel />
    </div>
  </div>
</template>

<script setup>
import { Timer } from '@element-plus/icons-vue'
import OvertimePanel from './components/OvertimePanel.vue'
</script>

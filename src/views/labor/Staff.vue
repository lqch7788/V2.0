<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><User /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">人员管理</h1>
          <p class="text-xs text-gray-500">员工信息管理</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <StaffPanel />
    </div>
  </div>
</template>

<script setup>
import { User } from '@element-plus/icons-vue'
import StaffPanel from './components/StaffPanel.vue'
</script>

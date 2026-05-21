<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><CloseBold /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">请假管理</h1>
          <p class="text-xs text-gray-500">员工请假申请与审批</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <LeavePanel />
    </div>
  </div>
</template>

<script setup>
import { CloseBold } from '@element-plus/icons-vue'
import LeavePanel from './components/LeavePanel.vue'
</script>

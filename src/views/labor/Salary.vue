<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Coin /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">工资管理</h1>
          <p class="text-xs text-gray-500">员工工资发放管理</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <SalaryManage />
    </div>
  </div>
</template>

<script setup>
import { Coin } from '@element-plus/icons-vue'
import SalaryManage from './components/SalaryManage.vue'
</script>

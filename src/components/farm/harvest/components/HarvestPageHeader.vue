<template>
  <!-- 采收页面头部组件 - V1.1样式 -->
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white">
            <OfficeBuilding />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">采收入库</h1>
          <p class="text-gray-500">管理采收记录、品质分级和入库操作</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { OfficeBuilding } from '@element-plus/icons-vue'
</script>

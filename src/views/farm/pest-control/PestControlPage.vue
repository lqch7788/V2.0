<template>
  <!-- 病虫害管理主页面 - 占位实现，完整功能迁移待 V1.1 PestControlPage.tsx 后续对齐 -->
  <div class="space-y-6 p-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <WarnTriangleFilled class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">病虫害管理</h1>
            <p class="text-gray-500">记录和管理农作物病虫害防治情况</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 占位说明卡片 -->
    <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
      <div class="text-center text-gray-500">
        <el-icon :size="48" class="text-red-400 mb-4"><WarnTriangleFilled /></el-icon>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">病虫害管理页面</h3>
        <p class="text-sm">该页面为 V1.1 迁移对齐占位，完整功能（含筛选、统计卡片、表格、CRUD 弹窗）正在迁移中</p>
        <p class="text-xs mt-2 text-gray-400">对应 V1.1 源文件：src/components/farm/pest-control/PestControlPage.tsx</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WarnTriangleFilled } from '@element-plus/icons-vue'
</script>

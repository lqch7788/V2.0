<!--
  TempTask.vue - 临时任务管理主入口页面
  V1.1 TempTaskPage.tsx (1657行) → V2.0 重写
  数据源：useTempTaskStore (Pinia)，与 TempTaskTab.vue 共享同一份数据
-->
<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Clock /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">临时任务管理</h1>
          <p class="text-xs text-gray-500">临时任务派发 · 与农事任务中心临时任务Tab实时联动</p>
        </div>
      </div>
    </div>

    <!-- 主页面内容（1:1 迁移 V1.1 TempTaskPage） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <TempTaskPage />
    </div>
  </div>
</template>

<script setup>
/**
 * 临时任务主入口
 * V1.1 src/components/labor/tempTask/TempTaskPage.tsx 1:1 迁移
 *
 * 实际渲染委托给 ./components/tempTask/TempTaskPage.vue
 * 数据源：useTempTaskStore (Pinia)
 * 联动：TempTaskTab.vue (农事任务中心临时任务Tab) 共享同一份 store 数据
 */
import { Clock } from '@element-plus/icons-vue'
import TempTaskPage from './components/tempTask/TempTaskPage.vue'
</script>
<template>
  <div class="space-y-6">
    <!-- 统一Tab切换头部 - 从V1.1 TaskCenterPage.tsx 1:1迁移 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <el-icon :size="24" class="text-white"><List /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">智能任务中心</h1>
            <p class="text-gray-500">AI智能规划与调度管理</p>
          </div>
        </div>
      </div>

      <!-- Tab切换区域 -->
      <div class="mt-6">
        <div class="flex gap-8 border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex items-center gap-2 pb-3 text-base font-semibold transition-all relative"
            :class="activeTab === tab.key ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <el-icon :size="16"><component :is="tab.icon" /></el-icon>
            {{ tab.label }}
            <div
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Tab内容区域 - 工作流程：月度规划 → 每日规划 → 智能派工 -->
    <div>
      <MonthlyPlanningPage v-if="activeTab === 'monthly-planning'" />
      <DailyPlanningPage v-if="activeTab === 'daily-planning'" />
      <SmartDispatchPage v-if="activeTab === 'smart-dispatch'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { List, Calendar, Clock, MagicStick } from '@element-plus/icons-vue'
import MonthlyPlanningPage from '@/views/production/MonthlyPlanning.vue'
import DailyPlanningPage from '@/views/production/DailyPlanning.vue'
import SmartDispatchPage from '@/views/farm/SmartDispatch.vue'

/** 三个功能标签 - 与V1.1 TaskCenterPage.tsx完全一致 */
const tabs = [
  { key: 'monthly-planning', label: '月度规划', icon: Calendar },
  { key: 'daily-planning', label: '每日规划', icon: Clock },
  { key: 'smart-dispatch', label: '智能派工', icon: MagicStick },
]

/** 当前激活标签 - 默认显示月度规划 */
const activeTab = ref('monthly-planning')
</script>

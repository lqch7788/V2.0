<!--
  运营分析聚合页面容器
  对标 V1.1 src/pages/Labor/AnalyticsPage.tsx (44 行)
  功能：包含 4 个 Tab（人效分析、绩效考核、劳动风险预警、工作月报）
-->
<template>
  <div class="space-y-6">
    <!-- Tab 头部 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
          <el-icon :size="24" color="white"><TrendCharts /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">运营分析</h1>
          <p class="text-emerald-50 mt-1">人效与绩效考核分析</p>
        </div>
      </div>
      <div class="px-6">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === tab.key
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'"
            @click="activeTab = tab.key"
          >
            <el-icon :size="16"><component :is="tab.icon" /></el-icon>
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 内容 -->
    <div>
      <EfficiencyPage v-if="activeTab === 'efficiency'" />
      <PerformancePage v-else-if="activeTab === 'performance'" />
      <RiskPage v-else-if="activeTab === 'risk'" />
      <MonthlyReportPage v-else-if="activeTab === 'monthly-report'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TrendCharts, Trophy, WarningFilled, Document } from '@element-plus/icons-vue'
import EfficiencyPage from './efficiency/EfficiencyPage.vue'
import PerformancePage from './performance/PerformancePage.vue'
import RiskPage from './risk/RiskPage.vue'
import MonthlyReportPage from './monthly/MonthlyReportPage.vue'

const activeTab = ref('efficiency')

const tabs = [
  { key: 'efficiency', label: '人效分析', icon: TrendCharts },
  { key: 'performance', label: '绩效考核', icon: Trophy },
  { key: 'risk', label: '劳动风险预警', icon: WarningFilled },
  { key: 'monthly-report', label: '工作月报', icon: Document },
]
</script>
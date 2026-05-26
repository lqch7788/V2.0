<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><TrendCharts /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">运营分析</h1>
            <p class="text-xs text-gray-500">人效与绩效考核分析</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab标签页 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="border-b border-gray-200">
        <div class="flex items-center">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2',
              activeTab === tab.key
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            <el-icon :size="16"><component :is="tab.icon" /></el-icon>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab内容区域 -->
      <div class="p-6">
        <!-- 人效分析 -->
        <div v-show="activeTab === 'efficiency'">
          <EfficiencyAnalysis />
        </div>
        <!-- 绩效考核 -->
        <div v-show="activeTab === 'performance'">
          <PerformanceReview />
        </div>
        <!-- 劳动风险预警 -->
        <div v-show="activeTab === 'risk'">
          <RiskWarning />
        </div>
        <!-- 工作月报 -->
        <div v-show="activeTab === 'monthly-report'">
          <MonthlyReport />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TrendCharts, Trophy, Warning, Document } from '@element-plus/icons-vue'
import EfficiencyAnalysis from './components/EfficiencyAnalysis.vue'
import PerformanceReview from './components/PerformanceReview.vue'
import RiskWarning from './components/RiskWarning.vue'
import MonthlyReport from './components/MonthlyReport.vue'

// Tab配置
const tabs = [
  { key: 'efficiency', label: '人效分析', icon: TrendCharts },
  { key: 'performance', label: '绩效考核', icon: Trophy },
  { key: 'risk', label: '劳动风险预警', icon: Warning },
  { key: 'monthly-report', label: '工作月报', icon: Document }
]

// 当前激活的Tab
const activeTab = ref('efficiency')
</script>

<style scoped>
.bg-white {
  background-color: white;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.space-y-6 > * + * {
  margin-top: 24px;
}

.space-y-4 > * + * {
  margin-top: 16px;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.border-b-2 {
  border-bottom: 2px solid;
}

.border-transparent {
  border-color: transparent;
}

.border-emerald-500 {
  border-color: #10b981;
}

.text-emerald-600 {
  color: #10b981;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.p-6 {
  padding: 24px;
}
</style>

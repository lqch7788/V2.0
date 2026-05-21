<template>
  <!-- 经营分析页面 - 产量分析/成本分析/人工分析/多维度对比 四合一 TAB页 -->
  <div class="space-y-4">
    <PageHeader
      title="经营分析"
      description="产量·成本·人工·多维度对比，四位一体把控种植经营"
    >
      <template #icon>
        <el-icon :size="24" color="white"><DataAnalysis /></el-icon>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane name="yield">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><TrendCharts /></el-icon>
              产量分析
            </span>
          </template>
          <YieldAnalysis v-if="activeTab === 'yield'" />
        </el-tab-pane>

        <el-tab-pane name="cost">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><Money /></el-icon>
              成本分析
            </span>
          </template>
          <CostAnalysis v-if="activeTab === 'cost'" />
        </el-tab-pane>

        <el-tab-pane name="labor">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><User /></el-icon>
              人工分析
            </span>
          </template>
          <LaborAnalysis v-if="activeTab === 'labor'" />
        </el-tab-pane>

        <el-tab-pane name="comparison">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><Connection /></el-icon>
              多维度对比
            </span>
          </template>
          <div v-if="activeTab === 'comparison'" class="mt-4 flex items-center justify-center h-96 text-gray-400">
            <div class="text-center">
              <el-icon :size="48"><DataLine /></el-icon>
              <p class="mt-2">多维度对比功能开发中...</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DataAnalysis, TrendCharts, Money, User, Connection, DataLine } from '@element-plus/icons-vue'
import { PageHeader } from '@/components/summary'

// 子组件占位（实际项目中引入完整组件）
import YieldAnalysis from './sub/YieldAnalysis.vue'
import CostAnalysis from './sub/CostAnalysis.vue'
import LaborAnalysis from './sub/LaborAnalysis.vue'

const activeTab = ref('yield')

const handleTabChange = (tab) => {
  console.log('Tab changed to:', tab)
}
</script>

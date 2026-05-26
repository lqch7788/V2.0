<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Money /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">薪酬管理</h1>
            <p class="text-xs text-gray-500">工资与计件薪酬管理</p>
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
        <!-- 工资管理 -->
        <div v-show="activeTab === 'salary'">
          <SalaryManage />
        </div>
        <!-- 计件工资 -->
        <div v-show="activeTab === 'piecework'">
          <PieceworkManage />
        </div>
        <!-- 成本预测 -->
        <div v-show="activeTab === 'cost-forecast'">
          <CostForecast />
        </div>
        <!-- 预算申请 -->
        <div v-show="activeTab === 'budget-apply'">
          <BudgetApply />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Money, Goods, Coin, Files } from '@element-plus/icons-vue'
import SalaryManage from './components/SalaryManage.vue'
import PieceworkManage from './components/PieceworkManage.vue'
import CostForecast from './components/CostForecast.vue'
import BudgetApply from './components/BudgetApply.vue'

// Tab配置
const tabs = [
  { key: 'salary', label: '工资管理', icon: Money },
  { key: 'piecework', label: '计件工资', icon: Goods },
  { key: 'cost-forecast', label: '成本预测', icon: Coin },
  { key: 'budget-apply', label: '预算申请', icon: Files }
]

// 当前激活的Tab
const activeTab = ref('salary')
</script>

<style scoped>
/* 保持与V1.1一致的样式 */
</style>

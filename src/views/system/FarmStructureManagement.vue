<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link
            to="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#4B5563">
              <ArrowLeft />
            </el-icon>
          </router-link>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Grid />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">基地架构管理</h1>
            <p class="text-gray-500">公司基地、设施管理、区块划分和种植记录</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 切换栏 -->
    <div class="flex gap-0 border-b border-gray-200">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === tab.key
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB 内容区 -->
    <div class="min-h-[600px]">
      <!-- 公司基地 Tab -->
      <CompanyBaseTab v-if="activeTab === 'company-base'" />

      <!-- 设施管理 Tab -->
      <FacilityTab v-if="activeTab === 'facility'" />

      <!-- 区块划分 Tab -->
      <BlockTab v-if="activeTab === 'block'" />

      <!-- 种植记录 Tab -->
      <PlantingRecordTab v-if="activeTab === 'planting-record'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Grid } from '@element-plus/icons-vue'
import CompanyBaseTab from './tabs/CompanyBaseTab.vue'
import FacilityTab from './tabs/FacilityTab.vue'
import BlockTab from './tabs/BlockTab.vue'
import PlantingRecordTab from './tabs/PlantingRecordTab.vue'

// 路由实例
const router = useRouter()

// TAB 配置
const TABS = [
  { key: 'company-base', label: '公司基地' },
  { key: 'facility', label: '设施管理' },
  { key: 'block', label: '区块划分' },
  { key: 'planting-record', label: '种植记录' }
]

// 当前激活的 Tab
const activeTab = ref('company-base')
</script>

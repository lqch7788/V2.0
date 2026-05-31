<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            href="/park-archive"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回园区总览"
          >
            <el-icon :size="20" color="#4B5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Grid />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">基地架构管理</h1>
            <p class="text-gray-500">公司基地结构配置（管理员入口）</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 说明文字 -->
    <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <p class="text-sm text-blue-700">
        <span class="font-semibold">提示：</span>
        基地架构用于配置公司-基地的层级结构。日常运营（温室管理、区域划分、种植记录）请使用「
        <a href="/settings/base-operations" class="underline font-medium text-blue-600 hover:text-blue-800">基地运营中心</a>
        」。
      </p>
    </div>

    <!-- 公司基地 TAB -->
    <CompanyBaseTab />
  </div>
</template>

<script setup>
import { ArrowLeft, Grid } from '@element-plus/icons-vue'
import CompanyBaseTab from './tabs/CompanyBaseTab.vue'
</script>

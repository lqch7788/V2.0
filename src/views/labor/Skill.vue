<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Medal /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">技能管理</h1>
          <p class="text-xs text-gray-500">员工技能等级管理</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <SkillPanel />
    </div>
  </div>
</template>

<script setup>
import { Medal } from '@element-plus/icons-vue'
import SkillPanel from './components/SkillPanel.vue'
</script>

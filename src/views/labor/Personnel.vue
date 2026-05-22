<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <UserFilled />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">人事管理</h1>
          <p class="text-xs text-gray-500">员工信息与入职流程管理</p>
        </div>
      </div>
    </div>

    <!-- Tab 切换区域 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-tabs v-model="activeTab" class="personnel-tabs" @tab-change="handleTabChange">
        <!-- 员工信息 Tab -->
        <el-tab-pane label="员工信息" name="staff">
          <StaffPanel />
        </el-tab-pane>

        <!-- 临时工入职 Tab -->
        <el-tab-pane label="临时工入职" name="temp-worker">
          <TempWorkerPanel />
        </el-tab-pane>

        <!-- 招聘管理 Tab -->
        <el-tab-pane label="招聘管理" name="recruitment">
          <RecruitmentPanel />
        </el-tab-pane>

        <!-- 招聘申请 Tab -->
        <el-tab-pane label="招聘申请" name="recruitment-apply">
          <RecruitmentApplyPanel />
        </el-tab-pane>

        <!-- 入职办理 Tab -->
        <el-tab-pane label="入职办理" name="onboarding">
          <OnboardingPanel />
        </el-tab-pane>

        <!-- 离职申请 Tab -->
        <el-tab-pane label="离职申请" name="resignation">
          <ResignationPanel />
        </el-tab-pane>

        <!-- 合同管理 Tab -->
        <el-tab-pane label="合同管理" name="contract">
          <ContractPanel />
        </el-tab-pane>

        <!-- 技能档案 Tab -->
        <el-tab-pane label="技能档案" name="skill">
          <SkillPanel />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import StaffPanel from './components/StaffPanel.vue'
import TempWorkerPanel from './components/TempWorkerPanel.vue'
import RecruitmentPanel from './components/RecruitmentPanel.vue'
import RecruitmentApplyPanel from './components/RecruitmentApplyPanel.vue'
import OnboardingPanel from './components/OnboardingPanel.vue'
import ResignationPanel from './components/ResignationPanel.vue'
import ContractPanel from './components/ContractPanel.vue'
import SkillPanel from './components/SkillPanel.vue'

// 当前激活的Tab
const activeTab = ref('staff')

// Tab切换处理
const handleTabChange = (tabName) => {
  // noop
}
</script>

<style scoped>
/* 继承全局样式，使用Element Plus Tabs样式 */
.personnel-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  background: linear-gradient(to right, #10b981, #059669);
}

.personnel-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.personnel-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  height: 40px;
  line-height: 40px;
}

.personnel-tabs :deep(.el-tabs__item:hover) {
  color: #fff;
}

.personnel-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
  font-weight: 600;
}

.personnel-tabs :deep(.el-tabs__active-bar) {
  background-color: #fff;
  height: 3px;
}

.personnel-tabs :deep(.el-tabs__content) {
  padding: 16px;
}
</style>

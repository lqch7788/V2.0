<template>
  <div class="space-y-4">
    <!-- 页面标题 - V1.1 TabHeader 风格: 白底 + 渐变图标 + 标题副标题 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" color="white">
            <UserFilled />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">人事管理</h1>
          <p class="text-gray-500">员工信息与入职流程管理</p>
        </div>
      </div>

      <!-- Tab切换区域 - V1.1 TabHeader 1:1: flex gap-8 + border-b + 文字+图标 -->
      <div class="mt-6">
        <div class="flex gap-8 border-b border-gray-200 personnel-tabs-nav">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'flex items-center gap-2 pb-3 text-base font-semibold transition-all relative rounded-none bg-transparent border-0 cursor-pointer',
              activeTab === tab.key
                ? 'text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
            <span
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 内容区 - 按 activeTab 切换显示对应 panel -->
    <div class="personnel-tab-content">
      <StaffPanel v-show="activeTab === 'staff'" />
      <TempWorkerPanel v-show="activeTab === 'temp-worker'" />
      <RecruitmentPanel v-show="activeTab === 'recruitment'" />
      <RecruitmentApplyPanel v-show="activeTab === 'recruitment-apply'" />
      <OnboardingPanel v-show="activeTab === 'onboarding'" />
      <ResignationPanel v-show="activeTab === 'resignation'" />
      <ContractPanel v-show="activeTab === 'contract'" />
      <SkillPanel v-show="activeTab === 'skill'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { Users, UserPlus, Briefcase, Search, GraduationCap, UserMinus, FileSignature, Award } from 'lucide-vue-next'
import StaffPanel from './components/StaffPanel.vue'
import TempWorkerPanel from './components/TempWorkerPanel.vue'
import RecruitmentPanel from './components/RecruitmentPanel.vue'
import RecruitmentApplyPanel from './components/RecruitmentApplyPanel.vue'
import OnboardingPanel from './components/OnboardingPanel.vue'
import ResignationPanel from './components/ResignationPanel.vue'
import ContractPanel from './components/ContractPanel.vue'
import SkillPanel from './components/SkillPanel.vue'

// V1.1 PersonnelPage.tsx L18-27 TABS 数组 1:1 翻译
const TABS = [
  { key: 'staff', label: '员工信息', icon: Users },
  { key: 'temp-worker', label: '临时工入职', icon: UserPlus },
  { key: 'recruitment', label: '招聘管理', icon: Briefcase },
  { key: 'recruitment-apply', label: '招聘申请', icon: Search },
  { key: 'onboarding', label: '入职办理', icon: GraduationCap },
  { key: 'resignation', label: '离职申请', icon: UserMinus },
  { key: 'contract', label: '合同管理', icon: FileSignature },
  { key: 'skill', label: '技能档案', icon: Award },
]

// 当前激活的Tab
const activeTab = ref('staff')

// Tab切换处理
const handleTabChange = (tabName) => {
  activeTab.value = tabName
}
</script>

<style scoped>
/* V1.1 TabHeader 1:1 样式 - 自定义按钮组（不用 el-tabs） */
.personnel-tabs-nav button {
  outline: none;
}

.personnel-tab-content {
  margin-top: 0;
}
</style>

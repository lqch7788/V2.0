<!--
  人事管理聚合页面
-->
<template>
  <div class="space-y-6">
    <TabHeader
      title="人事管理"
      subtitle="员工信息与入职流程管理"
      v-model="activeTab"
      :tabs="tabs"
    />
    <PersonnelManagementPage v-if="activeTab === 'staff'" />
    <TempWorkerPage v-else-if="activeTab === 'temp-worker'" />
    <RecruitmentPage v-else-if="activeTab === 'recruitment'" />
    <RecruitmentApplyPage v-else-if="activeTab === 'recruitment-apply'" />
    <OnboardingPage v-else-if="activeTab === 'onboarding'" />
    <ResignationPage v-else-if="activeTab === 'resignation'" />
    <ContractManagementPage v-else-if="activeTab === 'contract'" />
    <SkillPage v-else-if="activeTab === 'skill'" />
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import {
  User, UserFilled, Briefcase, Search, Promotion,
  Remove, Document, Medal,
} from '@element-plus/icons-vue'
import TabHeader from './components/TabHeader.vue'
import PersonnelManagementPage from './personnel/PersonnelManagementPage.vue'
import TempWorkerPage from './tempWorker/TempWorkerPage.vue'
import RecruitmentPage from './recruitment/RecruitmentPage.vue'
import RecruitmentApplyPage from './recruitment/RecruitmentApplyPage.vue'
import OnboardingPage from './onboarding/OnboardingPage.vue'
import ResignationPage from './resignation/ResignationPage.vue'
import ContractManagementPage from './contract/ContractManagementPage.vue'
import SkillPage from './skill/SkillPage.vue'

const activeTab = ref('staff')

const tabs = [
  { key: 'staff', label: '员工信息', icon: markRaw(User) },
  { key: 'temp-worker', label: '临时工入职', icon: markRaw(UserFilled) },
  { key: 'recruitment', label: '招聘管理', icon: markRaw(Briefcase) },
  { key: 'recruitment-apply', label: '招聘申请', icon: markRaw(Search) },
  { key: 'onboarding', label: '入职办理', icon: markRaw(Promotion) },
  { key: 'resignation', label: '离职申请', icon: markRaw(Remove) },
  { key: 'contract', label: '合同管理', icon: markRaw(Document) },
  { key: 'skill', label: '技能档案', icon: markRaw(Medal) },
]
</script>
<template>
  <el-dialog
    :model-value="isOpen"
    :title="`${worker?.name || ''} - 员工详情`"
    width="800px"
    @close="onClose"
  >
    <div v-if="worker" class="space-y-6">
      <!-- 基本信息 -->
      <div class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-emerald-600"><User /></el-icon>
          基本信息
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">性别</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.gender }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">年龄</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.age }}岁</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">出生日期</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.birthDate }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">身份证号</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.idCard }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">联系电话</p>
            <p class="text-sm font-medium text-gray-900 flex items-center gap-1">
              <el-icon><Phone /></el-icon>{{ worker.phone }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">电子邮箱</p>
            <p class="text-sm font-medium text-gray-900 flex items-center gap-1">
              <el-icon><Message /></el-icon>{{ worker.email || '-' }}
            </p>
          </div>
          <div class="col-span-2">
            <p class="text-xs text-gray-500 mb-1">户籍地址</p>
            <p class="text-sm font-medium text-gray-900 flex items-center gap-1">
              <el-icon><Location /></el-icon>{{ worker.address }}
            </p>
          </div>
          <div class="col-span-2">
            <p class="text-xs text-gray-500 mb-1">现居住地址</p>
            <p class="text-sm font-medium text-gray-900 flex items-center gap-1">
              <el-icon><Location /></el-icon>{{ worker.residenceAddress }}
            </p>
          </div>
        </div>
      </div>

      <!-- 紧急联系人 -->
      <div class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-red-500"><Phone /></el-icon>
          紧急联系人
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">姓名</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.emergencyContact }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">关系</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.emergencyRelation }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">联系电话</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.emergencyPhone }}</p>
          </div>
        </div>
      </div>

      <!-- 工作信息 -->
      <div class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-emerald-600"><Briefcase /></el-icon>
          工作信息
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">部门</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.department }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">班组</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.team }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">岗位</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.position }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">作业区域</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.workArea }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">技能等级</p>
            <span :class="['inline-block px-2 py-1 rounded-full text-xs font-medium', getSkillLevelBadge(worker.skillLevel)]">
              {{ getSkillLevelLabel(worker.skillLevel) }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">工作年限</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.workYears }}年</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">工资类型</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.wagesType }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">入职日期</p>
            <p class="text-sm font-medium text-gray-900 flex items-center gap-1">
              <el-icon><Calendar /></el-icon>{{ worker.hireDate }}
            </p>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-xs text-gray-500 mb-2">技能标签</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, index) in worker.skillTags"
              :key="index"
              class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 合同信息 -->
      <div class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-emerald-600"><Document /></el-icon>
          合同信息
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">合同编号</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.contractNo }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">合同类型</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.contractType }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">合同状态</p>
            <span :class="['inline-block px-2 py-1 rounded-full text-xs font-medium', getContractStatusBadge(worker.contractStatus)]">
              {{ worker.contractStatus }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">合同到期</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.contractExpireDate }}</p>
          </div>
        </div>
      </div>

      <!-- 教育信息 -->
      <div class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-emerald-600"><School /></el-icon>
          教育信息
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">学历</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.education }}</p>
          </div>
          <div v-if="worker.major">
            <p class="text-xs text-gray-500 mb-1">专业</p>
            <p class="text-sm font-medium text-gray-900">{{ worker.major }}</p>
          </div>
        </div>
      </div>

      <!-- 培训记录 -->
      <div v-if="worker.trainingRecords && worker.trainingRecords.length > 0" class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-emerald-600"><Medal /></el-icon>
          培训记录
        </h3>
        <div class="space-y-3">
          <div
            v-for="record in worker.trainingRecords"
            :key="record.id"
            class="bg-white rounded-lg p-3 border border-gray-100"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{{ record.trainingType }}</span>
              <span class="text-xs text-gray-500">{{ record.trainingDate }}</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ record.trainingContent }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>培训时长: {{ record.trainingHours }}小时</span>
              <span>讲师: {{ record.trainer }}</span>
              <span v-if="record.certificate">证书: {{ record.certificate }}</span>
              <span v-if="record.score">成绩: {{ record.score }}分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作经历 -->
      <div v-if="worker.workExperiences && worker.workExperiences.length > 0" class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-emerald-600"><Clock /></el-icon>
          工作经历
        </h3>
        <div class="space-y-3">
          <div
            v-for="exp in worker.workExperiences"
            :key="exp.id"
            class="bg-white rounded-lg p-3 border border-gray-100"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{{ exp.company }}</span>
              <span class="text-xs text-gray-500">{{ exp.startDate }} ~ {{ exp.endDate }}</span>
            </div>
            <p class="text-sm text-gray-600 mb-1">岗位: {{ exp.position }}</p>
            <p class="text-sm text-gray-600 mb-1">工作内容: {{ exp.workContent }}</p>
            <p class="text-sm text-gray-500">离职原因: {{ exp.leavingReason }}</p>
          </div>
        </div>
      </div>

      <!-- 年度考核 -->
      <div v-if="worker.annualAssessments && worker.annualAssessments.length > 0" class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon class="text-emerald-600"><Medal /></el-icon>
          年度考核
        </h3>
        <div class="space-y-3">
          <div
            v-for="assessment in worker.annualAssessments"
            :key="assessment.id"
            class="bg-white rounded-lg p-3 border border-gray-100"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{{ assessment.year }}年度考核</span>
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', getRatingBadge(assessment.rating)]">
                {{ assessment.rating }} ({{ assessment.score }}分)
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-1">考核日期: {{ assessment.assessmentDate }} | 考核人: {{ assessment.assessor }}</p>
            <p class="text-sm text-gray-600 mb-1">优点: {{ assessment.strengths }}</p>
            <p class="text-sm text-gray-600 mb-1">不足: {{ assessment.weaknesses }}</p>
            <p class="text-sm text-gray-600">目标: {{ assessment.goals }}</p>
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div v-if="worker.remarks" class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <el-icon class="text-emerald-600"><Document /></el-icon>
          备注
        </h3>
        <p class="text-sm text-gray-700">{{ worker.remarks }}</p>
      </div>

      <!-- 状态 -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200">
        <div class="flex items-center gap-4">
          <span :class="['inline-flex px-3 py-1 rounded-full text-sm font-medium', getStatusBadge(worker.status)]">
            {{ getStatusLabel(worker.status) }}
          </span>
        </div>
        <el-button @click="onClose">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import {
  User, Phone, Message, Location, Briefcase, Calendar, Document, School, Medal, Clock
} from '@element-plus/icons-vue'

// Worker 类型定义

defineProps({})

// 技能等级配置
const getSkillLevelBadge = (level) => {
  const map = {
    '初级': 'bg-gray-100 text-gray-700',
    '中级': 'bg-blue-100 text-blue-700',
    '高级': 'bg-emerald-100 text-emerald-700',
    '资深': 'bg-purple-100 text-purple-700',
  }
  return map[level] || 'bg-gray-100 text-gray-700'
}

const getSkillLevelLabel = (level) => level

// 合同状态样式
const getContractStatusBadge = (status) => {
  const map = {
    '新签': 'bg-blue-100 text-blue-700',
    '续签': 'bg-green-100 text-green-700',
    '到期': 'bg-amber-100 text-amber-700',
    '终止': 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

// 考核评级样式
const getRatingBadge = (rating) => {
  const map = {
    '优秀': 'bg-green-100 text-green-700',
    '良好': 'bg-blue-100 text-blue-700',
    '合格': 'bg-amber-100 text-amber-700',
    '不合格': 'bg-red-100 text-red-700',
  }
  return map[rating] || 'bg-gray-100 text-gray-700'
}

// 员工状态配置
const WORKER_STATUS_CONFIG = {
  '在职': { label: '在职', badge: 'bg-green-100 text-green-700' },
  '离职': { label: '离职', badge: 'bg-gray-100 text-gray-700' },
  '休假': { label: '休假', badge: 'bg-blue-100 text-blue-700' },
  '退休': { label: '退休', badge: 'bg-amber-100 text-amber-700' },
}

const getStatusBadge = (status) => {
  return WORKER_STATUS_CONFIG[status]?.badge || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status) => {
  return WORKER_STATUS_CONFIG[status]?.label || status
}
</script>

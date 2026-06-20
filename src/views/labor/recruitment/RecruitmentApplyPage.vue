<!--
  招聘申请页面（V1.1 风格）
  对标 V1.1 src/pages/Labor/RecruitmentPage.tsx（招聘申请）
-->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">招聘申请列表</h2>
        <p class="text-sm text-gray-500">各部门提交的招聘需求</p>
      </div>
      <el-button type="primary" @click="showForm = true">
        <el-icon><Plus /></el-icon>新建申请
      </el-button>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-6">
      <el-table :data="applications" border>
        <el-table-column prop="code" label="申请编号" width="140">
          <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="department" label="申请部门" min-width="120" />
        <el-table-column prop="position" label="招聘岗位" min-width="140" />
        <el-table-column prop="count" label="人数" width="80" align="right" />
        <el-table-column prop="reason" label="申请原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="applicant" label="申请人" min-width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button link type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const showForm = ref(false)

const applications = ref([
  { code: 'APP001', department: '生产部', position: '生产工', count: 5, reason: '扩产需求', applicant: '李经理', status: 'pending' },
  { code: 'APP002', department: '技术部', position: '技术员', count: 2, reason: '项目紧急', applicant: '王总监', status: 'approved' },
  { code: 'APP003', department: '后勤部', position: '清洁工', count: 1, reason: '人员流动', applicant: '张主管', status: 'pending' },
])

const STATUS_MAP = { pending: { tag: 'warning', text: '待审批' }, approved: { tag: 'success', text: '已通过' }, rejected: { tag: 'danger', text: '已拒绝' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s

const handleApprove = () => {}
const handleReject = () => {}
</script>
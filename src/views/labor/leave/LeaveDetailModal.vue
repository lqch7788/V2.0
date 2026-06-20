<!--
  请假详情弹窗
  对标 V1.1 src/components/labor/leave/LeaveDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="请假详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="leave" :column="2" border>
      <el-descriptions-item label="申请人">{{ leave.applicantName }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ leave.department }}</el-descriptions-item>
      <el-descriptions-item label="请假类型">{{ typeText(leave.type) }}</el-descriptions-item>
      <el-descriptions-item label="请假天数">{{ leave.days }} 天</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ leave.startDate }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ leave.endDate }}</el-descriptions-item>
      <el-descriptions-item label="申请时间">{{ leave.applyTime }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(leave.status)" size="small">{{ statusText(leave.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="请假原因" :span="2">{{ leave.reason }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  leave: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const TYPE_MAP = { personal: '事假', sick: '病假', annual: '年假', marriage: '婚假', maternity: '产假', bereavement: '丧假' }
const STATUS_MAP = {
  pending: { tag: 'warning', text: '待审批' },
  approved: { tag: 'success', text: '已通过' },
  rejected: { tag: 'danger', text: '已拒绝' },
}

const typeText = (t) => TYPE_MAP[t] || t
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
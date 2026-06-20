<!--
  考勤补卡详情弹窗
  对标 V1.1 src/pages/Labor/components/AttendanceRepairPage/AttendanceRepairPageModals/DetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="补卡详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item label="单号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="申请人">{{ record.applicantName }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ record.department }}</el-descriptions-item>
      <el-descriptions-item label="补卡日期">{{ record.date }}</el-descriptions-item>
      <el-descriptions-item label="补卡类型">{{ typeText(record.type) }}</el-descriptions-item>
      <el-descriptions-item label="原时间">{{ record.originalTime }}</el-descriptions-item>
      <el-descriptions-item label="新时间">{{ record.newTime }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(record.status)" size="small">{{ statusText(record.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="原因" :span="2">{{ record.reason }}</el-descriptions-item>
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
  record: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const TYPE_MAP = { checkIn: '上班补卡', checkOut: '下班补卡', both: '上下班补卡' }
const STATUS_MAP = { pending: { tag: 'warning', text: '待审批' }, approved: { tag: 'success', text: '已通过' }, rejected: { tag: 'danger', text: '已拒绝' } }
const typeText = (t) => TYPE_MAP[t] || t
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
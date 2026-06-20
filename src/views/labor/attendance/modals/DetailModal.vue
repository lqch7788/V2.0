<!--
  考勤详情弹窗
  对标 V1.1 src/components/labor/attendance/modals/DetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="考勤详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="record" class="space-y-3">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="员工姓名">{{ record.workerName }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ record.workerCode }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ record.department }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ record.date }}</el-descriptions-item>
        <el-descriptions-item label="上班打卡">{{ record.checkIn || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下班打卡">{{ record.checkOut || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作时长">{{ record.workHours }} 小时</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(record.status)" size="small">{{ statusText(record.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
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

const STATUS_MAP = {
  normal: { tag: 'success', text: '正常' },
  late: { tag: 'warning', text: '迟到' },
  early: { tag: 'warning', text: '早退' },
  absent: { tag: 'danger', text: '缺勤' },
  leave: { tag: 'info', text: '请假' },
}

const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
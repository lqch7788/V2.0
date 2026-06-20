<!--
  风险预警详情弹窗
  对标 V1.1 src/components/labor/risk/RiskAlertDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="风险预警详情" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="alert" :column="2" border>
      <el-descriptions-item label="预警编号">{{ alert.code }}</el-descriptions-item>
      <el-descriptions-item label="风险等级">
        <el-tag :type="levelTagType(alert.level)" size="small">{{ levelText(alert.level) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="预警类型">{{ alert.type }}</el-descriptions-item>
      <el-descriptions-item label="发生时间">{{ alert.date }}</el-descriptions-item>
      <el-descriptions-item label="关联部门">{{ alert.department }}</el-descriptions-item>
      <el-descriptions-item label="关联员工">{{ alert.workerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="预警标题" :span="2">{{ alert.title }}</el-descriptions-item>
      <el-descriptions-item label="预警内容" :span="2">{{ alert.description }}</el-descriptions-item>
      <el-descriptions-item label="处理状态">
        <el-tag :type="statusTagType(alert.status)" size="small">{{ statusText(alert.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="处理时间">{{ alert.handleTime || '-' }}</el-descriptions-item>
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
  alert: { type: Object, default: null },
})

defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const LEVEL_MAP = { high: { tag: 'danger', text: '高' }, medium: { tag: 'warning', text: '中' }, low: { tag: 'info', text: '低' } }
const STATUS_MAP = {
  pending: { tag: 'warning', text: '待处理' },
  handling: { tag: 'primary', text: '处理中' },
  resolved: { tag: 'success', text: '已处理' },
  ignored: { tag: 'info', text: '已忽略' },
}

const levelTagType = (l) => LEVEL_MAP[l]?.tag || ''
const levelText = (l) => LEVEL_MAP[l]?.text || l
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
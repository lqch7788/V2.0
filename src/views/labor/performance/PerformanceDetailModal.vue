<!--
  绩效详情弹窗
  对标 V1.1 src/components/labor/performance/PerformanceDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="绩效详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item label="编号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="员工">{{ record.workerName }}</el-descriptions-item>
      <el-descriptions-item label="考核周期">{{ record.period }}</el-descriptions-item>
      <el-descriptions-item label="评分">{{ record.score }}</el-descriptions-item>
      <el-descriptions-item label="等级">
        <el-tag :type="levelTagType(record.level)" size="small">{{ record.level }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(record.status)" size="small">{{ statusText(record.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="评语" :span="2">{{ record.comment || '-' }}</el-descriptions-item>
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

defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const LEVEL_MAP = { A: 'success', B: 'primary', C: 'warning', D: 'danger' }
const STATUS_MAP = { draft: { tag: 'info', text: '草稿' }, submitted: { tag: 'warning', text: '已提交' }, approved: { tag: 'success', text: '已审核' } }

const levelTagType = (l) => LEVEL_MAP[l] || 'info'
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
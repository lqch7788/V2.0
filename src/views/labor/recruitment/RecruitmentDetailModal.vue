<!--
  招聘详情弹窗
  对标 V1.1 src/components/labor/recruitment/RecruitmentDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="招聘详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item label="招聘编号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="招聘岗位">{{ record.position }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ record.department }}</el-descriptions-item>
      <el-descriptions-item label="招聘人数">{{ record.count }}</el-descriptions-item>
      <el-descriptions-item label="薪资范围">¥{{ record.salaryMin }}-¥{{ record.salaryMax }}</el-descriptions-item>
      <el-descriptions-item label="发布日期">{{ record.publishDate }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(record.status)" size="small">{{ statusText(record.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="已收到简历">{{ record.appliedCount || 0 }}</el-descriptions-item>
      <el-descriptions-item label="职位描述" :span="2">{{ record.description || '-' }}</el-descriptions-item>
      <el-descriptions-item label="任职要求" :span="2">{{ record.requirement || '-' }}</el-descriptions-item>
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

const STATUS_MAP = {
  open: { tag: 'success', text: '招聘中' },
  closed: { tag: 'info', text: '已关闭' },
  filled: { tag: 'warning', text: '已招满' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
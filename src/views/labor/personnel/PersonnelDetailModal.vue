<!--
  员工详情弹窗
  对标 V1.1 src/components/labor/personnel/PersonnelDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="员工详情" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item label="工号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ record.name }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ record.gender === 'M' ? '男' : '女' }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ record.department }}</el-descriptions-item>
      <el-descriptions-item label="岗位">{{ record.position }}</el-descriptions-item>
      <el-descriptions-item label="电话">{{ record.phone }}</el-descriptions-item>
      <el-descriptions-item label="入职日期">{{ record.entryDate }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(record.status)" size="small">{{ statusText(record.status) }}</el-tag>
      </el-descriptions-item>
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
  active: { tag: 'success', text: '在职' },
  leave: { tag: 'warning', text: '休假' },
  resigned: { tag: 'info', text: '离职' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
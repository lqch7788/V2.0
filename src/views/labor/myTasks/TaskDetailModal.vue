<!--
  任务详情弹窗
  对标 V1.1 src/components/labor/myTasks/TaskDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="任务详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="task" :column="2" border>
      <el-descriptions-item label="任务编号">{{ task.code }}</el-descriptions-item>
      <el-descriptions-item label="任务标题">{{ task.title }}</el-descriptions-item>
      <el-descriptions-item label="任务类型"><el-tag size="small">{{ task.type }}</el-tag></el-descriptions-item>
      <el-descriptions-item label="优先级">
        <el-tag :type="priorityTagType(task.priority)" size="small">{{ priorityText(task.priority) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="执行人">{{ task.executorName }}</el-descriptions-item>
      <el-descriptions-item label="计划日期">{{ task.plannedDate }}</el-descriptions-item>
      <el-descriptions-item label="温室">{{ task.greenhouseName }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(task.status)" size="small">{{ statusText(task.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ task.remark || '-' }}</el-descriptions-item>
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
  task: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const PRIORITY_MAP = { urgent: { tag: 'danger', text: '加急' }, high: { tag: 'warning', text: '高' }, normal: { tag: 'info', text: '普通' } }
const STATUS_MAP = {
  pending: { tag: 'warning', text: '待执行' },
  executing: { tag: 'primary', text: '执行中' },
  completed: { tag: 'success', text: '已完成' },
  overdue: { tag: 'danger', text: '已超时' },
}

const priorityTagType = (p) => PRIORITY_MAP[p]?.tag || ''
const priorityText = (p) => PRIORITY_MAP[p]?.text || p
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
<!--
  农场 Hub 巡检详情弹窗
  对标 V1.1 src/components/farm/hub/InspectionDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="巡检详情" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item label="巡检编号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="巡检人">{{ record.inspectorName }}</el-descriptions-item>
      <el-descriptions-item label="巡检区域">{{ record.area }}</el-descriptions-item>
      <el-descriptions-item label="巡检时间">{{ record.inspectTime }}</el-descriptions-item>
      <el-descriptions-item label="问题状态" :span="2">
        <el-tag :type="record.hasIssue ? 'danger' : 'success'" size="small">
          {{ record.hasIssue ? '发现问题' : '正常' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="record.description" label="问题描述" :span="2">
        {{ record.description }}
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
</script>
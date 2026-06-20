<!--
  巡检详情弹窗
  对标 V1.1 src/components/farm/inspection/modals/DetailInspectionModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="巡检详情" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="record" class="space-y-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="巡检编号">{{ record.code }}</el-descriptions-item>
        <el-descriptions-item label="巡检人">{{ record.inspectorName }}</el-descriptions-item>
        <el-descriptions-item label="巡检时间">{{ record.inspectTime }}</el-descriptions-item>
        <el-descriptions-item label="巡检区域">{{ record.areaName }}</el-descriptions-item>
        <el-descriptions-item label="问题状态">
          <el-tag :type="hasIssueTagType(record.hasIssue)" size="small">
            {{ record.hasIssue ? '发现问题' : '正常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="严重程度">
          <el-tag v-if="record.severity" :type="severityTagType(record.severity)" size="small">
            {{ severityText(record.severity) }}
          </el-tag>
          <span v-else class="text-gray-400">-</span>
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="record.description">
        <h4 class="font-semibold mb-2">问题描述</h4>
        <p class="text-sm text-gray-700 bg-amber-50 p-3 rounded">{{ record.description }}</p>
      </div>
      <div v-if="record.images?.length">
        <h4 class="font-semibold mb-2">现场照片</h4>
        <el-image v-for="(img, idx) in record.images" :key="idx" :src="img" :preview-src-list="record.images" fit="cover" class="w-20 h-20 mr-2 rounded" />
      </div>
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

const hasIssueTagType = (v) => (v ? 'danger' : 'success')
const SEVERITY_MAP = {
  low: { tag: 'info', text: '轻微' },
  medium: { tag: 'warning', text: '中等' },
  high: { tag: 'danger', text: '严重' },
}
const severityTagType = (s) => SEVERITY_MAP[s]?.tag || ''
const severityText = (s) => SEVERITY_MAP[s]?.text || s
</script>
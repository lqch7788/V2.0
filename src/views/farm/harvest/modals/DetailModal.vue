<!--
  采收详情弹窗
  对标 V1.1 src/components/farm/harvest/modals/DetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="采收详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item label="采收批次">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="品种">{{ record.varietyName }}</el-descriptions-item>
      <el-descriptions-item label="采收人">{{ record.harvesterName }}</el-descriptions-item>
      <el-descriptions-item label="采收日期">{{ record.harvestDate }}</el-descriptions-item>
      <el-descriptions-item label="采收量">{{ record.yield }} kg</el-descriptions-item>
      <el-descriptions-item label="合格量">{{ record.qualifiedYield }} kg</el-descriptions-item>
      <el-descriptions-item label="温室">{{ record.greenhouseName }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(record.status)" size="small">{{ statusText(record.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ record.remark || '-' }}</el-descriptions-item>
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

const STATUS_MAP = { pending: { tag: 'warning', text: '待处理' }, completed: { tag: 'success', text: '已完成' }, stored: { tag: 'primary', text: '已入库' } }
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>
<!--
  肥料详情弹窗
  对标 V1.1 src/components/farm/fertilizer/FertilizerDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="肥料详情" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="fertilizer" :column="2" border>
      <el-descriptions-item label="编号">{{ fertilizer.code }}</el-descriptions-item>
      <el-descriptions-item label="名称">{{ fertilizer.name }}</el-descriptions-item>
      <el-descriptions-item label="类型">
        <el-tag size="small">{{ fertilizer.type }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="库存">{{ fertilizer.stock }} kg</el-descriptions-item>
      <el-descriptions-item label="N含量">{{ fertilizer.nitrogen }}%</el-descriptions-item>
      <el-descriptions-item label="P含量">{{ fertilizer.phosphorus }}%</el-descriptions-item>
      <el-descriptions-item label="K含量">{{ fertilizer.potassium }}%</el-descriptions-item>
      <el-descriptions-item label="供应商">{{ fertilizer.supplier || '-' }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ fertilizer.remark || '-' }}</el-descriptions-item>
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
  fertilizer: { type: Object, default: null },
})

defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>
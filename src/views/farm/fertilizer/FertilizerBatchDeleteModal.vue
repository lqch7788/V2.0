<!--
  肥料批量删除弹窗
  对标 V1.1 src/components/farm/fertilizer/FertilizerBatchDeleteModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量删除" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条肥料记录执行批量删除</p>
    <div class="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
      ⚠️ 批量删除操作不可恢复，请谨慎
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" :loading="loading" @click="$emit('confirm')">确认删除</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  records: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>
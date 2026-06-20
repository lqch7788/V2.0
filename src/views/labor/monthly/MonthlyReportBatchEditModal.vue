<!--
  月报批量编辑弹窗
  对标 V1.1 src/components/labor/monthly/MonthlyReportBatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑月报" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条月报执行批量修改</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="调整奖金">
        <el-input-number v-model="form.bonus" :min="0" :precision="2" :step="100" class="w-full" />
      </el-form-item>
      <el-form-item label="调整扣款">
        <el-input-number v-model="form.deduction" :min="0" :precision="2" :step="50" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('confirm', form)">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

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

const form = reactive({ bonus: 0, deduction: 0 })
</script>
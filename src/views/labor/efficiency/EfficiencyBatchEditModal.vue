<!--
  效率批量编辑弹窗
  对标 V1.1 src/components/labor/efficiency/EfficiencyBatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑效率" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条效率记录执行批量修改</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="调整系数">
        <el-input-number v-model="form.factor" :min="0" :max="10" :precision="2" :step="0.1" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
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

const form = reactive({
  factor: 1.0,
  remark: '',
})
</script>
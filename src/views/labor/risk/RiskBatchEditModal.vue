<!--
  风险批量编辑弹窗
  对标 V1.1 src/components/labor/risk/RiskBatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量处理风险" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条风险执行批量处理</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="处理状态">
        <el-radio-group v-model="form.status">
          <el-radio value="resolved">标记已处理</el-radio>
          <el-radio value="ignored">标记已忽略</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="处理意见">
        <el-input v-model="form.comment" type="textarea" :rows="2" />
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

const form = reactive({ status: 'resolved', comment: '' })
</script>
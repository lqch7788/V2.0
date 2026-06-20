<!--
  请假批量编辑弹窗
  对标 V1.1 src/components/labor/leave/modals/LeaveBatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑请假" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条请假申请执行批量操作</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="操作">
        <el-radio-group v-model="form.action">
          <el-radio value="approve">批量通过</el-radio>
          <el-radio value="reject">批量拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
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

const form = reactive({
  action: 'approve',
  comment: '',
})
</script>
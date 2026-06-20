<!--
  任务拒绝弹窗
  对标 V1.1 src/components/labor/myTasks/TaskRejectModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="拒绝任务" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="拒绝原因" required>
        <el-input v-model="form.reason" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请说明拒绝原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" :loading="loading" :disabled="!form.reason.trim()" @click="$emit('submit', form)">确认拒绝</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  reason: '',
})
</script>
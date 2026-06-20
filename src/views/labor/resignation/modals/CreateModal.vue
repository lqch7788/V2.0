<!--
  离职申请弹窗
  对标 V1.1 src/pages/Labor/components/ResignationPage/ResignationPageModals/CreateModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="离职申请" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="离职类型" required>
        <el-radio-group v-model="form.type">
          <el-radio value="personal">主动离职</el-radio>
          <el-radio value="mutual">协商离职</el-radio>
          <el-radio value="contract_end">合同到期</el-radio>
          <el-radio value="dismissed">辞退</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="最后工作日" required>
        <el-date-picker v-model="form.lastDay" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="离职原因" required>
        <el-input v-model="form.reason" type="textarea" :rows="3" maxlength="300" show-word-limit />
      </el-form-item>
      <el-form-item label="工作交接">
        <el-input v-model="form.handover" type="textarea" :rows="2" placeholder="请说明工作交接安排" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">提交申请</el-button>
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
  type: 'personal',
  lastDay: '',
  reason: '',
  handover: '',
})
</script>
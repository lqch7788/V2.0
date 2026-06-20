<!--
  招聘批量编辑弹窗
  对标 V1.1 src/components/labor/recruitment/RecruitmentBatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑招聘" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条招聘执行批量修改</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="部门">
        <el-select v-model="form.department" clearable placeholder="选择部门" class="w-full">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="">不修改</el-radio>
          <el-radio value="open">招聘中</el-radio>
          <el-radio value="closed">已关闭</el-radio>
          <el-radio value="filled">已招满</el-radio>
        </el-radio-group>
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

const departments = ['生产部', '技术部', '后勤部', '财务部', '采购部']
const form = reactive({ department: '', status: '' })
</script>
<!--
  岗位批量编辑弹窗
  对标 V1.1 src/components/labor/position/modals/PositionBatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑岗位" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条岗位执行批量修改</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="部门">
        <el-select v-model="form.department" clearable class="w-full">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="级别">
        <el-radio-group v-model="form.level">
          <el-radio value="">不修改</el-radio>
          <el-radio value="初级">初级</el-radio>
          <el-radio value="中级">中级</el-radio>
          <el-radio value="高级">高级</el-radio>
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

const departments = ['生产部', '技术部', '后勤部', '财务部']
const form = reactive({ department: '', level: '' })
</script>
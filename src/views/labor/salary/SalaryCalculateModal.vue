<!--
  工资计算弹窗
  对标 V1.1 src/components/labor/salary/SalaryCalculateModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="工资计算" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="计算月份" required>
        <el-date-picker v-model="form.month" type="month" value-format="YYYY-MM" class="w-full" />
      </el-form-item>
      <el-form-item label="员工范围">
        <el-radio-group v-model="form.scope">
          <el-radio value="all">全部员工</el-radio>
          <el-radio value="department">按部门</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.scope === 'department'" label="选择部门">
        <el-select v-model="form.departments" multiple placeholder="选择部门" class="w-full">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="计算项">
        <el-checkbox-group v-model="form.items">
          <el-checkbox value="base">基本工资</el-checkbox>
          <el-checkbox value="overtime">加班费</el-checkbox>
          <el-checkbox value="bonus">奖金</el-checkbox>
          <el-checkbox value="deduction">扣款</el-checkbox>
          <el-checkbox value="tax">个税</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('calculate', form)">开始计算</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'calculate'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const departments = ['生产部', '技术部', '后勤部', '财务部', '采购部']
const form = reactive({
  month: '',
  scope: 'all',
  departments: [],
  items: ['base', 'overtime', 'bonus', 'deduction', 'tax'],
})
</script>
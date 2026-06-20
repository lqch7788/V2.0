<!--
  预算表单弹窗
  对标 V1.1 src/components/labor/budget/BudgetFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="budget ? '编辑预算' : '新增预算'" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="预算名称" required>
        <el-input v-model="form.name" placeholder="例如：2026年生产预算" />
      </el-form-item>
      <el-form-item label="预算类型" required>
        <el-select v-model="form.type" placeholder="请选择" class="w-full">
          <el-option label="年度预算" value="annual" />
          <el-option label="季度预算" value="quarterly" />
          <el-option label="月度预算" value="monthly" />
          <el-option label="项目预算" value="project" />
        </el-select>
      </el-form-item>
      <el-form-item label="预算金额" required>
        <el-input-number v-model="form.amount" :min="0" :precision="2" :step="1000" class="w-full" />
      </el-form-item>
      <el-form-item label="所属部门" required>
        <el-select v-model="form.department" placeholder="请选择部门" class="w-full">
          <el-option v-for="d in departments" :key="d" :value="d" :label="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="生效日期">
        <el-date-picker v-model="form.effectiveDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  budget: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const departments = ['生产部', '技术部', '后勤部', '财务部', '采购部']

const form = reactive({
  name: '',
  type: 'annual',
  amount: 0,
  department: '',
  effectiveDate: '',
  remark: '',
})

watch(
  () => props.budget,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>
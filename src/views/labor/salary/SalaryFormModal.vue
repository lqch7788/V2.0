<!--
  工资表单弹窗
  对标 V1.1 src/components/labor/salary/SalaryFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="salary ? '编辑工资' : '新增工资'" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="员工" required>
        <el-select v-model="form.workerId" filterable placeholder="选择员工" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="月份" required>
        <el-date-picker v-model="form.month" type="month" value-format="YYYY-MM" placeholder="选择月份" class="w-full" />
      </el-form-item>
      <el-form-item label="基本工资">
        <el-input-number v-model="form.baseSalary" :min="0" :precision="2" :step="100" class="w-full" />
      </el-form-item>
      <el-form-item label="绩效奖金">
        <el-input-number v-model="form.bonus" :min="0" :precision="2" :step="100" class="w-full" />
      </el-form-item>
      <el-form-item label="加班费">
        <el-input-number v-model="form.overtimePay" :min="0" :precision="2" :step="50" class="w-full" />
      </el-form-item>
      <el-form-item label="扣款">
        <el-input-number v-model="form.deduction" :min="0" :precision="2" :step="50" class="w-full" />
      </el-form-item>
      <el-form-item label="实发工资">
        <span class="text-2xl font-bold text-emerald-600">¥{{ total }}</span>
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
  salary: { type: Object, default: null },
  workers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  workerId: '',
  month: '',
  baseSalary: 0,
  bonus: 0,
  overtimePay: 0,
  deduction: 0,
})

watch(
  () => props.salary,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)

const total = computed(() => {
  return (form.baseSalary + form.bonus + form.overtimePay - form.deduction).toFixed(2)
})
</script>
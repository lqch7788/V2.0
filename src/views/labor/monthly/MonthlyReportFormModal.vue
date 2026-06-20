<!--
  月报表单弹窗
  对标 V1.1 src/components/labor/monthly/MonthlyReportFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="record ? '编辑月报' : '生成月报'" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="员工" required>
        <el-select v-model="form.workerId" filterable placeholder="选择员工" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="月份" required>
        <el-date-picker v-model="form.month" type="month" value-format="YYYY-MM" class="w-full" />
      </el-form-item>
      <el-form-item label="出勤天数">
        <el-input-number v-model="form.workDays" :min="0" :max="31" class="w-full" />
      </el-form-item>
      <el-form-item label="基本工资">
        <el-input-number v-model="form.baseSalary" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="奖金">
        <el-input-number v-model="form.bonus" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="扣款">
        <el-input-number v-model="form.deduction" :min="0" :precision="2" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">生成</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  record: { type: Object, default: null },
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
  workDays: 22,
  baseSalary: 0,
  bonus: 0,
  deduction: 0,
})

watch(
  () => props.record,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>
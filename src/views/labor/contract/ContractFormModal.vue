<!--
  合同表单弹窗
  对标 V1.1 src/components/labor/contract/ContractFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="contract ? '编辑合同' : '新增合同'" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="合同类型" required>
        <el-select v-model="form.type" placeholder="请选择" class="w-full">
          <el-option label="固定期限" value="fixed" />
          <el-option label="无固定期限" value="permanent" />
          <el-option label="临时合同" value="temporary" />
          <el-option label="实习合同" value="internship" />
        </el-select>
      </el-form-item>
      <el-form-item label="员工" required>
        <el-select v-model="form.workerId" filterable placeholder="选择员工" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="合同期限" required>
        <el-date-picker v-model="form.dateRange" type="daterange" range-separator="至"
          start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="月薪">
        <el-input-number v-model="form.salary" :min="0" :precision="2" :step="100" class="w-full" />
      </el-form-item>
      <el-form-item label="试用期(月)">
        <el-input-number v-model="form.probationMonths" :min="0" :max="6" class="w-full" />
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
  contract: { type: Object, default: null },
  workers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  type: 'fixed',
  workerId: '',
  dateRange: [],
  salary: 0,
  probationMonths: 3,
  remark: '',
})

watch(
  () => props.contract,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>
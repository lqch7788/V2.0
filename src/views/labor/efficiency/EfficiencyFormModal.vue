<!--
  效率表单弹窗
  对标 V1.1 src/components/labor/efficiency/EfficiencyFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="record ? '编辑效率记录' : '新增效率记录'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="员工" required>
        <el-select v-model="form.workerId" filterable placeholder="选择员工" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" required>
        <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="完成工作量">
        <el-input-number v-model="form.workload" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="单位时间(小时)">
        <el-input-number v-model="form.hours" :min="0" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="效率值">
        <span class="text-emerald-700 font-medium">{{ efficiency }}</span>
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
  date: '',
  workload: 0,
  hours: 0,
  remark: '',
})

watch(
  () => props.record,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)

const efficiency = computed(() => {
  if (!form.hours) return 0
  return (form.workload / form.hours).toFixed(2)
})
</script>
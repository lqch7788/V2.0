<!--
  计件表单弹窗
  对标 V1.1 src/components/labor/piecework/PieceworkFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="record ? '编辑计件' : '新增计件'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="员工" required>
        <el-select v-model="form.workerId" filterable placeholder="选择员工" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务" required>
        <el-select v-model="form.taskId" placeholder="选择任务" class="w-full">
          <el-option v-for="t in tasks" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="数量" required>
        <el-input-number v-model="form.count" :min="0" class="w-full" />
      </el-form-item>
      <el-form-item label="单价" required>
        <el-input-number v-model="form.unitPrice" :min="0" :precision="2" :step="0.5" class="w-full" />
      </el-form-item>
      <el-form-item label="日期" required>
        <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="总金额">
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
  record: { type: Object, default: null },
  workers: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  workerId: '',
  taskId: '',
  count: 0,
  unitPrice: 0,
  date: '',
})

watch(
  () => props.record,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)

const total = computed(() => (form.count * form.unitPrice).toFixed(2))
</script>
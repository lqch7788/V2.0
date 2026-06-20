<!--
  绩效表单弹窗
  对标 V1.1 src/components/labor/performance/PerformanceFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="record ? '编辑绩效' : '新增绩效'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="员工" required>
        <el-select v-model="form.workerId" filterable placeholder="选择员工" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="考核周期" required>
        <el-date-picker v-model="form.period" type="month" value-format="YYYY-MM" placeholder="选择月份" class="w-full" />
      </el-form-item>
      <el-form-item label="评分(0-100)" required>
        <el-input-number v-model="form.score" :min="0" :max="100" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="评语">
        <el-input v-model="form.comment" type="textarea" :rows="3" maxlength="300" show-word-limit />
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
  period: '',
  score: 80,
  comment: '',
})

watch(
  () => props.record,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>
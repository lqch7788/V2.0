<!--
  加班表单弹窗
  对标 V1.1 src/components/labor/overtime/OvertimeFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="加班申请" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="加班日期" required>
        <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="加班类型" required>
        <el-radio-group v-model="form.type">
          <el-radio value="workday">工作日</el-radio>
          <el-radio value="weekend">周末</el-radio>
          <el-radio value="holiday">节假日</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="开始时间" required>
        <el-time-picker v-model="form.startTime" value-format="HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="结束时间" required>
        <el-time-picker v-model="form.endTime" value-format="HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="加班时长">
        <span class="text-emerald-700 font-medium">{{ hours }} 小时</span>
      </el-form-item>
      <el-form-item label="加班原因" required>
        <el-input v-model="form.reason" type="textarea" :rows="3" maxlength="200" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">提交申请</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  date: '',
  type: 'workday',
  startTime: '',
  endTime: '',
  reason: '',
})

const hours = computed(() => {
  if (!form.startTime || !form.endTime) return 0
  const start = form.startTime.split(':').map(Number)
  const end = form.endTime.split(':').map(Number)
  const startMin = start[0] * 60 + start[1]
  const endMin = end[0] * 60 + end[1]
  return Math.max(0, ((endMin - startMin) / 60).toFixed(1))
})
</script>
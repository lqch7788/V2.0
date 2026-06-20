<!--
  请假申请表单弹窗
  对标 V1.1 src/components/labor/leave/LeaveFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="leave ? '编辑请假' : '请假申请'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="请假类型" required>
        <el-select v-model="form.type" placeholder="请选择" class="w-full">
          <el-option label="事假" value="personal" />
          <el-option label="病假" value="sick" />
          <el-option label="年假" value="annual" />
          <el-option label="婚假" value="marriage" />
          <el-option label="产假" value="maternity" />
          <el-option label="丧假" value="bereavement" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" required>
        <el-date-picker v-model="form.startDate" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="结束时间" required>
        <el-date-picker v-model="form.endDate" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="请假天数">
        <span class="text-emerald-700 font-medium">{{ days }} 天</span>
      </el-form-item>
      <el-form-item label="请假原因" required>
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
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  leave: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  type: '',
  startDate: '',
  endDate: '',
  reason: '',
})

watch(
  () => props.leave,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)

const days = computed(() => {
  if (!form.startDate || !form.endDate) return 0
  const start = new Date(form.startDate)
  const end = new Date(form.endDate)
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
})
</script>
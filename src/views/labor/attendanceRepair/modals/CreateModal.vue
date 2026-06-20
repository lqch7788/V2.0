<!--
  考勤补卡申请弹窗
  对标 V1.1 src/pages/Labor/components/AttendanceRepairPage/AttendanceRepairPageModals/CreateModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="补卡申请" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="补卡日期" required>
        <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="补卡类型" required>
        <el-radio-group v-model="form.type">
          <el-radio value="checkIn">上班补卡</el-radio>
          <el-radio value="checkOut">下班补卡</el-radio>
          <el-radio value="both">上下班补卡</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="原打卡时间">
        <el-time-picker v-model="form.originalTime" placeholder="原时间" value-format="HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="新打卡时间" required>
        <el-time-picker v-model="form.newTime" placeholder="新时间" value-format="HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="补卡原因" required>
        <el-input v-model="form.reason" type="textarea" :rows="3" maxlength="200" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">提交</el-button>
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
  type: 'checkIn',
  originalTime: '',
  newTime: '',
  reason: '',
})
</script>
<!--
  风险表单弹窗
  对标 V1.1 src/components/labor/risk/RiskFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="新增风险预警" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="风险等级" required>
        <el-radio-group v-model="form.level">
          <el-radio value="high">高</el-radio>
          <el-radio value="medium">中</el-radio>
          <el-radio value="low">低</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="风险类型" required>
        <el-select v-model="form.type" placeholder="选择类型" class="w-full">
          <el-option label="考勤异常" value="attendance" />
          <el-option label="安全事故" value="safety" />
          <el-option label="离职风险" value="turnover" />
          <el-option label="绩效异常" value="performance" />
        </el-select>
      </el-form-item>
      <el-form-item label="预警标题" required>
        <el-input v-model="form.title" placeholder="简短描述风险" />
      </el-form-item>
      <el-form-item label="关联员工">
        <el-select v-model="form.workerId" filterable placeholder="选择员工" clearable class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="预警内容" required>
        <el-input v-model="form.description" type="textarea" :rows="3" />
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
  workers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  level: 'medium',
  type: '',
  title: '',
  workerId: '',
  description: '',
})
</script>
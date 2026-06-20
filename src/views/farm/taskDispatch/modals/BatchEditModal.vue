<!--
  任务批量编辑弹窗
  对标 V1.1 src/components/farm/taskDispatch/modals/BatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑任务" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条任务执行批量修改</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="执行人">
        <el-select v-model="form.executorId" filterable placeholder="选择新执行人" clearable class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级">
        <el-radio-group v-model="form.priority">
          <el-radio value="">不修改</el-radio>
          <el-radio value="normal">普通</el-radio>
          <el-radio value="high">高</el-radio>
          <el-radio value="urgent">加急</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('confirm', form)">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  records: { type: Array, default: () => [] },
  workers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  executorId: '',
  priority: '',
  remark: '',
})
</script>
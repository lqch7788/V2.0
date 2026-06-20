<!--
  预算批量编辑弹窗
  对标 V1.1 src/components/labor/budget/BudgetBatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑预算" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条预算执行批量修改</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="调整金额">
        <el-input-number v-model="form.amount" :step="1000" class="w-full" />
        <span class="ml-2 text-sm text-gray-500">{{ form.mode === 'add' ? '增加' : '设置为' }}</span>
      </el-form-item>
      <el-form-item label="调整方式">
        <el-radio-group v-model="form.mode">
          <el-radio value="add">叠加</el-radio>
          <el-radio value="set">覆盖</el-radio>
        </el-radio-group>
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
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  amount: 0,
  mode: 'add',
})
</script>
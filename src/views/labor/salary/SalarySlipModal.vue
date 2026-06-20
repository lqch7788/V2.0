<!--
  工资条弹窗
  对标 V1.1 src/components/labor/salary/SalarySlipModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="工资条" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="slip" class="salary-slip p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">{{ slip.month }} 工资条</h2>
        <p class="text-sm text-gray-500 mt-1">{{ slip.workerName }} ({{ slip.workerCode }})</p>
      </div>
      <div class="bg-white rounded-lg p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">基本工资</span>
          <span>¥{{ slip.baseSalary }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">加班费</span>
          <span>¥{{ slip.overtime }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">奖金</span>
          <span>¥{{ slip.bonus }}</span>
        </div>
        <div class="flex justify-between text-sm text-red-600">
          <span>扣款</span>
          <span>-¥{{ slip.deduction }}</span>
        </div>
        <el-divider />
        <div class="flex justify-between font-bold text-lg">
          <span>实发工资</span>
          <span class="text-emerald-600">¥{{ slip.total }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="$emit('print', slip)">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  slip: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'print'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>
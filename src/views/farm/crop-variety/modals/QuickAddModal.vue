<!--
  快速新增品种弹窗
  对标 V1.1 src/components/farm/crop-variety/modals/QuickAddModal.tsx
-->
<template>
  <el-dialog
    :model-value="modelValue"
    title="快速新增"
    width="480px"
    v-dialog-draggable
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <p class="text-gray-600 mb-3">快速创建一个新品种，名称和编码至少填一项</p>
    <el-input v-model="quickName" placeholder="品种名" class="mb-2" />
    <el-input v-model="quickCode" placeholder="编码（可选，自动生成）" />
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :disabled="!quickName && !quickCode" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const quickName = ref('')
const quickCode = ref('')

const handleSubmit = () => {
  emit('submit', {
    name: quickName.value,
    code: quickCode.value || `VAR${Date.now().toString().slice(-6)}`,
  })
  quickName.value = ''
  quickCode.value = ''
  emit('update:modelValue', false)
}
</script>
<template>
  <el-form
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :class="['ui-form', className]"
    ref="formRef"
  >
    <slot />
  </el-form>
</template>

<script setup>
import { ElForm } from 'element-plus'
import { ref } from 'vue'

const props = defineProps({
  model: Object,
  rules: Object,
  labelWidth: {
    type: String,
    default: '120px'
  },
  labelPosition: {
    type: String,
    default: 'right'
  },
  className: {
    type: String,
    default: ''
  }
})

const formRef = ref()

defineExpose({
  validate: () => formRef.value?.validate(),
  validateField: (prop) => formRef.value?.validateField(prop),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: (prop) => formRef.value?.clearValidate(prop)
})
</script>

<style scoped>
.ui-form {
  /* 可自定义样式 */
}
</style>

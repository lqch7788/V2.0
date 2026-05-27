<template>
  <el-tabs
    :model-value="modelValue"
    :type="type"
    :tab-position="tabPosition"
    :class="className"
    @update:model-value="handleChange"
  >
    <slot />
  </el-tabs>
</template>

<script setup>
import { ElTabs } from 'element-plus'

const props = defineProps({
  modelValue: { type: String, default: '' },
  type: { type: String, default: '' },
  tabPosition: { type: String, default: 'top' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

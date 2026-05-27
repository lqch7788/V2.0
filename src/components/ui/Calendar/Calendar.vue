<template>
  <el-calendar v-model="currentValue" :class="className">
    <template #default="{ date, data }">
      <slot :date="date" :data="data" />
    </template>
  </el-calendar>
</template>

<script setup>
import { computed } from 'vue'
import { ElCalendar } from 'element-plus'

const props = defineProps({
  modelValue: { type: Date, default: () => new Date() },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

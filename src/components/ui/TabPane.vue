<template>
  <el-tab-pane
    :label="label"
    :name="name"
    :disabled="disabled"
    :lazy="lazy"
  >
    <slot />
  </el-tab-pane>
</template>

<script setup>
import { ElTabPane } from 'element-plus'

defineProps({
  label: String,
  name: String,
  disabled: Boolean,
  lazy: Boolean
})
</script>

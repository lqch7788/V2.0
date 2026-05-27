<template>
  <el-tooltip :content="content" :placement="placement" :effect="effect" :show-after="delay" :class="className">
    <slot />
  </el-tooltip>
</template>

<script setup>
import { ElTooltip } from 'element-plus'

const props = defineProps({
  content: { type: String, default: '' },
  placement: { type: String, default: 'top' },
  effect: { type: String, default: 'dark' },
  delay: { type: Number, default: 200 },
  className: { type: String, default: '' }
})
</script>

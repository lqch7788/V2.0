<template>
  <el-progress :percentage="value" :stroke-width="strokeWidth" :show-text="showLabel" :class="className" :color="color" />
</template>

<script setup>
import { ElProgress } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  strokeWidth: { type: Number, default: 8 },
  showLabel: { type: Boolean, default: true },
  className: { type: String, default: '' },
  color: { type: String, default: '#059669' }
})
</script>

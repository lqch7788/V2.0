<template>
  <el-tooltip
    :content="content"
    :placement="placement"
    :disabled="disabled"
    :effect="effect"
    :transition="transition"
    :visible-arrow="showArrow"
    :popper-class="popperClass"
  >
    <slot />
  </el-tooltip>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    default: ''
  },
  placement: {
    type: String,
    default: 'top' // top, top-start, top-end, bottom, bottom-start, bottom-end, left, left-start, left-end, right, right-start, right-end
  },
  disabled: {
    type: Boolean,
    default: false
  },
  effect: {
    type: String,
    default: 'light' // light, dark
  },
  transition: {
    type: String,
    default: 'el-fade-in-linear'
  },
  showArrow: {
    type: Boolean,
    default: true
  },
  popperClass: {
    type: String,
    default: ''
  }
})
</script>

<style>
/* V1.1 Tooltip 样式 */
.el-tooltip__popper {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

.el-tooltip__popper.is-light {
  background: white;
  border: 1px solid #e5e7eb;
  color: #374151;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.el-tooltip__popper.is-dark {
  background: #374151;
  color: white;
}

.el-tooltip__arrow::before {
  background: #e5e7eb;
}
</style>

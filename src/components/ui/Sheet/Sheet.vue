<template>
  <div class="ui-sheet">
    <slot />
  </div>
</template>

<script setup>
// Sheet 是一个简单的容器组件，提供统一样式
defineProps({
  title: { type: String, default: '' }
})
</script>

<style scoped>
.ui-sheet {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
</style>

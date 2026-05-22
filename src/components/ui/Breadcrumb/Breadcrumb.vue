<template>
  <div class="ui-breadcrumb">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  separator: { type: String, default: '/' }
})
</script>

<style scoped>
.ui-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>

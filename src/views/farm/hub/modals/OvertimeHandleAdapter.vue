<!--
  农场 Hub 超时处理适配器
  对标 V1.1 src/components/farm/hub/modals/OvertimeHandleAdapter.tsx
-->
<template>
  <slot />
</template>

<script setup>
defineProps({
  task: { type: Object, default: null },
})
defineEmits(['handle'])
</script>
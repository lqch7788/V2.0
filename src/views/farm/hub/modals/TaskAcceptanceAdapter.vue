<!--
  农场 Hub 任务验收适配器
  对标 V1.1 src/components/farm/hub/modals/TaskAcceptanceAdapter.tsx
-->
<template>
  <slot />
</template>

<script setup>
defineProps({
  task: { type: Object, default: null },
})
defineEmits(['accept', 'reject'])
</script>
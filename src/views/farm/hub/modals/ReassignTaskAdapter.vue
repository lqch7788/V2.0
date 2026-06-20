<!--
  农场 Hub 任务重派适配器
  对标 V1.1 src/components/farm/hub/modals/ReassignTaskAdapter.tsx
-->
<template>
  <slot />
</template>

<script setup>
defineProps({
  task: { type: Object, default: null },
})
defineEmits(['reassign'])
</script>
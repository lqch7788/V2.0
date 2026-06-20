<!--
  农场 Hub 撤回取消适配器
  对标 V1.1 src/components/farm/hub/modals/WithdrawCancelAdapter.tsx
-->
<template>
  <slot />
</template>

<script setup>
defineProps({
  task: { type: Object, default: null },
})
defineEmits(['withdraw'])
</script>
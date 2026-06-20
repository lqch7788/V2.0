<!--
  农场 Hub 批量编辑适配器
  对标 V1.1 src/components/farm/hub/modals/BatchEditAdapter.tsx
-->
<template>
  <slot />
</template>

<script setup>
// 适配器：保持 V1.1 命名结构，内部使用通用组件
defineProps({
  records: { type: Array, default: () => [] },
})

defineEmits(['confirm'])
</script>
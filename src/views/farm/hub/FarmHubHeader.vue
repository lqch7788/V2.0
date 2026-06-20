<!--
  农场 Hub 头部（别名）
  对标 V1.1 src/components/farm/hub/FarmHubHeader.tsx
-->
<template>
  <PageHeader title="农事 Hub" subtitle="农事任务一站式管理中心">
    <template #actions>
      <slot name="actions" />
    </template>
  </PageHeader>
</template>

<script setup>
import PageHeader from './components/PageHeader.vue'

defineProps({})
</script>
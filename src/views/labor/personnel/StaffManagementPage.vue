<!--
  员工管理页面（别名）
  对标 V1.1 src/components/labor/personnel/StaffManagementPage.tsx
-->
<template>
  <PersonnelManagementPage :data="data" @add="$emit('add')" @view="$emit('view', $event)" />
</template>

<script setup>
import PersonnelManagementPage from './PersonnelManagementPage.vue'

defineProps({ data: { type: Array, default: () => [] } })
defineEmits(['add', 'view', 'edit'])
</script>
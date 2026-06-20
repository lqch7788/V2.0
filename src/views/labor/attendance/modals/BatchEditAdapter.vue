<!--
  考勤批量编辑适配器
  对标 V1.1 src/components/labor/attendance/modals/BatchEditModal 的适配器版本
-->
<template>
  <BatchEditModal v-bind="$attrs" v-on="$listeners" :records="records" />
</template>

<script setup>
import BatchEditModal from './BatchEditModal.vue'

defineProps({
  records: { type: Array, default: () => [] },
})
</script>
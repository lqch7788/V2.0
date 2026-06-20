<!--
  巡检 Tab
  对标 V1.1 src/components/farm/hub/InspectionTab.tsx
-->
<template>
  <div class="space-y-4">
    <InspectionSearch @search="$emit('search', $event)" />
    <InspectionTable :data="inspections" @view="$emit('view', $event)" />
  </div>
</template>

<script setup>
import InspectionSearch from './components/InspectionSearch.vue'
import InspectionTable from './InspectionTable.vue'

defineProps({ inspections: { type: Array, default: () => [] } })
defineEmits(['search', 'view'])
</script>
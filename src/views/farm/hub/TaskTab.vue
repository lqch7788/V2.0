<!--
  任务 Tab
  对标 V1.1 src/components/farm/hub/TaskTab.tsx
-->
<template>
  <div class="space-y-4">
    <TaskTable :data="tasks" @view="$emit('view', $event)" @complete="$emit('complete', $event)" />
  </div>
</template>

<script setup>
import TaskTable from './components/TaskTable.vue'

defineProps({ tasks: { type: Array, default: () => [] } })
defineEmits(['view', 'complete'])
</script>
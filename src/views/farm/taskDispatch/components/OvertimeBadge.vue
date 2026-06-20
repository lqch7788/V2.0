<!--
  超时徽章
  对标 V1.1 src/components/farm/taskDispatch/components/OvertimeBadge.tsx
-->
<template>
  <el-badge v-if="hours > 0" :value="`超时 ${hours}h`" :type="type">
    <slot />
  </el-badge>
  <slot v-else />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hours: { type: Number, default: 0 },
})

const type = computed(() => {
  if (props.hours >= 24) return 'danger'
  if (props.hours >= 8) return 'warning'
  return 'info'
})
</script>
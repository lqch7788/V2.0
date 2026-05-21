<template>
  <span class="text-sm text-gray-700">
    {{ typeName }}
  </span>
</template>

<script setup>
defineProps({
  typeName: String
})
</script>

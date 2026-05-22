<template>
  <div v-if="direction === 'vertical'" :class="['divider-vertical', typeClass]" />
  <div v-else :class="['divider-wrapper', { 'has-text': $slots.default }]">
    <div v-if="$slots.default" :class="['divider-line', typeClass, `text-${orientation}`]" />
    <span v-if="$slots.default" class="divider-text">
      <slot />
    </span>
    <div v-if="$slots.default" :class="['divider-line', typeClass]" />
    <hr v-else :class="['divider-hr', typeClass]" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  direction: { type: String, default: 'horizontal' }, // horizontal, vertical
  type: { type: String, default: 'solid' }, // solid, dashed, dotted
  orientation: { type: String, default: 'center' }, // left, center, right
  color: { type: String, default: '#e5e7eb' }
})

const typeClass = computed(() => {
  const types = {
    solid: 'border-gray-200',
    dashed: 'border-dashed border-gray-300',
    dotted: 'border-dotted border-gray-300'
  }
  return types[props.type] || types.solid
})
</script>

<style scoped>
.divider-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 1rem 0;
}

.divider-wrapper.has-text {
  gap: 1rem;
}

.divider-hr {
  width: 100%;
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0;
}

.divider-line {
  flex: 1;
  border-top: 1px solid #e5e7eb;
}

.divider-vertical {
  height: 100%;
  min-height: 1em;
  border-left: 1px solid #e5e7eb;
  margin: 0 1rem;
}

.divider-text {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  padding: 0 0.75rem;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}
</style>

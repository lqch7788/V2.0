<template>
  <div class="tabs-container">
    <div v-if="$slots.header" class="tabs-header">
      <slot name="header" />
    </div>
    <div class="tabs-list-wrapper">
      <div class="tabs-list">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tabs-trigger', { active: activeValue === tab.value }]"
          :disabled="tab.disabled"
          @click="handleTabClick(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  modelValue: [String, Number]
})

const emit = defineEmits(['update:modelValue', 'tab-change'])

const activeValue = props.modelValue

const handleTabClick = (value) => {
  emit('update:modelValue', value)
  emit('tab-change', value)
}
</script>

<style scoped>
/* V1.1 Tabs 样式 */
.tabs-container {
  width: 100%;
}

.tabs-list-wrapper {
  padding: 0.25rem;
  background: rgba(243, 244, 246, 0.8);
  border-radius: 0.75rem;
  display: inline-flex;
}

.tabs-list {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.tabs-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  font-size: 14px;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tabs-trigger:hover:not(:disabled) {
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
}

.tabs-trigger.active {
  background: white;
  color: #059669;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.tabs-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tabs-content {
  margin-top: 0.5rem;
}
</style>

<template>
  <div class="card" :class="className">
    <div v-if="$slots.header || header" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ header }}</h3>
      </slot>
    </div>
    <div class="card-content">
      <slot />
    </div>
    <div v-if="$slots.footer || footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  },
  header: String,
  footer: String
})
</script>

<style scoped>
.card {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-title {
  font-weight: 600;
  line-height: 1.25;
}

.card-content {
  padding: 1.5rem;
}

.card-content :deep(.card-header) {
  padding-top: 0;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>

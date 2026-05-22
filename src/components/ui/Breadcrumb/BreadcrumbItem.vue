<template>
  <li class="breadcrumb-item">
    <component
      :is="to ? 'router-link' : 'span'"
      v-if="to"
      :to="to"
      class="breadcrumb-link"
    >
      <slot />
    </component>
    <span v-else :class="['breadcrumb-link', { 'is-active': active }]">
      <slot />
    </span>
    <span v-if="separator" class="breadcrumb-separator">{{ separator }}</span>
    <span v-else class="breadcrumb-separator-icon">
      <el-icon><DArrowRight /></el-icon>
    </span>
  </li>
</template>

<script setup>
import { DArrowRight } from '@element-plus/icons-vue'

defineProps({
  to: { type: [String, Object], default: '' },
  active: { type: Boolean, default: false },
  separator: { type: String, default: '' }
})
</script>

<style scoped>
.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb-link:hover {
  color: #111827;
}

.breadcrumb-link.is-active {
  color: #059669;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #d1d5db;
  font-size: 0.75rem;
}

.breadcrumb-separator-icon {
  color: #d1d5db;
  display: flex;
  align-items: center;
}
</style>

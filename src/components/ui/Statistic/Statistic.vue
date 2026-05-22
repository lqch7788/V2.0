<template>
  <div :class="['ui-statistic', { 'text-center': centered }]">
    <div v-if="$slots.header || title" class="statistic-header">
      <slot name="header">
        <span class="statistic-title">{{ title }}</span>
      </slot>
    </div>
    <div class="statistic-content">
      <div class="statistic-value" :style="{ color: valueColor }">
        <span v-if="prefix" class="statistic-prefix">{{ prefix }}</span>
        <span class="statistic-number">{{ displayValue }}</span>
        <span v-if="suffix" class="statistic-suffix">{{ suffix }}</span>
      </div>
      <div v-if="description || $slots.description" class="statistic-description">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
    <div v-if="$slots.footer" class="statistic-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    default: 0
  },
  precision: {
    type: Number,
    default: 0
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  valueColor: {
    type: String,
    default: '#059669'
  },
  centered: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('zh-CN', {
      minimumFractionDigits: props.precision,
      maximumFractionDigits: props.precision
    })
  }
  return props.value
})
</script>

<style scoped>
.ui-statistic {
  display: flex;
  flex-direction: column;
}

.statistic-header {
  margin-bottom: 0.5rem;
}

.statistic-title {
  font-size: 0.875rem;
  color: #6b7280;
}

.statistic-content {
  flex: 1;
}

.statistic-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.statistic-prefix {
  font-size: 1rem;
  margin-right: 0.125rem;
}

.statistic-suffix {
  font-size: 1rem;
  margin-left: 0.125rem;
}

.statistic-number {
  font-variant-numeric: tabular-nums;
}

.statistic-description {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.statistic-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}
</style>

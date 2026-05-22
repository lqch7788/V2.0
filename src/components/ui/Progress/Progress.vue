<template>
  <div class="ui-progress" :class="{ 'progress-show-text': showText }">
    <div v-if="label || showText" class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span v-if="showText" class="progress-percentage">{{ percentage }}%</span>
    </div>
    <div class="progress-bar-wrapper">
      <div
        class="progress-bar"
        :class="[`progress-${status}`, { 'progress-striped': striped }]"
        :style="{ width: `${percentage}%` }"
      >
        <div v-if="striped" class="progress-stripes" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
    validator: (val) => val >= 0 && val <= 100
  },
  status: {
    type: String,
    default: 'normal' // normal, success, warning, exception
  },
  label: {
    type: String,
    default: ''
  },
  showText: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: false
  },
  strokeWidth: {
    type: Number,
    default: 8
  }
})
</script>

<style scoped>
.ui-progress {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #374151;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.progress-bar-wrapper {
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-normal {
  background: linear-gradient(to right, #10b981, #059669);
}

.progress-success {
  background: linear-gradient(to right, #22c55e, #16a34a);
}

.progress-warning {
  background: linear-gradient(to right, #f59e0b, #d97706);
}

.progress-exception {
  background: linear-gradient(to right, #ef4444, #dc2626);
}

.progress-striped .progress-stripes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}
</style>

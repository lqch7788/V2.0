<template>
  <label :class="['ui-checkbox', { 'is-disabled': disabled }]">
    <span class="checkbox-wrapper">
      <input
        v-model="checkValue"
        type="checkbox"
        :disabled="disabled"
        :true-value="trueValue"
        :false-value="falseValue"
        class="checkbox-input"
        @change="handleChange"
      />
      <span class="checkbox-inner" />
    </span>
    <span v-if="$slots.default || label" class="checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  trueValue: {
    type: [Boolean, String, Number],
    default: true
  },
  falseValue: {
    type: [Boolean, String, Number],
    default: false
  },
  checked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const checkValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleChange = (event) => {
  emit('change', event.target.checked)
}
</script>

<style scoped>
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.ui-checkbox.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
}

.checkbox-inner {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-inner::after {
  content: '';
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-left: 0;
  border-top: 0;
  transform: rotate(45deg) scale(0);
  transition: transform 0.15s ease;
}

.checkbox-input:checked + .checkbox-inner {
  background: #059669;
  border-color: #059669;
}

.checkbox-input:checked + .checkbox-inner::after {
  transform: rotate(45deg) scale(1);
}

.checkbox-input:focus + .checkbox-inner {
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
}

.checkbox-input:hover + .checkbox-inner {
  border-color: #059669;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}
</style>

<template>
  <div class="w-full" :class="className">
    <div class="flex items-center justify-between">
      <template v-for="(step, index) in steps" :key="index">
        <div class="flex flex-col items-center">
          <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors" :class="stepClass(index)">
            <el-icon v-if="index < currentStep" :size="16"><Check /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="mt-2 text-center">
            <p class="text-sm font-medium" :class="index <= currentStep ? 'text-gray-900' : 'text-gray-400'">{{ step.title }}</p>
            <p v-if="step.description" class="text-xs text-gray-500 mt-0.5 max-w-[120px]">{{ step.description }}</p>
          </div>
        </div>
        <div v-if="index < steps.length - 1" class="flex-1 h-0.5 mx-2 mt-[-20px]" :class="index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  currentStep: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
  variant: { type: String, default: 'default' },
  className: { type: String, default: '' }
})

const steps = computed(() => props.items || [])

function stepClass(index) {
  if (index < props.currentStep) return 'bg-emerald-600 border-emerald-600 text-white'
  if (index === props.currentStep) return 'border-emerald-600 text-emerald-600 bg-white'
  return 'border-gray-400 text-gray-400 bg-white'
}
</script>

<script>
import { computed } from 'vue'
</script>

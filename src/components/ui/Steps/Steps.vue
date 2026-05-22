<template>
  <div class="ui-steps">
    <div class="steps-container">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
      >
        <!-- 步骤节点 -->
        <div :class="['step-node', nodeClass(index)]">
          <el-icon v-if="index < currentStep" :size="16"><Check /></el-icon>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <!-- 连接线 -->
        <div v-if="index < steps.length - 1" :class="['step-line', { 'is-active': index < currentStep }]" />
        <!-- 步骤内容 -->
        <div class="step-content">
          <div :class="['step-title', { 'is-active': index <= currentStep }]">{{ step.title }}</div>
          <div v-if="step.description" class="step-desc">{{ step.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  currentStep: { type: Number, default: 0 },
  items: { type: Array, default: () => [] }
})

const steps = computed(() => props.items)

const nodeClass = (index) => ({
  'step-node-default': index < props.currentStep,
  'step-node-active': index === props.currentStep,
  'step-node-pending': index > props.currentStep
})
</script>

<style scoped>
.ui-steps {
  width: 100%;
}

.steps-container {
  display: flex;
  align-items: flex-start;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-node {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  z-index: 1;
  background: white;
  transition: all 0.3s;
}

.step-node-default {
  background: #059669;
  border-color: #059669;
  color: white;
}

.step-node-active {
  border-color: #059669;
  color: #059669;
}

.step-node-pending {
  border-color: #d1d5db;
  color: #9ca3af;
}

.step-line {
  position: absolute;
  top: 15px;
  left: calc(50% + 16px);
  right: calc(-50% + 16px);
  height: 2px;
  background: #e5e7eb;
  transition: background 0.3s;
}

.step-line.is-active {
  background: #059669;
}

.step-content {
  margin-top: 0.75rem;
  text-align: center;
  max-width: 120px;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
}

.step-title.is-active {
  color: #111827;
}

.step-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>

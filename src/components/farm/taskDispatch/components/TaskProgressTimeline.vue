<template>
  <!-- 任务进度时间线 - 从V1.1 TaskProgressTimeline.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">任务进度</h3>
    <div class="space-y-3">
      <div v-for="(step, index) in steps" :key="index" class="flex gap-3">
        <div class="flex flex-col items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', step.active ? 'bg-emerald-500 text-white' : step.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400']">
            <el-icon v-if="step.completed" :size="14"><Check /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div v-if="index < steps.length - 1" :class="['w-0.5 h-8', step.completed ? 'bg-emerald-300' : 'bg-gray-200']" />
        </div>
        <div class="pt-1">
          <p :class="['text-sm font-medium', step.active ? 'text-emerald-600' : step.completed ? 'text-gray-700' : 'text-gray-400']">{{ step.label }}</p>
          <p v-if="step.time" class="text-xs text-gray-400 mt-0.5">{{ step.time }}</p>
          <p v-if="step.remark" class="text-xs text-gray-500 mt-0.5">{{ step.remark }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  /** 任务状态 */
  status: { type: String, default: 'pending' },
  /** 进度百分比 */
  progress: { type: Number, default: 0 },
  /** 时间记录 */
  timelines: { type: Array, default: () => [] },
})

/** 根据状态生成步骤 */
const steps = computed(() => {
  const statusSteps = ['draft', 'pending', 'accepted', 'in_progress', 'waiting_acceptance', 'completed']
  const labels = ['草稿', '待接受', '已接受', '处理中', '待验收', '已完成']
  const currentIdx = statusSteps.indexOf(props.status)

  return labels.map((label, i) => ({
    label,
    completed: i < currentIdx || (i === currentIdx && props.status === 'completed'),
    active: i === currentIdx && props.status !== 'completed',
    time: props.timelines?.[i]?.time || '',
    remark: props.timelines?.[i]?.remark || '',
  }))
})
</script>

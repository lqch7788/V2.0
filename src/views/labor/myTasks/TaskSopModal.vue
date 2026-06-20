<!--
  任务 SOP 弹窗
  对标 V1.1 src/components/labor/myTasks/TaskSopModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="标准作业流程" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="task">
      <h3 class="text-lg font-semibold mb-2">{{ task.title }}</h3>
      <p class="text-sm text-gray-600 mb-4">{{ task.type }} - 任务编号 {{ task.code }}</p>
      <h4 class="font-semibold mt-4 mb-2">操作步骤</h4>
      <el-steps :active="activeStep" direction="vertical" finish-status="success">
        <el-step v-for="(step, idx) in steps" :key="idx" :title="step.title" :description="step.description" />
      </el-steps>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const activeStep = ref(0)
const steps = [
  { title: '准备工作', description: '检查工具、设备、个人防护' },
  { title: '现场检查', description: '确认现场环境安全' },
  { title: '开始作业', description: '按照标准流程执行' },
  { title: '记录反馈', description: '上传现场照片和工作记录' },
  { title: '验收确认', description: '等待验收人员确认' },
]
</script>
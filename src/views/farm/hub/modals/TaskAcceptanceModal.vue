<!--
  农场 Hub 任务验收弹窗
  对标 V1.1 src/components/farm/hub/modals/TaskAcceptanceModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="任务验收" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="task" class="space-y-3">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务编号">{{ task.code }}</el-descriptions-item>
        <el-descriptions-item label="任务标题">{{ task.title }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ task.executorName }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ task.completedTime }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="form" label-width="100px">
        <el-form-item label="验收结果" required>
          <el-radio-group v-model="form.result">
            <el-radio value="accept">通过</el-radio>
            <el-radio value="reject">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收意见">
          <el-input v-model="form.comment" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  result: 'accept',
  comment: '',
})
</script>
<!--
  问题派遣弹窗
  对标 V1.1 src/components/farm/hub/ProblemDispatchModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="问题派遣" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="problem" class="space-y-3">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="问题编号">{{ problem.code }}</el-descriptions-item>
        <el-descriptions-item label="问题标题">{{ problem.title }}</el-descriptions-item>
        <el-descriptions-item label="严重程度">
          <el-tag :type="severityType(problem.severity)" size="small">{{ problem.severity }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="form" label-width="100px">
        <el-form-item label="指派给" required>
          <el-select v-model="form.assigneeId" filterable placeholder="选择处理人" class="w-full">
            <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理期限">
          <el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('dispatch', form)">派遣</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  problem: { type: Object, default: null },
  workers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'dispatch'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({ assigneeId: '', deadline: '', remark: '' })
const severityType = (s) => ({ low: 'info', medium: 'warning', high: 'danger' }[s] || 'info')
</script>
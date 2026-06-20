<!--
  创建任务弹窗
  对标 V1.1 src/components/farm/taskDispatch/modals/CreateTaskModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="创建任务" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="任务类型" required>
        <el-select v-model="form.type" placeholder="请选择" class="w-full">
          <el-option label="种植" value="planting" />
          <el-option label="施肥" value="fertilizer" />
          <el-option label="浇水" value="irrigation" />
          <el-option label="采收" value="harvest" />
          <el-option label="巡检" value="inspection" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务标题" required>
        <el-input v-model="form.title" placeholder="任务简短描述" />
      </el-form-item>
      <el-form-item label="执行人" required>
        <el-select v-model="form.executorId" filterable placeholder="选择执行人" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="温室">
        <el-select v-model="form.greenhouseId" placeholder="选择温室" clearable class="w-full">
          <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="计划日期" required>
        <el-date-picker v-model="form.plannedDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="优先级">
        <el-radio-group v-model="form.priority">
          <el-radio value="normal">普通</el-radio>
          <el-radio value="high">高</el-radio>
          <el-radio value="urgent">加急</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  workers: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  type: '',
  title: '',
  executorId: '',
  greenhouseId: '',
  plannedDate: '',
  priority: 'normal',
  remark: '',
})
</script>
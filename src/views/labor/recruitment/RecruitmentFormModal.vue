<!--
  招聘表单弹窗
  对标 V1.1 src/components/labor/recruitment/RecruitmentFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="recruitment ? '编辑招聘' : '发布招聘'" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="招聘岗位" required>
        <el-input v-model="form.position" placeholder="岗位名称" />
      </el-form-item>
      <el-form-item label="所属部门" required>
        <el-select v-model="form.department" placeholder="选择部门" class="w-full">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="招聘人数" required>
        <el-input-number v-model="form.count" :min="1" :max="100" class="w-full" />
      </el-form-item>
      <el-form-item label="薪资范围">
        <div class="flex items-center gap-2 w-full">
          <el-input-number v-model="form.salaryMin" :min="0" :precision="2" :step="500" class="!flex-1" />
          <span>-</span>
          <el-input-number v-model="form.salaryMax" :min="0" :precision="2" :step="500" class="!flex-1" />
        </div>
      </el-form-item>
      <el-form-item label="职位描述">
        <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item label="任职要求">
        <el-input v-model="form.requirement" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="发布日期" required>
        <el-date-picker v-model="form.publishDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">发布</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  recruitment: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const departments = ['生产部', '技术部', '后勤部', '财务部', '采购部']
const form = reactive({
  position: '',
  department: '',
  count: 1,
  salaryMin: 5000,
  salaryMax: 8000,
  description: '',
  requirement: '',
  publishDate: '',
})

watch(
  () => props.recruitment,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>
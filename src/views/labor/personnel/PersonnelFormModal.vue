<!--
  员工表单弹窗
  对标 V1.1 src/components/labor/personnel/PersonnelFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="employee ? '编辑员工' : '新增员工'" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="工号" required>
        <el-input v-model="form.code" placeholder="员工工号" />
      </el-form-item>
      <el-form-item label="姓名" required>
        <el-input v-model="form.name" placeholder="员工姓名" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio value="M">男</el-radio>
          <el-radio value="F">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="部门" required>
        <el-select v-model="form.department" placeholder="选择部门" class="w-full">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位" required>
        <el-input v-model="form.position" placeholder="工作岗位" />
      </el-form-item>
      <el-form-item label="电话">
        <el-input v-model="form.phone" placeholder="11位手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="入职日期" required>
        <el-date-picker v-model="form.entryDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="active">在职</el-radio>
          <el-radio value="leave">休假</el-radio>
          <el-radio value="resigned">离职</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employee: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const departments = ['生产部', '技术部', '后勤部', '财务部', '采购部']
const form = reactive({
  code: '',
  name: '',
  gender: 'M',
  department: '',
  position: '',
  phone: '',
  entryDate: '',
  status: 'active',
})

watch(
  () => props.employee,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>
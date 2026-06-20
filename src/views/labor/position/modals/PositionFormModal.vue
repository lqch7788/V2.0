<!--
  岗位表单弹窗
  对标 V1.1 src/components/labor/position/modals/PositionFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="position ? '编辑岗位' : '新增岗位'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="岗位名称" required>
        <el-input v-model="form.name" placeholder="岗位名称" />
      </el-form-item>
      <el-form-item label="岗位编码" required>
        <el-input v-model="form.code" placeholder="岗位编码" />
      </el-form-item>
      <el-form-item label="所属部门" required>
        <el-select v-model="form.department" placeholder="选择部门" class="w-full">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位级别">
        <el-select v-model="form.level" placeholder="选择级别" class="w-full">
          <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位职责">
        <el-input v-model="form.responsibility" type="textarea" :rows="3" />
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
  position: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const departments = ['生产部', '技术部', '后勤部', '财务部', '采购部']
const levels = ['初级', '中级', '高级', '资深', '专家']
const form = reactive({
  name: '',
  code: '',
  department: '',
  level: '初级',
  responsibility: '',
})

watch(
  () => props.position,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>
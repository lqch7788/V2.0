<!--
  导出格式弹窗（通用）
  对标 V1.1 src/components/farm/hub/modals/ExportFormatModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="导出数据" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="格式">
        <el-radio-group v-model="form.format">
          <el-radio value="xlsx">Excel</el-radio>
          <el-radio value="csv">CSV</el-radio>
          <el-radio value="pdf">PDF</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker v-model="form.dateRange" type="daterange" range-separator="至"
          start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="包含字段">
        <el-checkbox-group v-model="form.fields">
          <el-checkbox value="all">全部字段</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('confirm', form)">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  format: 'xlsx',
  dateRange: [],
  fields: ['all'],
})
</script>
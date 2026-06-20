<!--
  工资导出组件
  对标 V1.1 src/components/labor/salary/SalaryExport.tsx
-->
<template>
  <el-button @click="showDialog = true">
    <el-icon><Download /></el-icon>
    导出工资
  </el-button>
  <el-dialog v-model="showDialog" title="导出工资数据" width="480px" v-dialog-draggable>
    <el-form :model="form" label-width="100px">
      <el-form-item label="月份">
        <el-date-picker v-model="form.month" type="month" value-format="YYYY-MM" class="w-full" />
      </el-form-item>
      <el-form-item label="格式">
        <el-radio-group v-model="form.format">
          <el-radio value="xlsx">Excel</el-radio>
          <el-radio value="csv">CSV</el-radio>
          <el-radio value="pdf">PDF</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('export', form)">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Download } from '@element-plus/icons-vue'

defineProps({
  loading: { type: Boolean, default: false },
})

defineEmits(['export'])

const showDialog = ref(false)
const form = reactive({ month: '', format: 'xlsx' })
</script>
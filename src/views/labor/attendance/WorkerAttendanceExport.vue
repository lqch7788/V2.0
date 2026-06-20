<!--
  工人考勤导出组件
  对标 V1.1 src/components/labor/attendance/WorkerAttendanceExport.tsx
-->
<template>
  <el-button @click="showExport = true">
    <el-icon><Download /></el-icon>
    导出
  </el-button>
  <ExportFormatModal v-model="showExport" @confirm="handleExport" />
</template>

<script setup>
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ExportFormatModal from './modals/ExportFormatModal.vue'

const showExport = ref(false)

const handleExport = (form) => {
  // 实际调用导出 API
  ElMessage.success(`正在导出 ${form.format.toUpperCase()} 文件...`)
  showExport.value = false
}
</script>
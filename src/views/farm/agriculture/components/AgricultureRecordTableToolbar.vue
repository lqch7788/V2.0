<!--
  农事记录表格工具栏
  对标 V1.1 src/components/farm/agriculture/components/AgricultureRecordTableToolbar.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-button @click="$emit('refresh')">
      <el-icon><Refresh /></el-icon>刷新
    </el-button>
    <el-button @click="$emit('export')">
      <el-icon><Download /></el-icon>导出
    </el-button>
    <el-button type="primary" @click="$emit('add')">
      <el-icon><Plus /></el-icon>新增
    </el-button>
    <div class="ml-auto text-sm text-gray-500">
      共 <span class="font-semibold text-gray-900">{{ total }}</span> 条
    </div>
  </div>
</template>

<script setup>
import { Download, Plus, Refresh } from '@element-plus/icons-vue'

defineProps({
  total: { type: Number, default: 0 },
})

defineEmits(['refresh', 'export', 'add'])
</script>
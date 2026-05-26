<template>
  <!-- 农事操作记录表格工具栏 - 从V1.1 AgricultureRecordTableToolbar.tsx 1:1迁移 -->
  <div class="p-4 border-b border-gray-100 flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900">农事操作记录表</h3>
    <div class="flex gap-2">
      <template v-if="batchDeleteMode">
        <el-button type="danger" size="small" @click="$emit('batch-delete')">
          <el-icon><Delete /></el-icon>
          确认删除 ({{ selectedRowsCount }})
        </el-button>
        <el-button size="small" @click="$emit('cancel-batch-delete')">取消</el-button>
      </template>
      <template v-else>
        <el-button v-if="canDelete" type="danger" size="small" @click="$emit('batch-delete')">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button v-if="canExport" size="small" @click="$emit('export')">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Delete, Download } from '@element-plus/icons-vue'

defineProps({
  batchDeleteMode: { type: Boolean, default: false },
  selectedRowsCount: { type: Number, default: 0 },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true },
})

defineEmits(['batch-delete', 'cancel-batch-delete', 'export'])
</script>

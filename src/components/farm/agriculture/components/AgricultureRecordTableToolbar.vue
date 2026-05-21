<template>
  <div class="p-4 border-b border-gray-100 flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900">农事操作记录表</h3>
    <div class="flex gap-2">
      <template v-if="batchDeleteMode">
        <el-button type="danger" size="small" @click="onBatchDelete">
          <el-icon><Delete /></el-icon>
          确认删除 ({{ selectedRowsCount }})
        </el-button>
        <el-button size="small" @click="onCancelBatchDelete">取消</el-button>
      </template>
      <template v-else>
        <el-button v-if="canDelete" type="danger" size="small" @click="onBatchDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button v-if="canExport" size="small" @click="onExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Delete, Download } from '@element-plus/icons-vue'

defineProps({"canDelete":"true","canExport":"true"})
</script>

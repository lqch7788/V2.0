<template>
  <div class="p-4 border-b border-gray-100 flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900">采收入库记录表</h3>

    <!-- 批量操作模式 -->
    <template v-if="exportMode || batchEditMode || batchDeleteMode">
      <div class="flex gap-2">
        <el-button v-if="exportMode" type="primary" size="small" @click="onConfirmExport" :disabled="selectedRows.length === 0">
          <el-icon><Download /></el-icon>
          确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </el-button>
        <el-button v-if="exportMode" size="small" @click="onCancelExport">取消选择</el-button>

        <el-button v-if="batchEditMode" type="primary" size="small" @click="onConfirmBatchEdit">
          <el-icon><Edit /></el-icon>
          确认编辑
        </el-button>
        <el-button v-if="batchEditMode" size="small" @click="onCancelBatchEdit">取消</el-button>

        <el-button v-if="batchDeleteMode" type="danger" size="small" @click="onConfirmBatchDelete">
          <el-icon><Delete /></el-icon>
          确认删除
        </el-button>
        <el-button v-if="batchDeleteMode" size="small" @click="onCancelBatchDelete">取消</el-button>
      </div>
    </template>

    <!-- 默认模式 -->
    <template v-else>
      <div class="flex gap-2">
        <el-button v-if="canCreate" type="primary" size="small" @click="onCreate">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button v-if="canEdit" type="primary" size="small" @click="onBatchEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button v-if="canDelete" type="danger" size="small" @click="onBatchDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button v-if="canExport" size="small" @click="onExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue'

defineProps({"canCreate":"true","canEdit":"true","canDelete":"true","canExport":"true"})
</script>

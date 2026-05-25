<template>
  <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
    <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
    <div class="flex gap-2">
      <!-- 默认模式 -->
      <template v-if="!batchEditMode && !deleteMode && !exportMode">
        <el-button type="primary" size="small" @click="onAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button :type="filters.showLowStock ? 'warning' : 'default'" size="small" @click="onLowStockToggle">
          <span v-if="lowStockCount > 0" class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-1">{{ lowStockCount }}</span>
          库存不足
        </el-button>
        <el-button type="primary" size="small" @click="onBatchEdit">编辑</el-button>
        <el-button type="danger" size="small" @click="onDelete">删除</el-button>
        <el-button size="small" @click="onExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>

      <!-- 编辑模式 -->
      <template v-if="batchEditMode">
        <el-button type="primary" size="small" @click="onConfirmBatchEdit">
          确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </el-button>
        <el-button size="small" @click="onCancelBatchEdit">取消</el-button>
      </template>

      <!-- 删除模式 -->
      <template v-if="deleteMode && !batchEditMode">
        <el-button type="danger" size="small" @click="onConfirmDelete">
          确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </el-button>
        <el-button size="small" @click="onCancelDelete">取消</el-button>
      </template>

      <!-- 导出模式 -->
      <template v-if="exportMode && !batchEditMode && !deleteMode">
        <el-button type="primary" size="small" @click="onConfirmExport">
          <el-icon><Download /></el-icon>
          确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </el-button>
        <el-button size="small" @click="onCancelExport">取消选择</el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Plus, Download } from '@element-plus/icons-vue'

const props = defineProps({
  title: { type: String, default: '' },
  batchEditMode: { type: Boolean, default: false },
  deleteMode: { type: Boolean, default: false },
  exportMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  lowStockCount: { type: Number, default: 0 },
  filters: { type: Object, default: () => ({ showLowStock: false }) }
})

const emit = defineEmits([
  'add', 'low-stock-toggle', 'batch-edit', 'delete', 'export',
  'confirm-batch-edit', 'cancel-batch-edit',
  'confirm-delete', 'cancel-delete',
  'confirm-export', 'cancel-export'
])

const onAdd = () => emit('add')
const onLowStockToggle = () => emit('low-stock-toggle')
const onBatchEdit = () => emit('batch-edit')
const onDelete = () => emit('delete')
const onExport = () => emit('export')
const onConfirmBatchEdit = () => emit('confirm-batch-edit')
const onCancelBatchEdit = () => emit('cancel-batch-edit')
const onConfirmDelete = () => emit('confirm-delete')
const onCancelDelete = () => emit('cancel-delete')
const onConfirmExport = () => emit('confirm-export')
const onCancelExport = () => emit('cancel-export')
</script>

<template>
  <!-- 操作工具栏组件 - 对应V1.1 ActionToolbar.tsx -->
  <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
    <h2 class="font-semibold text-gray-900 text-lg">{{ title }}</h2>
    <div class="flex gap-2">
      <!-- 默认模式：新增、库存不足、编辑、删除、导出 -->
      <template v-if="!batchEditMode && !deleteMode && !exportMode">
        <el-button v-if="canCreate && onAdd" size="default" type="primary" @click="onAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>

        <el-button
          v-if="showLowStockButton"
          size="default"
          :type="filters.showLowStock ? 'danger' : 'warning'"
          @click="onLowStockToggle"
        >
          <span v-if="lowStockCount > 0" class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-1">
            {{ lowStockCount }}
          </span>
          库存不足
        </el-button>

        <el-button v-if="canEdit" size="default" type="primary" @click="onBatchEdit">
          编辑
        </el-button>

        <el-button v-if="canDelete" size="default" type="danger" @click="onDelete">
          删除
        </el-button>

        <el-button v-if="canExport" size="default" type="primary" @click="onExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>

      <!-- 编辑模式 -->
      <template v-if="batchEditMode">
        <el-button size="default" type="primary" @click="onConfirmBatchEdit">
          确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </el-button>
        <el-button size="default" @click="onCancelBatchEdit">
          取消
        </el-button>
      </template>

      <!-- 删除模式（已知晓后） -->
      <template v-if="deleteMode && !batchEditMode">
        <el-button size="default" type="danger" @click="onConfirmDelete">
          确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </el-button>
        <el-button size="default" @click="onCancelDelete">
          取消
        </el-button>
      </template>

      <!-- 导出模式 -->
      <template v-if="exportMode && !batchEditMode && !deleteMode">
        <el-button size="default" type="primary" @click="onConfirmExport">
          <el-icon><Download /></el-icon>
          确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </el-button>
        <el-button size="default" @click="onCancelExport">
          取消选择
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Plus, Download } from '@element-plus/icons-vue'

/**
 * 操作工具栏组件
 * 提供新增、库存不足、编辑、删除、导出等功能按钮
 */

defineProps({
  // 标题
  title: {
    type: String,
    default: '物料汇总表'
  },
  // 是否为批量编辑模式
  batchEditMode: {
    type: Boolean,
    default: false
  },
  // 是否为删除模式
  deleteMode: {
    type: Boolean,
    default: false
  },
  // 是否为导出模式
  exportMode: {
    type: Boolean,
    default: false
  },
  // 已选择的行
  selectedRows: {
    type: Array,
    default: () => []
  },
  // 低库存数量
  lowStockCount: {
    type: Number,
    default: 0
  },
  // 筛选状态
  filters: {
    type: Object,
    default: () => ({ showLowStock: false })
  },
  // 权限控制
  canCreate: {
    type: Boolean,
    default: true
  },
  canEdit: {
    type: Boolean,
    default: true
  },
  canDelete: {
    type: Boolean,
    default: true
  },
  canExport: {
    type: Boolean,
    default: true
  },
  // 是否显示库存不足按钮
  showLowStockButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'lowStockToggle',
  'batchEdit',
  'delete',
  'export',
  'confirmBatchEdit',
  'cancelBatchEdit',
  'confirmDelete',
  'cancelDelete',
  'confirmExport',
  'cancelExport',
  'add'
])

const onLowStockToggle = () => emit('lowStockToggle')
const onBatchEdit = () => emit('batchEdit')
const onDelete = () => emit('delete')
const onExport = () => emit('export')
const onConfirmBatchEdit = () => emit('confirmBatchEdit')
const onCancelBatchEdit = () => emit('cancelBatchEdit')
const onConfirmDelete = () => emit('confirmDelete')
const onCancelDelete = () => emit('cancelDelete')
const onConfirmExport = () => emit('confirmExport')
const onCancelExport = () => emit('cancelExport')
const onAdd = () => emit('add')
</script>

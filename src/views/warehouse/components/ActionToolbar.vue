<template>
  <!-- 操作工具栏组件 - 对应V1.1 ActionToolbar.tsx -->
  <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
    <h2 class="font-semibold text-gray-900 text-lg">{{ title }}</h2>
    <div class="flex gap-2">
      <!-- 默认模式：新增、库存不足、编辑、删除、导出 -->
      <template v-if="!batchEditMode && !deleteMode && !exportMode">
        <button
          v-if="canCreate && onAdd"
          class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1"
          @click="onAdd"
        >
          <Plus class="w-4 h-4" />新增
        </button>

        <button
          v-if="showLowStockButton"
          class="h-8 px-3 rounded-md text-sm font-medium"
          :class="filters.showLowStock ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'"
          @click="onLowStockToggle"
        >
          <span v-if="lowStockCount > 0" class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-1">
            {{ lowStockCount }}
          </span>
          库存不足
        </button>

        <button v-if="canEdit" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200" @click="onBatchEdit">
          编辑
        </button>

        <button v-if="canDelete" class="h-8 px-3 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200" @click="onDelete">
          删除
        </button>

        <button v-if="canExport" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="onExport">
          <Download class="w-4 h-4" />导出
        </button>
      </template>

      <!-- 编辑模式 -->
      <template v-if="batchEditMode">
        <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="onConfirmBatchEdit">
          确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </button>
        <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="onCancelBatchEdit">
          取消
        </button>
      </template>

      <!-- 删除模式（已知晓后） -->
      <template v-if="deleteMode && !batchEditMode">
        <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="onConfirmDelete">
          确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </button>
        <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="onCancelDelete">
          取消
        </button>
      </template>

      <!-- 导出模式 -->
      <template v-if="exportMode && !batchEditMode && !deleteMode">
        <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="onConfirmExport">
          <Download class="w-4 h-4" />确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </button>
        <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="onCancelExport">
          取消选择
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Plus, Download } from 'lucide-vue-next'

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

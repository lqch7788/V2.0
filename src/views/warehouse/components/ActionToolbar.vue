<template>
  <!-- 操作工具栏组件 - 对应V1.1 ActionToolbar.tsx -->
  <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
    <h2 class="font-semibold text-gray-900 text-lg">{{ title }}</h2>
    <div class="flex gap-2">
      <!-- 默认模式：新增、库存不足、编辑、删除、导出 -->
      <template v-if="!batchEditMode && !deleteMode && !exportMode">
        <button
          v-if="canCreate && onAdd"
          class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
          @click="onAdd"
        >
          <Plus :size="14" />新增
        </button>

        <button
          v-if="showLowStockButton"
          class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1"
          :class="filters.showLowStock ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="onLowStockToggle"
        >
          <span v-if="lowStockCount > 0" class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {{ lowStockCount }}
          </span>
          库存不足
        </button>

        <!-- V1.1 编辑按钮: Edit + Edit2 双图标, variant=blue (blue-600) -->
        <button v-if="canEdit" class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="onBatchEdit">
          <Edit :size="14" /><Edit2 :size="14" />编辑
        </button>

        <button v-if="canDelete" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="onDelete">
          <Trash2 :size="14" />删除
        </button>

        <button v-if="canExport" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="onExport">
          <Download :size="14" />导出
        </button>
      </template>

      <!-- 编辑模式 -->
      <template v-if="batchEditMode">
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="onConfirmBatchEdit">
          <Edit2 :size="14" />确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </button>
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="onCancelBatchEdit">
          <X :size="14" />取消
        </button>
      </template>

      <!-- 删除模式（已知晓后） -->
      <template v-if="deleteMode && !batchEditMode">
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="onConfirmDelete">
          <Trash2 :size="14" />确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </button>
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center gap-1" @click="onCancelDelete">
          <X :size="14" />取消
        </button>
      </template>

      <!-- 导出模式 -->
      <template v-if="exportMode && !batchEditMode && !deleteMode">
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="onConfirmExport">
          <Download :size="14" />确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
        </button>
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center gap-1" @click="onCancelExport">
          <X :size="14" />取消选择
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Plus, Download, Edit, Edit2, Trash2, X } from 'lucide-vue-next'

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
